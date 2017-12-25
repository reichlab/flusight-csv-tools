import { sliceSumBins } from '../src/bin-utils'
import { expect } from 'chai'
import * as almostEqual from 'almost-equal'
import * as arrayEqual from 'array-equal'
import { Bin } from '../src/interfaces'
import 'mocha'

/**
 * Return bins with random probabilities starting from bin [0, gap)
 */
function randomBins(length: number, gap: number): Bin[] {
  let values = Array(length).fill(0).map(() => Math.random())
  let valuesSum = values.reduce((acc, v) => acc + v)

  return values.map(v => v / valuesSum).map((p, idx): Bin => {
    return [idx * gap, (idx + 1) * gap, p]
  })
}

describe('Slice reduction', () => {
  it('should sum to one', () => {
    let bins = randomBins(102, 5)
    let slicedSum = sliceSumBins(bins, 5).reduce((acc, b) => b[2] + acc, 0)
    expect(almostEqual(slicedSum, 1.0, almostEqual.FLT_EPSILON)).to.be.true
  })

  it('should have correct number of bins', () => {
    let bins = randomBins(102, 5)
    expect(sliceSumBins(bins, 5).length).to.equal(21)
  })

  it('should have correct bin boundaries', () => {
    let bins = randomBins(12, 5)
    let sliced = sliceSumBins(bins, 5)
    expect(arrayEqual(sliced.map(b => b[0]), [0, 25, 50])).to.be.true
    expect(arrayEqual(sliced.map(b => b[1]), [25, 50, 60])).to.be.true
  })
})
