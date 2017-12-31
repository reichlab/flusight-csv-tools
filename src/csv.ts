import { Bin, RegionId, TargetId, Epiweek } from './interfaces'
import { targetFullName, regionFullName, targetType } from './meta'
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
  data

  /**
   * Initialize the csv with filename and some metadata
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
    return this.data[regionFullName[region]][targetFullName[target]]
      .find(row => row[2] == 'Point')[6]
  }

  /**
   * Return an array of bin values for given target and region.
   */
  getBins(target: TargetId, region: RegionId): Bin[] {
    let bins = this.data[regionFullName[region]][targetFullName[target]]
      .filter(row => row[2] == 'Bin')
      .map(row => [row[4], row[5], row[6]]) // bin start, bin end, value

    let comparePercentage = (a, b) => a[0] - b[0]
    let compareWeeks = (a, b) => {
      if ((a[0] >= 30) && (b[0] < 30)) {
        return -1
      } else if ((a[0] < 30) && (b[0] >= 30)) {
        return 1
      } else {
        return a[0] - b[0]
      }
    }

    // Extract none value separately and push it in the end
    let noneVal = null
    if (target === 'onset-wk') {
      let noneIdx = bins.findIndex(b => b[0] === 'none')
      noneVal = bins[noneIdx][2]
      bins.splice(noneIdx, 1)
    }
    bins = bins.sort(targetType[target] === 'percent' ? comparePercentage : compareWeeks)
    if (noneVal !== null) bins.push([null, null, noneVal])
    return bins
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
