// Module for working with truth related data

import * as path from 'path'
import * as fs from 'fs-extra'
import * as Papa from 'papaparse'
import { userCacheDir } from 'appdirs'
import { SeasonId, RegionId } from './interfaces'
import { regionFullName } from './meta'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'
import * as download from 'download'
import * as memoize from 'fast-memoize'

// Url for fetching baseline data from
const BASELINE_URL = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'
const CACHE_DIR = path.join(userCacheDir(), 'flusight-csv-tools')

/**
 * Return id for current season
 */
function currentSeasonId(): SeasonId {
  let mdate = new mmwr.MMWRDate()
  mdate.fromMomentDate(moment())
  return mdate.week >= 30 ? mdate.year : mdate.year - 1
}

/**
 * Read csv using papaparse
 * @param fileName
 */
async function readCsv(fileName: string): Promise<Array<any>> {
  return Papa.parse((await fs.readFile(fileName, 'utf8')).trim(), {
    dynamicTyping: true
  }).data
}

/**
 * Download baseline csv file to given path and return a promise for the path
 * @param outputFile
 */
export async function downloadBaseline(outputFile: string): Promise<string> {
  return download(BASELINE_URL).then(data => {
    fs.writeFile(outputFile, data).then(() => outputFile)
  })
}

/**
 * Ensure that an updated baseline csv is available in cache and
 * return the data
 * @param fileName
 */
async function getBaselineData(fileName: string): Promise<Array<any>> {
  if (await fs.pathExists(fileName)) {
    let seasons = (await readCsv(fileName))[0].map(d => parseInt(d.split('/')[0]))
    if (seasons.indexOf(currentSeasonId()) === -1) {
      console.log('Baseline file not valid, downloading...')
      await downloadBaseline(fileName)
    }
  } else {
    console.log('Baseline file not found, downloading...')
    await downloadBaseline(fileName)
  }
  return await readCsv(fileName)
}

/**
 * Return baseline value
 * @param region
 * @param season
 */
async function getBaselineUnopt(region: RegionId, season: SeasonId): Promise<number> {
  await fs.ensureDir(CACHE_DIR)
  let data = await getBaselineData(path.join(CACHE_DIR, 'wILI_Baseline.csv'))
  let regionCsvName = regionFullName[region].split(' ').slice(1).join('')
  let seasonCsvName = `${season}/${season + 1}`
  let colIdx = data[0].indexOf(seasonCsvName)
  return data.find(row => row[0] === regionCsvName)[colIdx]
}

/**
 * Memoized version of getBaselineUnopt
 */
export const getBaseline = memoize(getBaselineUnopt)
