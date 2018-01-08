import { SeasonId, Epiweek, EpiweekWiliLag } from '../interfaces'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'

/**
 * Return current epiweek
 */
export function currentEpiweek(): Epiweek {
  let mdate = new mmwr.MMWRDate(0)
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
export function epiweekWithDiff(epiweek: Epiweek, diff: number): Epiweek {
  let mdate = new mmwr.MMWRDate(0)
  mdate.fromEpiweek(epiweek)
  mdate.applyWeekDiff(diff)
  return mdate.toEpiweek()
}

/**
 * Return equivalent of first - second in epiweek scale
 */
export function getEpiweekDiff(first: Epiweek, second: Epiweek): number {
  let firstDate = new mmwr.MMWRDate(0)
  let secondDate = new mmwr.MMWRDate(0)

  firstDate.fromEpiweek(first)
  secondDate.fromEpiweek(second)

  return firstDate.diffWeek(secondDate)
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
