/**
 * Module for scoring related functions
 */

/**
 * Doc guard
 */
import Csv from './csv'
import moize from 'moize'
import * as truth from './truth'
import * as u from './utils'
import { regionIds, targetIds, scoreIds, targetType } from './meta'
import { Score, RegionTargetIndex } from './interfaces'

/**
 * Memoized version of getSeasonTruth since there will be a lot of
 * csvs with the same season
 */
const getSeasonTruthMem = moize(truth.getSeasonTruth, { isPromise: true })

/**
 * Aggregate the scores by taking mean
 */
export function meanScores (scores: RegionTargetIndex<Score>[]): RegionTargetIndex<Score> {
  let meanScores: RegionTargetIndex<Score> = {}

  for (let region of regionIds) {
    meanScores[region] = {}
    for (let target of targetIds) {
      meanScores[region][target] = {} as Score
      for (let scoreId of scoreIds) {
        if (scoreId === 'error') {
          // Return null since mean of error is useless
          meanScores[region][target][scoreId] = null
        } else {
          let scoreValues = scores.map(s => s[region][target][scoreId]).filter(s => s !== null)
          meanScores[region][target][scoreId] = scoreValues.reduce((a, b) => a + b, 0)
          meanScores[region][target][scoreId] /= scoreValues.length
        }
      }
    }
  }

  return meanScores
}

/**
 * Return scores for all the regions and targets in the csv
 */
export async function score(csv: Csv): Promise<RegionTargetIndex<Score>> {
  let seasonTruth = await getSeasonTruthMem(csv.season)

  let scores: RegionTargetIndex<Score> = {}

  for (let region of regionIds) {
    scores[region] = {}
    let trueValues = seasonTruth[region].find(({ epiweek }) => csv.epiweek === epiweek)

    for (let target of targetIds) {
      let trueValue = trueValues[target]

      if ((target !== 'onset-wk') && (trueValue === null)) {
        // Only onset-wk can have null true value
        scores[region][target] = { logScore: null, error: null, absError: null }
      } else {
        let pointEstimate = csv.getPoint(target, region)
        let error

        let trueProbability = null
        try {
          trueProbability = u.bins.binFor(csv.getBins(target, region), trueValue, target)[2]
        } catch (e) {
          // Error in finding true bin, leaving probability as null
        }
        let logScore = trueProbability !== null ? Math.log(trueProbability) : null

        if (targetType[target] === 'percent') {
          error = pointEstimate !== null ? trueValue - pointEstimate : null
        } else if (targetType[target] === 'week') {
          error = pointEstimate !== null ? u.epiweek.getEpiweekDiff(trueValue, pointEstimate) : null
        }

        scores[region][target] = { logScore, error, absError: Math.abs(error) }
      }
    }
  }

  return scores
}
