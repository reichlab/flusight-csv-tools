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
  'hsh3',
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
