import { Bin, RegionId, TargetId, Epiweek } from './interfaces'
import { targetMap, regionMap, targetType } from './meta'
import * as Papa from 'papaparse'
import * as d3 from 'd3-collection'
import * as fs from 'fs'

export default class Submission {
  readonly epiweek: Epiweek
  readonly model: string
  readonly filePath: string
  headers: string[]
  data

  /**
   * Initialize a submission object
   */
  constructor(filePath: string, epiweek: Epiweek, model: string) {
    this.filePath = filePath
    this.epiweek = epiweek
    this.model = model
    this.readCsv()
  }

  /**
   * Parse and read the csv
   */
  private readCsv() {
    let csvData = Papa.parse(fs.readFileSync(this.filePath, 'utf8'), {
      dynamicTyping: true
    }).data

    this.headers = csvData[0]
    this.data = d3.nest()
      .key(d => d[0]) // region
      .key(d => d[1]) // target
      .object(csvData.slice(1).filter(d => !(d.length === 1 && d[0] === '')))
  }

  /**
   * Return a point value for given target and region. The value is taken
   * directly from the csv without trying to infer it from bins. The verification
   * module takes care of checking where the provided point value matches with the
   * inferred value.
   */
  getPoint(target: TargetId, region: RegionId): number {
    return this.data[regionMap[region]][targetMap[target]]
      .find(row => row[2] == 'Point')[6]
  }

  /**
   * Return an array of bin values for given target and region.
   */
  getBins(target: TargetId, region: RegionId): Bin[] {
    let bins = this.data[regionMap[region]][targetMap[target]]
      .filter(row => row[2] == 'Bin')
      .map(row => [row[4], row[5], row[6]]) // bin start, bin end, value

    let comparePercentage = (a, b) => a - b
    let compareWeeks = (a, b) => {
      if ((a >= 30) && (b < 30)) {
        return -1
      } else if ((a < 30) && (b >= 30)) {
        return 1
      } else {
        return a - b
      }
    }

    // TODO Handle none bin of onset properly
    if (target === 'onset-wk') {
      process.emitWarning('Removing none bin from onset')
      bins = bins.filter(row => row[0] !== 'none')
    }

    return bins.sort(targetType[target] === 'percent' ? comparePercentage : compareWeeks)
  }

  /**
   * Return low and high bin values for the given confidence (in percent) and target, region pair.
   */
  getConfidenceRange(target: TargetId, region: RegionId, ciPercent: number = 90): [number, number] {
    let ciTrim = 0.5 - (ciPercent / 200)
    let bins = this.getBins(target, region)

    let accumulator = {
      low: 0,
      high: 0
    }

    let range = {
      low: null,
      high: null
    }

    for (let i = 0; i < bins.length; i++) {
      accumulator.low += bins[i][2]
      accumulator.high += bins[bins.length - i - 1][2]

      if ((accumulator.low > ciTrim) && (!range.low)) {
        range.low = bins[i][0]
      }

      if ((accumulator.high > ciTrim) && (!range.high)) {
        range.high = bins[bins.length - i - 1][1]
      }
    }

    return [range.low, range.high]
  }

  /**
   * Write the data to a csv file. This write the csv after sorting the rows
   * using a default order.
   */
  toCsv(filePath: string) {
  }
}
