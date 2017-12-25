import Submission from './submission'
import { targetIds, regionIds, headers } from './meta'
import { TargetId, RegionId, Bin } from './interfaces'
import * as assert from 'assert'
import * as almostEqual from 'almost-equal'
import * as arrayEqual from 'array-equal'
import { inferPoint } from './bin-utils'

/**
 * Check whether the point predictions are alright
 */
export function verifyPoint(sub: Submission) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let bins = sub.getBins(target, region)
      let point = sub.getPoint(target, region)
      assert(
        almostEqual(point, inferPoint(bins)),
        `Point for target ${target}, region ${region} should be equal to inferred.`
      )
    })
  })
}

/**
 * Check where the headers match the default (in lower case)
 */
export function verifyHeaders(sub: Submission) {
  assert(arrayEqual(sub.headers.map(h => h.toLowerCase()), headers))
}

/**
 * Verify that the probabilities in submission sum to one
 * @param sub
 */
export function verifyProbabilities(sub: Submission) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let probabilities = sub.getBins(target, region).map(b => b[2])
      assert(
        almostEqual(probabilities.reduce((x, y) => x + y), 1.0),
        `Probabilities for target ${target}, region ${region} should sum to 1.0`
      )
    })
  })
}
