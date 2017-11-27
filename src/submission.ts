import { Bin, RegionId, TargetId, Epiweek } from './interfaces'

export default class Submission {
  readonly epiweek: Epiweek
  readonly model: string
  filePath: string

  constructor(filePath: string, public epiweek: Epiweek, public model: string) {
    this.filePath = filePath
    this.readCsv()
  }

  private readCsv() {
    // Parse the csv
  }

  getPoint(target: TargetId, region: RegionId): number {
  }

  getBins(target: TargetId, region: RegionId): Bin[] {
  }

  getConfidenceRange(target: TargetId, region: RegionId, ciPercent: number = 90): [number, number] {
    let ciTrim = 0.5 - (ciPercent / 200)
  }

  toCsv(filePath: string) {
  }
}
