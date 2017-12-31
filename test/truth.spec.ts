import { truth } from '../src/'
import { expect } from 'chai'
import * as almostEqual from 'almost-equal'
import 'mocha'

describe('Baseline', () => {
  it('should be correct', async () => {
    expect(almostEqual(await truth.getBaseline('nat', 2017), 2.2, almostEqual.FLT_EPSILON)).to.be.true
    expect(almostEqual(await truth.getBaseline('hhs8', 2012), 1.9, almostEqual.FLT_EPSILON)).to.be.true
    expect(almostEqual(await truth.getBaseline('hhs10', 2007), 3.3, almostEqual.FLT_EPSILON)).to.be.true
    expect(almostEqual(await truth.getBaseline('hhs1', 2009), 1.2, almostEqual.FLT_EPSILON)).to.be.true
    expect(almostEqual(await truth.getBaseline('hhs5', 2014), 1.7, almostEqual.FLT_EPSILON)).to.be.true
  })
})

describe('Season weeks', () => {
  it('should be correct for regular seasons', () => {
    expect(truth.seasonEpiweeks(2012).length).to.equal(52)
  })

  it('should be correct for 53 week season', () => {
    let epiweeks = truth.seasonEpiweeks(2014)
    expect(epiweeks.length).to.equal(53)
    expect(epiweeks.indexOf(201453) > -1).to.be.true
  })
})
