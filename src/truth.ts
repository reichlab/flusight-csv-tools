// Module for working with truth related data

import { SeasonId, RegionId, Epiweek } from './interfaces'
import { regionIds, regionFullName } from './meta'
import * as delphi from './delphi'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'
import * as download from 'download'
import * as memoize from 'fast-memoize'
import * as u from './utils'

// Url for fetching baseline data from
const BASELINE_URL = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'

/**
 * Return current epiweek
 */
export function currentEpiweek(): Epiweek {
  let mdate = new mmwr.MMWRDate()
  mdate.fromMomentDate(moment())
  return mdate.year * 100 + mdate.week
}

/**
 * Return seasons for given epiweek. Assume seasons start from
 * mmwr-week 30 and end on next year's week 29
 */
export function seasonFromEpiweek(epiweek: Epiweek): SeasonId {
  let year = Math.trunc(epiweek / 100)
  return (epiweek % 100 >= 30) ? year : year - 1
}

/**
 * Return epiweek with diff number of weeks added
 */
export function epiweekDiff(epiweek: Epiweek, diff: number): Epiweek {
  let mdate = new mmwr.MMWRDate()
  mdate.fromEpiweek(epiweek)
  mdate.applyWeekDiff(diff)
  return mdate.toEpiweek()
}

/**
 * Return id for current season
 */
export function currentSeasonId(): SeasonId {
  return seasonFromEpiweek(currentEpiweek())
}

/**
 * Return a list of epiweeks in the season provided
 */
export function seasonEpiweeks(season: SeasonId): Epiweek[] {
  let arange = (a, b) => [...Array(b - a).keys()].map(i => i + a)
  let maxWeek = (new mmwr.MMWRDate(season, 30)).nWeeks
  return [
    ...arange(100 * season + 30, 100 * season + maxWeek + 1),
    ...arange(100 * (season + 1) + 1, 100 * (season + 1) + 30)
  ]
}

/**
 * Download baseline csv file to given path and return a promise for the path
 */
async function downloadBaseline(cacheFile: string): Promise<string> {
  let data = await download(BASELINE_URL)
  await u.cache.writeInCache(cacheFile, data)
  return cacheFile
}

/**
 * Ensure that an up to date baseline csv is available in cache and
 * return the data
 */
export async function getBaselineData(cacheFile: string): Promise<Array<any>> {
  if (await u.cache.isInCache(cacheFile)) {
    let seasons = (await u.cache.readFromCache(cacheFile))[0].map(d => parseInt(d.split('/')[0]))
    if (seasons.indexOf(currentSeasonId()) === -1) {
      console.log('Baseline file not valid, downloading...')
      await downloadBaseline(cacheFile)
    }
  } else {
    console.log('Baseline file not found, downloading...')
    await downloadBaseline(cacheFile)
  }
  return await u.cache.readFromCache(cacheFile)
}

/**
 * Return baseline value
 */
async function getBaselineUnopt(region: RegionId, season: SeasonId): Promise<number> {
  let data = await getBaselineData('wILI_Baseline.csv')
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
  let cacheFile = `seasondata-${season}-lag-${lag || 'latest'}-${currentEpiweek()}.json`

  if (await u.cache.isInCache(cacheFile)) {
    return await u.cache.readFromCache(cacheFile)
  } else {
    let data = await delphi.requestSeasonData(season, lag)
    if (data.message === 'success') {
      let formattedData = data.epidata
        .sort((a, b) => a.epiweek - b.epiweek)
        .reduce((acc, { epiweek, region, wili }) => {
          acc[region] = acc[region] || []
          acc[region].push({ epiweek, wili })
          return acc
        }, {})
      await u.cache.writeInCache(cacheFile, JSON.stringify(formattedData))
      return formattedData
    } else {
      console.log(`Warning: Delphi api says "${data.message}" for ${season}, lag ${lag}.`)
      return null
    }
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

export async function getTrueOnset(epiweek: Epiweek, region: RegionId): Promise<number> {
  return null
}
