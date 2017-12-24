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
const baselineUrl = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'
const cacheDir = path.join(userCacheDir(), 'flusight-csv-tools')

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
function readCsv(fileName: string) {
  return Papa.parse(fs.readFileSync(fileName, 'utf8').trim(), {
    dynamicTyping: true
  }).data
}

/**
 * Ensure that an updated baseline csv is available in cache and
 * return the data
 * @param fileName
 */
function getBaselineData(fileName: string) {
  if (fs.pathExistsSync(fileName)) {
    let seasons = readCsv(fileName)[0].map(d => parseInt(d.split('/')[0]))
    if (seasons.indexOf(currentSeasonId()) === -1) {
      console.log('Baseline file not valid, downloading...')
      download(baselineUrl).pipe(fs.createWriteStream(fileName))
    }
  } else {
    console.log('Baseline file not found, downloading...')
    download(baselineUrl).pipe(fs.createWriteStream(fileName))
  }
  return readCsv(fileName)
}

/**
 * Return baseline value
 * @param region
 * @param season
 */
function getBaselineRaw(region: RegionId, season: SeasonId): number {
  fs.ensureDirSync(cacheDir)
  let data = getBaselineData(path.join(cacheDir, 'wILI_Baseline.csv'))
  let regionCsvName = regionFullName[region].split(' ').slice(1).join('')
  let seasonCsvName = `${season}/${season + 1}`

  let colIdx = data[0].indexOf(seasonCsvName)
  return data.find(row => row[0] === regionCsvName)[colIdx]
}

/**
 * Memoized version of getBaselineRaw
 */
export const getBaseline = memoize(getBaselineRaw)
