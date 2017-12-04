import { Submission } from '../src/index'
import { targetMap, regionMap } from '../src/meta'
import { expect } from 'chai'
import 'mocha'

describe('Sample CSV file', () => {
  let filePath = './test/data/sample.csv'
  let epiweek = 201720
  let model = 'sample'

  let sub = new Submission(filePath, epiweek, model)

  it('should read points correctly', () => {
    expect(sub.getPoint(1, 'nat')).to.equal(6.2)
  })

  it('should read bins correctly', () => {
    expect(sub.getBins(1, 'nat').length).to.equal(131)
    expect(sub.getBins(1, 'nat')[0].length).to.equal(3)
  })
})
