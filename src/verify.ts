import Submission from './submission'
import { targetIds, regionIds } from './meta'
import { TargetId, RegionId } from 'src/interfaces'
import * as assert from 'assert'
import { almostEqual } from 'almost-equal'

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
export function checkPoint(sub: Submission) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      assert(
        almostEqual(sub.getPoint(target, region), inferPoint(sub, target, region)),
        `Point for target ${target}, region ${region} should be equal to inferred.`
      )
    })
  })
}
