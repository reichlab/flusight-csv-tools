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
import { regionIds, targetIds, targetType } from './meta'
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
  let scoreIds = ['logScore', 'error']
  let meanScores: RegionTargetIndex<Score> = {}

  for (let target of targetIds) {
    meanScores[target] = {}
    for (let region of regionIds) {
      meanScores[target][region] = {} as Score
      for (let scoreId of scoreIds) {
        meanScores[target][region][scoreId] = scores.map(s => s[target][region][scoreId]).reduce((a, b) => a + b, 0)
        meanScores[target][region][scoreId] /= scores.length
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
