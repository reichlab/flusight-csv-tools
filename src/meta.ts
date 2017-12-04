// Metadata. Mostly maps from abbreviations to corresponding text in csv

import { RegionId, TargetId } from './interfaces'

export const targetMap = {
  1: '1 wk ahead',
  2: '2 wk ahead',
  3: '3 wk ahead',
  4: '4 wk ahead',
  'peak': 'Season peak percentage',
  'peak-wk': 'Season peak week',
  'onset-wk': 'Season onset'
}

export const regionMap = {
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
