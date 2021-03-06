/**
 * Module for working with Bins
 */

/**
 * Doc guard
 */
import * as almostEqual from 'almost-equal'
import { Epiweek, Bin, TargetId } from '../interfaces'
import { targetType } from '../meta'
import { isInCache } from './cache';

const TOLERANCE = 0.000000001

/**
 * Tell whether the bins represent a uniform distribution
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
      acc.push(bin.slice() as Bin)
    }
    return acc
  }, [])
}

/**
 * Sort bins appropriately using the target information
 */
export function sortBins(bins: Bin[], target: TargetId): Bin[] {
  // Extract none value separately and push it in the end
  let noneVal = null
  if (target === 'onset-wk') {
    let noneIdx = bins.findIndex(b => b[0] === null)
    noneVal = bins[noneIdx][2]
    bins.splice(noneIdx, 1)
  }
  bins = bins.sort((a, b) => a[0] - b[0])
  if (noneVal !== null) bins.push([null, null, noneVal])
  return bins
}

/**
 * Return bin index in which the given value lies. Assume bins are properly sorted.
 * `value` can be null, in which case we look for the last bin (which is onset bin).
 */
export function findBinIndex(bins: Bin[], value: number, target: TargetId): number {
  let binType = targetType[target]
  let notFoundError = new Error('Bin value not found')

  if (binType === 'week') {
    // We are looking for none bin of onset
    if (value === null) {
      if (bins[bins.length - 1][0] === null) {
        return bins.length - 1
      } else {
        throw notFoundError
      }
    }

    // Truncating tail if it gets in somehow
    value = Math.floor(value)

    // For week case, we just need to search the bin starts
    let binIdx = bins.findIndex(b => almostEqual(b[0], value, TOLERANCE))

    if (binIdx > -1) {
      return binIdx
    } else {
      throw notFoundError
    }

  } else if (binType === 'percent') {
    // Find bin range for rejecting values
    let binMin = bins[0][0]
    let binMax = (bins[bins.length - 1][0] === null) ? bins[bins.length - 2][1] : bins[bins.length - 1][1]

    if (((value - (binMin - TOLERANCE)) < 0)
        || ((value - (binMax + TOLERANCE)) > 0)) {
      throw notFoundError
    }

    for (let i = 0; i < bins.length; i++) {
      if (almostEqual(bins[i][1], value, TOLERANCE)) {
        // Its the next bin
        continue
      } else {
        if (((bins[i][1] - (value - TOLERANCE)) > 0)
            || (almostEqual(bins[i][1], (value - TOLERANCE), TOLERANCE))) {
          return i
        }
      }
    }
  }

  // In unexpected situation
  throw notFoundError
}

/**
 * Return bin in which the given value lies. Assume bins are properly sorted.
 * `value` can be null, in which case we look for the last bin (which is onset bin).
 */
export function findBin(bins: Bin[], value: number, target: TargetId): Bin {
  return bins[findBinIndex(bins, value, target)]
}

/**
 * Return bins to consider as neighbours for the bin at given index
 * This follows the CDC FluSight guideline for considering the neighbouring bins
 */
export function expandBin(bins: Bin[], index: number, target: TargetId): Bin[] {
  function getBinsInWindow(windowSize) {
      return bins.filter((_, idx) => (idx >= (index - windowSize)) && (idx <= (index + windowSize)))
  }

  let binType = targetType[target]
  if (binType === 'week') {
    if (bins[index][0] === null) {
      // We don't return anyone else in case of onset
      return [bins[index]]
    } else {
      return getBinsInWindow(1)
    }
  } else if (binType === 'percent') {
    if (bins.length === 27) {
      // These are old style bins, only use a neighbour size of 1
      return getBinsInWindow(1)
    } else {
      return getBinsInWindow(5)
    }
  } else {
    throw new Error('Unknown bin type found while expanding')
  }
}

/**
 * Check whether the two bins are equal
 */
export function binsEq(bin1: Bin, bin2: Bin): boolean {
  return bin1.every((b1, i) => almostEqual(b1, bin2[i], TOLERANCE))
}
