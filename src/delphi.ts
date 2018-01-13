/**
 * Module to collect data from delphi epidata API (https://github.com/cmu-delphi/delphi-epidata)
 */

/**
 * Doc guard
 */
import * as rp from 'request-promise-native'
import * as buildUrl from 'build-url'
import { SeasonId } from './interfaces'
import { regionIds } from './meta'

/**
 * Root url for the delphi API
 */
const API_ROOT = 'https://delphi.midas.cs.cmu.edu/epidata/api.php/'

/**
 * Build url for API request. The url represents a request for all weeks
 * in a single epidemic season, all regions and single lag value.
 * Lag can be skipped if needing latest issue (with max lag value)
 */
function getSeasonRequestUrl(season: SeasonId, lag?: number): string {
  let url = buildUrl(API_ROOT, {
    queryParams: {
      epiweeks: `${season * 100 + 30}-${(season + 1) * 100 + 29}`,
      source: 'fluview',
      regions: regionIds
    }
  })

  return lag ? `${url}&lag=${lag}` : url
}

/**
 * Return a promise with data from delphi epidata API
 * Note that the API only allows 3650 items for each request
 * (https://github.com/cmu-delphi/delphi-epidata/issues/1#issuecomment-308502781)
 * Collecting data for a season (with one lag value) with all regions amounts
 * to max of 520 results
 */
export function requestSeasonData(season: SeasonId, lag?: number): Promise<any> {
  return rp({ uri: getSeasonRequestUrl(season, lag), json: true })
}
