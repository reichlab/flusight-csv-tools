/**
 * Module for verifying csvs
 */

/**
 * Doc guard
 */
import Csv from './csv'
import { targetIds, regionIds, headers } from './meta'
import { TargetId, RegionId, Bin } from './interfaces'
import * as assert from 'assert'
import * as almostEqual from 'almost-equal'
import * as arrayEqual from 'array-equal'
import * as u from './utils'

/**
 * Check whether the point predictions are alright
 */
export function verifyPoint(csv: Csv) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let bins = csv.getBins(target, region)
      let point = csv.getPoint(target, region)
      assert(
        almostEqual(point, u.bins.inferPoint(bins), almostEqual.FLT_EPSILON),
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
 * Verify that the two csvs are equivalent
 */
export function verifyEquivalence(csv1: Csv, csv2: Csv) {
  // Basic checks
  assert(csv1.model === csv2.model, 'Both csvs should be from the same model')
  assert(csv1.epiweek === csv2.epiweek, 'Both csvs should be for the same epiweek')

  for (let region of regionIds) {
    for (let target of targetIds) {
      assert(
        csv1.getPoint(target, region) === csv2.getPoint(target, region),
        `Point prediction for ${region}, ${target} should match`
      )

      let bins1 = csv1.getBins(target, region)
      let bins2 = csv2.getBins(target, region)
      assert(
        bins1.every((bin1, i) => u.bins.binsEq(bin1, bins2[i])),
        `Bins for ${region}, ${target} should be equal`
      )
    }
  }
}

/**
 * Verify that the probabilities in csv sum to one
 */
export function verifyProbabilities(csv: Csv) {
  targetIds.forEach(target => {
    regionIds.forEach(region => {
      let probabilities = csv.getBins(target, region).map(b => b[2])

      probabilities.forEach(p => {
        assert((p >= 0) && (p <= 1), `Probabilities should be in [0.0, 1.0]`)
      })

      assert(
        almostEqual(probabilities.reduce((x, y) => x + y), 1.0, almostEqual.FLT_EPSILON),
        `Probabilities for target ${target}, region ${region} should sum to 1.0`
      )
    })
  })
}
