// Module for working with truth related data

import { SeasonId, RegionId, TargetId, Epiweek, EpiweekWili, EpiweekWiliLag } from './interfaces'
import { targetIds, regionIds, regionFullName } from './meta'
import * as delphi from './delphi'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'
import * as download from 'download'
import * as arrayEqual from 'array-equal'
import * as u from './utils'

// Url for fetching baseline data from
const BASELINE_URL = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'

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
async function getBaselineData(cacheFile: string): Promise<Array<any>> {
  if (await u.cache.isInCache(cacheFile)) {
    let seasons = (await u.cache.readFromCache(cacheFile))[0].map(d => parseInt(d.split('/')[0]))
    if (seasons.indexOf(u.epiweek.currentSeasonId()) === -1) {
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
export async function getBaseline(region: RegionId, season: SeasonId): Promise<number> {
  let data = await getBaselineData('wILI_Baseline.csv')
  let regionCsvName = regionFullName[region].split(' ').slice(1).join('')
  let seasonCsvName = `${season}/${season + 1}`
  let colIdx = data[0].indexOf(seasonCsvName)
  return data.find(row => row[0] === regionCsvName)[colIdx]
}

/**
 * Return season data for the given lag value (or latest). Return value is an
 * object keyed by region ids having a list of { epiweek, wili } items as values
 */
export async function getSeasonData(season: SeasonId, lag?: number): Promise<{ [R in RegionId] : EpiweekWili[] }> {
  let cacheFile = `seasondata-${season}-lag-${lag || 'latest'}-${u.epiweek.currentEpiweek()}.json`

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
      console.log(`Warning: Delphi api says "${data.message}" for ${season}, lag ${lag || 'latest'}.`)
      return null
    }
  }
}

/**
 * Same as getSeasonDataLatestLag but works on a list of seasons and return
 * Promise.all value
 */
export function getSeasonsData(seasons: SeasonId[], lag?: number): Promise<{ [R in RegionId] : EpiweekWili[] }[]> {
  return Promise.all(seasons.map(s => getSeasonData(s, lag)))
}

/**
 * Return season data for all the lag values from 0 to 52. Return value is an object keyed
 * by region ids having a list of { epiweek, wili, { lagData: [{ lag, wili } ...] }} items
 * as values
 */
export async function getSeasonDataAllLags(season: SeasonId): Promise<{ [R in RegionId] : EpiweekWiliLag[] }> {
  let lags = [...Array(52).keys()]

  let latestData = (await getSeasonData(season)) as { [R in RegionId] : EpiweekWiliLag[] }
  let lagData = await Promise.all(lags.map(l => getSeasonData(season, l)))

  regionIds.forEach(rid => {
    latestData[rid].forEach(({ epiweek, wili }, idx) => {
      let lagValues = lagData
        .filter(d => d)
        .map((ld, idx) => {
          let lagItem
          if (ld[rid]) lagItem = ld[rid].find(d => d.epiweek === epiweek)
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

/**
 * Return peak and peak-wk after checking if we have all available data for the season
 */
function parsePeak(ewPairs: EpiweekWili[], allEpiweeks: Epiweek[]): { [index: string]: number } {
  // Check if we have all the weeks available
  if (arrayEqual(ewPairs.map(ew => ew.epiweek).sort((a, b) => a - b), allEpiweeks)) {
    let peak = Math.max(...ewPairs.map(ew => ew.wili))
    return { peak, 'peak-wk': ewPairs.find(ew => ew.wili === peak).epiweek }
  } else {
    return { peak: null, 'peak-wk': null }
  }
}

/**
 * Return onset week
 * TODO: Verify that this is correct
 */
function parseOnset(ewPairs: EpiweekWili[], baseline: number): number {
  let onset = null
  let carry = 0

  for (let ew of ewPairs) {
    if (ew.wili >= baseline) {
      if (carry === 0) {
        onset = ew.epiweek
      }
      carry += 1
    } else {
      carry = 0
    }

    if (carry >= 3) {
      return onset
    }
  }

  return onset
}

/**
 * Return nAhead week ahead truth value starting at startAt
 */
function parseWeekAhead(ewPairs: EpiweekWili[], startAt: Epiweek, nAhead: number): number {
  let futureEpiweek = u.epiweek.epiweekWithDiff(startAt, nAhead)
  let futureEw = ewPairs.find(({ epiweek }) => epiweek === futureEpiweek)
  return futureEw ? futureEw.wili : null
}

/**
 * Find true target values for given season. Return a promise of an object keyed by region
 * id having a list of { target: truth } items
 */
export async function getSeasonTruth(season: SeasonId): Promise<{ [index: string]: { [index: string]: number }[] }> {
  let seasonData = await getSeasonData(season)
  let allEpiweeks = u.epiweek.seasonEpiweeks(season)

  let truth: { [index: string]: { [index: string]: number }[] } = {}

  for (let region of regionIds) {
    let regionSub = seasonData ? seasonData[region] : []
    truth[region] = []

    // Find truth for seasonal targets
    let regionPeak = parsePeak(regionSub, allEpiweeks)
    let baseline = await getBaseline(region, season)
    let regionOnset = parseOnset(regionSub, baseline)

    for (let epiweek of allEpiweeks) {
      truth[region].push({
        epiweek,
        '1-ahead': parseWeekAhead(regionSub, epiweek, 1),
        '2-ahead': parseWeekAhead(regionSub, epiweek, 2),
        '3-ahead': parseWeekAhead(regionSub, epiweek, 3),
        '4-ahead': parseWeekAhead(regionSub, epiweek, 4),
        'onset-wk': regionOnset,
        ...regionPeak
      })
    }
  }

  return truth
}
