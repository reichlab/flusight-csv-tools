import Submission from './submission'
import { targetIds, regionIds, headers } from './meta'
import { TargetId, RegionId } from './interfaces'
import * as assert from 'assert'
import { almostEqual } from 'almost-equal'
import * as arrayEqual from 'array-equal'

/**
 * Infer point probability value for the submission using bins
 */
function inferPoint(sub: Submission, target: TargetId, region: RegionId): number {
  let bins = sub.getBins(target, region)
  return bins[0][2]
}

/**
 * Check whether the point predictions are alright
 */
export function verifyPoint(sub: Submission) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      assert(
        almostEqual(sub.getPoint(target, region), inferPoint(sub, target, region)),
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
