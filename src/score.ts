import Csv from './csv'
import * as memoize from 'fast-memoize'
import * as truth from './truth'
import * as u from './utils'
import { regionIds, targetIds, targetType } from './meta'
import { Score } from './interfaces'

/**
 * Memoized version of getSeasonTruth since there will be a lot of
 * csvs with the same season
 */
const getSeasonTruthMem = memoize(truth.getSeasonTruth)

/**
 * Return scores for all the regions and targets in the csv
 */
export async function score(csv: Csv): Promise<{ [index: string]: { [index: string]: Score } }> {
  let seasonTruth = await getSeasonTruthMem(csv.season)

  let scores: { [index: string]: { [index: string]: Score } } = {}

  for (let region of regionIds) {
    scores[region] = {}
    let trueValues = seasonTruth[region].find(({ epiweek }) => csv.epiweek === epiweek)

    for (let target of targetIds) {
      let trueValue = trueValues[target]

      if ((target !== 'onset-wk') && (trueValue === null)) {
        // Only onset-wk can have null true value
        scores[region][target] = { logScore: null, error: null }
      } else {
        let pointEstimate = csv.getPoint(target, region)
        let error

        let trueProbability = u.bins.binFor(csv.getBins(target, region), trueValue, target)[2]
        let logScore = trueProbability !== null ? Math.log(trueProbability) : null

        if (targetType[target] === 'percent') {
          error = pointEstimate !== null ? trueValue - pointEstimate : null
        } else if (targetType[target] === 'week') {
          error = pointEstimate !== null ? u.epiweek.getEpiweekDiff(trueValue, pointEstimate) : null
        }

        scores[region][target] = { logScore, error }
      }
    }
  }

  return scores
}
