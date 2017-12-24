import { getBaseline } from '../src/truth'
import { expect } from 'chai'
import * as almostEqual from 'almost-equal'
import 'mocha'

describe('Baseline', () => {
  it('should be correct', async () => {
    expect(almostEqual(await getBaseline('nat', 2017), 2.2)).to.be.true
    expect(almostEqual(await getBaseline('hhs8', 2012), 1.9)).to.be.true
    expect(almostEqual(await getBaseline('hhs10', 2007), 3.3)).to.be.true
    expect(almostEqual(await getBaseline('hhs1', 2009), 1.2)).to.be.true
    expect(almostEqual(await getBaseline('hhs5', 2014), 1.7)).to.be.true
  })
})
