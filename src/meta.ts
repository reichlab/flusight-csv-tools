/**
 * Metadata and mappings from abbreviations to corresponding text in csv
 */

/**
 * Doc guard
 */
import { RegionId, TargetId } from './interfaces'

/**
 * The headers expected in the csv files
 */
export const headers = [
  'location',
  'target',
  'type',
  'unit',
  'bin_start_incl',
  'bin_end_notincl',
  'value'
]

/**
 * Short ids representing a region in the code.
 */
export const regionIds: RegionId[] = [
  'nat',
  'hhs1',
  'hhs2',
  'hhs3',
  'hhs4',
  'hhs5',
  'hhs6',
  'hhs7',
  'hhs8',
  'hhs9',
  'hhs10'
]

/**
 * Short ids representing a target in the code.
 */
export const targetIds: TargetId[] = [
  '1-ahead',
  '2-ahead',
  '3-ahead',
  '4-ahead',
  'peak',
  'peak-wk',
  'onset-wk'
]

/**
 * Short ids representing a score in the code.
 */
export const scoreIds: string[] = [
  'logScore',
  'logScoreMultiBin',
  'error',
  'absError',
  'probabilityScore'
]

/**
 * Mapping from target ids to full name as used in the csvs
 */
export const targetFullName = {
  '1-ahead': '1 wk ahead',
  '2-ahead': '2 wk ahead',
  '3-ahead': '3 wk ahead',
  '4-ahead': '4 wk ahead',
  'peak': 'Season peak percentage',
  'peak-wk': 'Season peak week',
  'onset-wk': 'Season onset'
}

/**
 * Target type for each target. Note that there can be only two
 * target types, 'percent' and 'week'.
 */
export const targetType = {
  '1-ahead': 'percent',
  '2-ahead': 'percent',
  '3-ahead': 'percent',
  '4-ahead': 'percent',
  'peak': 'percent',
  'peak-wk': 'week',
  'onset-wk': 'week'
}

/**
 * Mapping from region ids to full region name as used in
 * the csvs
 */
export const regionFullName = {
  'nat': 'US National',
  'hhs1': 'HHS Region 1',
  'hhs2': 'HHS Region 2',
  'hhs3': 'HHS Region 3',
  'hhs4': 'HHS Region 4',
  'hhs5': 'HHS Region 5',
  'hhs6': 'HHS Region 6',
  'hhs7': 'HHS Region 7',
  'hhs8': 'HHS Region 8',
  'hhs9': 'HHS Region 9',
  'hhs10': 'HHS Region 10'
}

/**
 * List of US state abbreviations
 */
export const stateIds =
  ['AK', 'AL', 'AR', 'AZ', 'CA', // 0-4
   'CO', 'CT', 'DC', 'DE', 'FL', // 5-9
   'GA', 'HI', 'IA', 'ID', 'IL', // 10-14
   'IN', 'KS', 'KY', 'LA', 'MA', // 15-19
   'MD', 'ME', 'MI', 'MN', 'MO', // 20-24
   'MS', 'MT', 'NC', 'ND', 'NE', // 25-29
   'NH', 'NJ', 'NM', 'NV', 'NY', // 30-34
   'OH', 'OK', 'OR', 'PA', 'RI', // 35-39
   'SC', 'SD', 'TN', 'TX', 'UT', // 40-44
   'VA', 'VT', 'WA', 'WI', 'WV', // 45-49
   'WY'] // 50

/**
 * Mapping from region ids to the states in those regions
 */
export const regionStates = {
  'nat': stateIds,
  'hhs1': [6, 19, 21, 30, 39, 46].map(i => stateIds[i]),
  'hhs2': [31, 34].map(i => stateIds[i]),
  'hhs3': [8, 20, 38, 45, 49].map(i => stateIds[i]),
  'hhs4': [1, 9, 10, 17, 25, 27, 40, 42].map(i => stateIds[i]),
  'hhs5': [14, 15, 22, 23, 35, 48].map(i => stateIds[i]),
  'hhs6': [2, 18, 32, 36, 43].map(i => stateIds[i]),
  'hhs7': [12, 16, 24, 29].map(i => stateIds[i]),
  'hhs8': [5, 26, 28, 41, 44, 50].map(i => stateIds[i]),
  'hhs9': [3, 4, 11, 33].map(i => stateIds[i]),
  'hhs10': [0, 13, 37, 47].map(i => stateIds[i])
}
