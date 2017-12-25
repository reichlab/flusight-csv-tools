import Csv from './csv'
import { targetIds, regionIds, headers } from './meta'
import { TargetId, RegionId, Bin } from './interfaces'
import * as assert from 'assert'
import * as almostEqual from 'almost-equal'
import * as arrayEqual from 'array-equal'
import { inferPoint } from './bin-utils'

/**
 * Check whether the point predictions are alright
 */
export function verifyPoint(csv: Csv) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let bins = csv.getBins(target, region)
      let point = csv.getPoint(target, region)
      assert(
        almostEqual(point, inferPoint(bins), almostEqual.FLT_EPSILON),
        `Point for target ${target}, region ${region} should be equal to inferred.`
      )
    })
  })
}

/**
 * Check where the headers match the default (in lower case)
 */
export function verifyHeaders(csv: Csv) {
  assert(arrayEqual(csv.headers.map(h => h.toLowerCase()), headers))
}

/**
 * Verify that the probabilities in csv sum to one
 * @param csv
 */
export function verifyProbabilities(csv: Csv) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let probabilities = csv.getBins(target, region).map(b => b[2])
      assert(
        almostEqual(probabilities.reduce((x, y) => x + y), 1.0, almostEqual.FLT_EPSILON),
        `Probabilities for target ${target}, region ${region} should sum to 1.0`
      )
    })
  })
}
