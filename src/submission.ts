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

  constructor(filePath: string, epiweek: Epiweek, model: string) {
    this.filePath = filePath
    this.epiweek = epiweek
    this.model = model
    this.readCsv()
  }

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

  getPoint(target: TargetId, region: RegionId): number {
    return this.data[regionMap[region]][targetMap[target]]
      .find(row => row[2] == 'Point')[6]
  }

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

  getConfidenceRange(target: TargetId, region: RegionId, ciPercent: number = 90): [number, number] {
    let ciTrim = 0.5 - (ciPercent / 200)
    return [1, 2]
  }

  toCsv(filePath: string) {
  }
}
