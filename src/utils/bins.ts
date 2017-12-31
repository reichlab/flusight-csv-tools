// Module for working with Bins

import * as almostEqual from 'almost-equal'
import { Bin, TargetId } from '../interfaces'
import { targetType } from '../meta'

/**
 * Tell whether the bins represent
 */
export function isUniform(bins: Bin[]): boolean {
  // Skip the last bin which is sometimes different since that bin contains, e.g.
  // all wili values from 13 to 100
  return bins.slice(0, bins.length - 1).every(bin => almostEqual(bin[2], bins[0][2], almostEqual.FLT_EPSILON))
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

/**
 * Compare bins of percent type (week ahead and peak bins)
 */
function comparePercentBins(a: Bin, b: Bin): number {
  return a[0] - b[0]
}

/**
 * Compare bins of week type (onset-wk and peak-wk)
 */
function compareWeekBins(a: Bin, b: Bin): number {
  if ((a[0] >= 30) && (b[0] < 30)) {
    return -1
  } else if ((a[0] < 30) && (b[0] >= 30)) {
    return 1
  } else {
    return a[0] - b[0]
  }
}

/**
 * Sort bins appropriately using the target information
 */
export function sortBins(bins: Bin[], target: TargetId): Bin[] {
  // Extract none value separately and push it in the end
  let noneVal = null
  if (target === 'onset-wk') {
    let noneIdx = bins.findIndex(b => b[0].toString() === 'none')
    noneVal = bins[noneIdx][2]
    bins.splice(noneIdx, 1)
  }
  bins = bins.sort(targetType[target] === 'percent' ? comparePercentBins : compareWeekBins)
  if (noneVal !== null) bins.push([null, null, noneVal])
  return bins
}

/**
 * Return bin in which the given value lies
 */
export function binFor(bins: Bin[], value: number): Bin {
  // TODO
  return bins[0]
}
