import Submission from './submission'
import { targetIds, regionIds, headers } from './meta'
import { TargetId, RegionId, Bin } from './interfaces'
import * as assert from 'assert'
import { almostEqual } from 'almost-equal'
import * as arrayEqual from 'array-equal'

/**
 * Tell whether the bins have uniform distribution
 */
function isUniform(bins: Bin[]): boolean {
  // Skip the last bin which is sometimes different since that bin contains, e.g.
  // all wili values from 13 to 100
  return bins.slice(0, bins.length - 1).every(bin => almostEqual(bin[2], bins[0][2]))
}

/**
 * Infer point probability value for the submission using bins
 */
function inferPoint(sub: Submission, target: TargetId, region: RegionId): number {
  let bins = sub.getBins(target, region)

  if (isUniform(bins)) {
    return bins[Math.floor(bins.length / 2)][0]
  } else {
    let pointBin = bins.reduce((acc, item) => {
      return (acc[2] < item[2]) ? item : acc
    }, bins[0])
  }
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
