// Module for working with Bins

import * as almostEqual from 'almost-equal'
import { Bin, TargetId } from '../interfaces'
import { targetType } from '../meta'
import { isInCache } from './cache';

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
 * Compare plain percent values
 */
function comparePercents(a: number, b: number): number {
  return a - b
}
/**
 * Compare bins of percent type (week ahead and peak bins)
 */
function comparePercentBins(a: Bin, b: Bin): number {
  return comparePercents(a[0], b[0])
}

/**
 * Compare week values
 */
function compareWeeks(a: number, b: number): number {
  if ((a >= 30) && (b < 30)) {
    return -1
  } else if ((a < 30) && (b >= 30)) {
    return 1
  } else {
    return a - b
  }
}

/**
 * Compare bins of week type (onset-wk and peak-wk)
 */
function compareWeekBins(a: Bin, b: Bin): number {
  return compareWeeks(a[0], b[0])
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
 * Return bin in which the given value lies. Assume bins are properly sorted.
 * `value` can be null, in which case we look for the last bin (which is onset bin).
 */
export function binFor(bins: Bin[], value: number, target: TargetId): Bin {
  let tolerance = 0.000000001
  let binType = targetType[target]
  let notFoundError = new Error('Bin value not found')
  let comparator

  // Setup comparator function
  if (binType === 'percent') {
    comparator = comparePercents
  } else if (binType === 'week') {
    comparator = compareWeeks

    // We are looking for none bin of onset
    if (value === null) {
      if (bins[bins.length - 1][0] === null) {
        return bins[bins.length - 1]
      } else {
        throw notFoundError
      }
    }

    // Work only with ints for weeks
    value = Math.floor(value)

    let nWeeks = Math.max(...bins.filter(b => b).map(b => b[0]))
    if (value === 0) {
      // If we have 0, use the last week of season's first year instead
      value = nWeeks
    } else if (value > nWeeks) {
      throw notFoundError
    }
  }

  // Find bin range for rejecting values
  let binMin = bins[0][0]
  let binMax = (bins[bins.length - 1][0] === null) ? bins[bins.length - 2][1] : bins[bins.length - 1][1]

  if ((comparator(value, binMin - tolerance) < 0)
      || (comparator(value, binMax + tolerance) > 0)) {
    throw notFoundError
  }

  for (let bin of bins) {
    if (almostEqual(bin[1], value, tolerance)) {
      // Its the next bin
      continue
    } else {
      if ((comparator(bin[1], (value - tolerance)) > 0)
          || (almostEqual(bin[1], (value - tolerance), tolerance))) {
        return bin
      }
    }
  }

  // In unexpected situation
  throw notFoundError
}
