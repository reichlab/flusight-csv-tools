// Module for working with truth related data

import * as path from 'path'
import * as fs from 'fs-extra'
import * as Papa from 'papaparse'
import { userCacheDir } from 'appdirs'
import { SeasonId, RegionId, Epiweek } from './interfaces'
import { regionIds, regionFullName } from './meta'
import * as delphi from './delphi'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'
import * as download from 'download'
import * as memoize from 'fast-memoize'
import { ensureDir } from 'fs-extra';

// Url for fetching baseline data from
const BASELINE_URL = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'
const CACHE_DIR = path.join(userCacheDir(), 'flusight-csv-tools')


/**
 * Return current epiweek
 */
export function currentEpiweek(): Epiweek {
  let mdate = new mmwr.MMWRDate()
  mdate.fromMomentDate(moment())
  return mdate.year * 100 + mdate.week
}

/**
 * Return id for current season
 */
export function currentSeasonId(): SeasonId {
  let ew = currentEpiweek()
  let year = Math.trunc(ew / 100)
  return (ew % 100 >= 30) ? year : year - 1
}

/**
 * Tell if the file is present in cache
 */
async function isInCache(fileName: string): Promise<boolean> {
  await fs.ensureDir(CACHE_DIR)
  return await fs.pathExists(path.join(CACHE_DIR, fileName))
}

/**
 * Read csv using papaparse
 */
async function readCsv(fileName: string): Promise<Array<any>> {
  return Papa.parse((await fs.readFile(fileName, 'utf8')).trim(), {
    dynamicTyping: true
  }).data
}

/**
 * Download baseline csv file to given path and return a promise for the path
 */
async function downloadBaseline(outputFile: string): Promise<string> {
  let data = await download(BASELINE_URL)
  await fs.writeFile(outputFile, data)
  return outputFile
}

/**
 * Ensure that an updated baseline csv is available in cache and
 * return the data
 */
export async function getBaselineData(fileName: string): Promise<Array<any>> {
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

/**
 * Return season data for the given lag value (or latest). Return value is an
 * object keyed by region ids having a list of { epiweek, wili } items as values
 */
export async function getSeasonData(season: SeasonId, lag?: number): Promise<any> {
  let data = await delphi.requestSeasonData(season, lag)
  if (data.message === 'success') {
    return data.epidata
      .sort((a, b) => a.epiweek - b.epiweek)
      .reduce((acc, { epiweek, region, wili }) => {
        acc[region] = acc[region] || []
        acc[region].push({ epiweek, wili })
        return acc
      }, {})
  } else {
    console.log(`Warning: Delphi api says "${data.message}" for ${season}, lag ${lag}.`)
    return null
  }
}

/**
 * Same as getSeasonDataLatestLag but works on a list of seasons and return
 * Promise.all value
 */
export function getSeasonsData(seasons: SeasonId[], lag?: number): Promise<any[]> {
  return Promise.all(seasons.map(s => getSeasonData(s, lag)))
}

/**
 * Return season data for all the lag values from 0 to 52. Return value is an object keyed
 * by region ids having a list of { epiweek, wili, { lagData: [{ lag, wili } ...] }} items
 * as values
 */
export async function getSeasonDataAllLags(season: SeasonId): Promise<any> {
  let lags = [...Array(52).keys()]

  let latestData = await getSeasonData(season)
  let lagData = await Promise.all(lags.map(l => getSeasonData(season, l)))

  regionIds.forEach(rid => {
    latestData[rid].forEach(({ epiweek, wili }, idx) => {
      let lagValues = lagData
        .filter(d => d)
        .map((ld, idx) => {
          let lagItem = ld[rid].find(d => d.epiweek === epiweek)
          return lagItem ? { epiweek: lagItem.epiweek, wili: lagItem.wili, lag: lags[idx] } : null
        })
        .filter(d => d)
        .sort((a, b) => b.lag - a.lag)
        .map(({ lag, wili }) => { return { lag, wili } })

      latestData[rid][idx] = { epiweek, wili, lagData: lagValues }
    })
  })
  return latestData
}
