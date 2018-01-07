import { Bin, RegionId, TargetId, Epiweek } from './interfaces'
import { targetFullName, regionFullName, targetType, regionIds, targetIds } from './meta'
import * as u from './utils'
import * as Papa from 'papaparse'
import * as d3 from 'd3-collection'
import * as fs from 'fs-extra'

/**
 * Class representing a CSV file
 */
export default class CSV {
  readonly epiweek: Epiweek
  readonly model: string
  readonly filePath: string
  headers: string[]
  private bins: { [index: string]: { [index: string]: Bin[] } }
  private points: { [index: string]: { [index: string]: number } }

  /**
   * Initialize the csv with filename and some metadata
   */
  constructor(filePath: string, epiweek: Epiweek, model: string) {
    this.filePath = filePath
    this.epiweek = epiweek
    this.model = model
    this.parseCsv()
  }

  /**
   * Parse and read the csv
   * TODO: Standardize bins before saving
   */
  private parseCsv() {
    let csvRows = Papa.parse(fs.readFileSync(this.filePath, 'utf8'), {
      dynamicTyping: true
    }).data

    this.headers = csvRows[0]
    let csvData = d3.nest()
      .key(d => d[0]) // region
      .key(d => d[1]) // target
      .object(csvRows.slice(1).filter(d => !(d.length === 1 && d[0] === '')))
    this.parseBins(csvData)
    this.parsePoints(csvData)
  }

  /**
   * Parse bin data for all the regions and targets
   */
  private parseBins(csvData) {
    this.bins = {}
    for (let region of regionIds) {
      this.bins[region] = {}
      for (let target of targetIds) {
        let bins = csvData[regionFullName[region]][targetFullName[target]]
          .filter(row => row[2] == 'Bin')
          .map(row => [row[4], row[5], row[6]]) // bin start, bin end, value
        this.bins[region][target] = u.bins.sortBins(bins, target)
      }
    }
  }

  /**
   * Return an array of bin values for given target and region.
   */
  getBins(target: TargetId, region: RegionId): Bin[] {
    return this.bins[region][target]
  }

  /**
   * Parse point data for all the region and targets
   */
  private parsePoints(csvData) {
    this.points = {}
    for (let region of regionIds) {
      this.points[region] = {}
      for (let target of targetIds) {
        let point = csvData[regionFullName[region]][targetFullName[target]]
          .find(row => row[2] == 'Point')[6]
        if (point === 'NA') {
          point = u.bins.inferPoint(this.getBins(target, region))
        }

        this.points[region][target] = point
      }
    }
  }

  /**
   * Return a point value for given target and region
   */
  getPoint(target: TargetId, region: RegionId): number {
    return this.points[region][target]
  }

  /**
   * Return low and high bin values for the given confidence (in percent) and target, region pair.
   */
  getConfidenceRange(target: TargetId, region: RegionId, ciPercent: number = 90): [number, number] {
    let ciTrim = 0.5 - (ciPercent / 200)
    let bins = this.getBins(target, region)

    let pAccum = {
      low: 0,
      high: 0
    }

    let low, high

    for (let i = 0; i < bins.length; i++) {
      pAccum.low += bins[i][2]
      pAccum.high += bins[bins.length - i - 1][2]

      if ((pAccum.low > ciTrim) && (!low)) {
        low = bins[i][0]
      }

      if ((pAccum.high > ciTrim) && (!high)) {
        high = bins[bins.length - i - 1][1]
      }
    }

    return [low, high]
  }
}
