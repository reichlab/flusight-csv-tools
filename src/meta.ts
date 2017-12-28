// Metadata. Mostly maps from abbreviations to corresponding text in csv

import { RegionId, TargetId } from './interfaces'

export const headers = [
  'location',
  'target',
  'type',
  'unit',
  'bin_start_incl',
  'bin_end_notincl',
  'value'
]

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

export const targetIds: TargetId[] = [
  1,
  2,
  3,
  4,
  'peak',
  'peak-wk',
  'onset-wk'
]

export const targetFullName = {
  1: '1 wk ahead',
  2: '2 wk ahead',
  3: '3 wk ahead',
  4: '4 wk ahead',
  'peak': 'Season peak percentage',
  'peak-wk': 'Season peak week',
  'onset-wk': 'Season onset'
}

export const targetType = {
  1: 'percent',
  2: 'percent',
  3: 'percent',
  4: 'percent',
  'peak': 'percent',
  'peak-wk': 'week',
  'onset-wk': 'week'
}

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

// List of US states
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

// States in each region
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
