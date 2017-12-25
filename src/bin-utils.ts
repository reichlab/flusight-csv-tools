// Utilities for working with array of bins

import * as almostEqual from 'almost-equal'
import { Bin } from './interfaces'

/**
 * Tell whether the bins represent
 */
export function isUniform(bins: Bin[]): boolean {
  // Skip the last bin which is sometimes different since that bin contains, e.g.
  // all wili values from 13 to 100
  return bins.slice(0, bins.length - 1).every(bin => almostEqual(bin[2], bins[0][2]))
}

/**
 * Infer point probability value for the bins
 */
export function inferPoint(bins: Bin[]): number {
  if (isUniform(bins)) {
    return bins[Math.floor(bins.length / 2)][0]
  } else {
    let pointBin = bins.reduce((acc, item) => {
      return (acc[2] < item[2]) ? item : acc
    }, bins[0])
  }
}

/**
 * Reduce the bins by summing probabilities for batches.
 */
export function sliceSumBins(bins: Bin[], batch: number): Bin[] {
  return bins.reduce((acc: Bin[], bin: Bin, idx: number): Bin[] => {
    let sIdx = Math.floor(idx / batch)
    if (acc[sIdx]) {
      acc[sIdx][2] += bin[2]
      acc[sIdx][1] = bin[1]
    } else {
      acc.push(bin)
    }
    return acc
  }, [])
}
