export default class Submission {
  readonly epiweek: number
  readonly model: string
  filePath: string

  constructor(filePath: string, public epiweek: number, public model: string) {
    this.filePath = filePath
    this.readCsv()
  }

  private readCsv() {
    // Parse the csv
  }

  getPoint(target: string, region: string): number {
  }

  getBins(target: string, region: string) {
  }

  getConfidenceRange(target: string, region: string, ciPercent: number = 90): [number, number] {
    let ciTrim = 0.5 - (ciPercent / 200)
  }

  toCsv(filePath: string) {
    //
  }
}
