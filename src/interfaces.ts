// Interfaces and types

/**
 * A bin with start value (inclusive), end value (exclusive) and probability.
 * Start and end values can also be null to refer to the 'None' bin in onset
 */
export type Bin = [number, number, number]

/**
 * Standard identifiers for the 11 regions
 */
export type RegionId = 'nat' | 'hhs1' | 'hhs2' | 'hhs3' | 'hhs4' | 'hhs5' | 'hhs6' | 'hhs7' | 'hhs8' | 'hhs9' | 'hhs10'

/**
 * Standard identifiers for the 7 targets
 */
export type TargetId = '1-ahead' | '2-ahead' | '3-ahead' | '4-ahead' | 'peak' | 'peak-wk' | 'onset-wk'

/**
 * Season id using only first year of season. For example, season xxxx-yyyy is
 * represented as xxxx
 */
export type SeasonId = number

/**
 * Epiweek in format yyyyww
 */
export type Epiweek = number


/**
 * Epiweek and corresponding wili
 */
export type EpiweekWili = {
  epiweek: Epiweek
  wili: number
}

/**
 * Epiweek, its wili and other wilis at different lags
 */
export type EpiweekWiliLag = {
  epiweek: Epiweek
  wili: number
  lagData: {
    lag: number
    wili: number
  }[]
}

/**
 * A unit representing various scores
 * `logScore` is single bin log score
 * `error` is true value - estimated value
 */
export type Score = {
  logScore: number,
  error: number
}
