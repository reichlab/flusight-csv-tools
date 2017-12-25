// Module to collect data from delphi epidata API (https://github.com/cmu-delphi/delphi-epidata)

import * as rp from 'request-promise-native'
import * as buildUrl from 'build-url'
import { SeasonId } from './interfaces'
import { regionIds } from './meta'

const API_ROOT = 'https://delphi.midas.cs.cmu.edu/epidata/api.php/'

/**
 * Build url for API request. The url represents a request for all weeks
 * in a single epidemic season, all regions and 1 lag value.
 */
function getSeasonRequestUrl(season: SeasonId, lag: number): string {
  return buildUrl(API_ROOT, {
    queryParams: {
      epiweeks: `${season * 100 + 30}-${(season + 1) * 100 + 29}`,
      source: 'fluview',
      regions: regionIds,
      lag: lag
    }
  })
}

/**
 * Return a promise with data from delphi epidata API
 */
export function getSeasonData(season: SeasonId, lag: number): Promise<any> {
  return rp({ uri: getSeasonRequestUrl(season, lag), json: true })
}
