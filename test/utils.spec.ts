import * as u from '../src/utils'
import { expect } from 'chai'
import * as almostEqual from 'almost-equal'
import * as arrayEqual from 'array-equal'
import { Bin, TargetId } from '../src/interfaces'
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
    let slicedSum = u.bins.sliceSumBins(bins, 5).reduce((acc, b) => b[2] + acc, 0)
    expect(almostEqual(slicedSum, 1.0, almostEqual.FLT_EPSILON)).to.be.true
  })

  it('should have correct number of bins', () => {
    let bins = randomBins(102, 5)
    expect(u.bins.sliceSumBins(bins, 5).length).to.equal(21)
  })

  it('should have correct bin boundaries', () => {
    let bins = randomBins(12, 5)
    let sliced = u.bins.sliceSumBins(bins, 5)
    expect(arrayEqual(sliced.map(b => b[0]), [0, 25, 50])).to.be.true
    expect(arrayEqual(sliced.map(b => b[1]), [25, 50, 60])).to.be.true
  })
})

describe('binFor', () => {
  describe('percent bins', () => {
    let bins: Bin[] = [
      [0.0, 0.1, 1],
      [0.1, 0.2, 2],
      [0.2, 0.3, 3],
      [0.3, 0.4, 4],
      [0.4, 0.5, 5],
    ]
    let target: TargetId = '1-ahead'

    it('should work for normal cases', () => {
      expect(u.bins.binFor(bins, 0.01, target)[2]).to.equal(1)
      expect(u.bins.binFor(bins, 0.23, target)[2]).to.equal(3)
      expect(u.bins.binFor(bins, 0.43, target)[2]).to.equal(5)
    })

    it('should work for edge cases', () => {
      expect(u.bins.binFor(bins, 0, target)[2]).to.equal(1)
      expect(u.bins.binFor(bins, 0.1, target)[2]).to.equal(2)
      expect(u.bins.binFor(bins, 0.4, target)[2]).to.equal(5)
      expect(() => u.bins.binFor(bins, 0.5, target)).to.throw('Bin value not found')
    })
  })

  describe('week bins', () => {
    let target: TargetId = 'onset-wk'

    it('should work for normal cases', () => {
      let bins: Bin[] = [
        [50, 51, 1],
        [51, 52, 2],
        [52, 53, 3]
      ]

      expect(u.bins.binFor(bins, 50.5, target)[2]).to.equal(1)
      expect(u.bins.binFor(bins, 51.9, target)[2]).to.equal(2)
    })

    it('should work for edge cases', () => {
      let bins: Bin[] = [
        [50, 51, 1],
        [51, 52, 2],
        [52, 53, 3]
      ]

      expect(u.bins.binFor(bins, 50, target)[2]).to.equal(1)
      expect(u.bins.binFor(bins, 51, target)[2]).to.equal(2)
      expect(u.bins.binFor(bins, 52, target)[2]).to.equal(3)
      expect(() => u.bins.binFor(bins, 53, target)).to.throw('Bin value not found')
      expect(() => u.bins.binFor(bins, 49, target)).to.throw('Bin value not found')
    })

    it('should work for season edge cases', () => {
      // Regular season
      let bins: Bin[] = [
        [50, 51, 1],
        [51, 52, 2],
        [52, 1, 3],
        [1, 2, 4],
        [2, 3, 5]
      ]

      expect(u.bins.binFor(bins, 52, target)[2]).to.equal(3)
      expect(u.bins.binFor(bins, 1, target)[2]).to.equal(4)
      expect(u.bins.binFor(bins, 52.3, target)[2]).to.equal(3)
      expect(u.bins.binFor(bins, 0.3, target)[2]).to.equal(3)
      expect(() => u.bins.binFor(bins, 53, target)).to.throw('Bin value not found')
      expect(() => u.bins.binFor(bins, 53.3, target)).to.throw('Bin value not found')

      // 53 week season
      bins = [
        [50, 51, 1],
        [51, 52, 2],
        [52, 53, 3],
        [53, 1, 4],
        [1, 2, 5],
        [2, 3, 6]
      ]

      expect(u.bins.binFor(bins, 52, target)[2]).to.equal(3)
      expect(u.bins.binFor(bins, 53, target)[2]).to.equal(4)
      expect(u.bins.binFor(bins, 1, target)[2]).to.equal(5)
      expect(u.bins.binFor(bins, 52.3, target)[2]).to.equal(3)
      expect(u.bins.binFor(bins, 53.3, target)[2]).to.equal(4)
      expect(u.bins.binFor(bins, 0.3, target)[2]).to.equal(4)
      expect(() => u.bins.binFor(bins, 54, target)).to.throw('Bin value not found')
      expect(() => u.bins.binFor(bins, 54.3, target)).to.throw('Bin value not found')
    })

    it('should work for onsets', () => {
      // Onset bin at standard position
      let bins: Bin[] = [
        [50, 51, 1],
        [51, 52, 2],
        [52, 53, 3],
        [null, null, 4]
      ]
      let target: TargetId = 'onset-wk'

      expect(u.bins.binFor(bins, null, target)[2]).to.equal(4)

      // Onset at non standard position
      bins = [
        [50, 51, 1],
        [51, 52, 2],
        [null, null, 3],
        [52, 53, 4]
      ]
      expect(() => u.bins.binFor(bins, null, target)).to.throw('Bin value not found')
    })
  })
})
