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

describe('findBin', () => {
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
      expect(u.bins.findBin(bins, 0.01, target)[2]).to.equal(1)
      expect(u.bins.findBin(bins, 0.23, target)[2]).to.equal(3)
      expect(u.bins.findBin(bins, 0.43, target)[2]).to.equal(5)
    })

    it('should work for edge cases', () => {
      expect(u.bins.findBin(bins, 0, target)[2]).to.equal(1)
      expect(u.bins.findBin(bins, 0.1, target)[2]).to.equal(2)
      expect(u.bins.findBin(bins, 0.4, target)[2]).to.equal(5)
      expect(() => u.bins.findBin(bins, 0.5, target)).to.throw('Bin value not found')
    })
  })

  describe('week bins', () => {
    let target: TargetId = 'onset-wk'

    it('should work for normal cases', () => {
      let bins: Bin[] = [
        [201450, 201451, 1],
        [201451, 201452, 2],
        [201452, 201453, 3]
      ]

      expect(u.bins.findBin(bins, 201450, target)[2]).to.equal(1)
      expect(u.bins.findBin(bins, 201451, target)[2]).to.equal(2)
    })

    it('should work for edge cases', () => {
      let bins: Bin[] = [
        [201450, 201451, 1],
        [201451, 201452, 2],
        [201452, 201453, 3]
      ]

      expect(u.bins.findBin(bins, 201450, target)[2]).to.equal(1)
      expect(u.bins.findBin(bins, 201451, target)[2]).to.equal(2)
      expect(u.bins.findBin(bins, 201452, target)[2]).to.equal(3)
      expect(() => u.bins.findBin(bins, 201453, target)).to.throw('Bin value not found')
      expect(() => u.bins.findBin(bins, 201449, target)).to.throw('Bin value not found')
    })

    it('should work for season edge cases', () => {
      // Regular season
      let bins: Bin[] = [
        [201750, 201751, 1],
        [201751, 201752, 2],
        [201752, 201801, 3],
        [201801, 201802, 4],
        [201802, 201803, 5]
      ]

      expect(u.bins.findBin(bins, 201752, target)[2]).to.equal(3)
      expect(u.bins.findBin(bins, 201801, target)[2]).to.equal(4)
      expect(() => u.bins.findBin(bins, 201753, target)).to.throw('Bin value not found')

      // 53 week season
      bins = [
        [201450, 201451, 1],
        [201451, 201452, 2],
        [201452, 201453, 3],
        [201453, 201501, 4],
        [201501, 201502, 5],
        [201502, 201503, 6]
      ]

      expect(u.bins.findBin(bins, 201452, target)[2]).to.equal(3)
      expect(u.bins.findBin(bins, 201453, target)[2]).to.equal(4)
      expect(u.bins.findBin(bins, 201501, target)[2]).to.equal(5)
      expect(() => u.bins.findBin(bins, 201454, target)).to.throw('Bin value not found')
    })

    it('should work for onsets', () => {
      // Onset bin at standard position
      let bins: Bin[] = [
        [201450, 201451, 1],
        [201451, 201452, 2],
        [201452, 201453, 3],
        [null, null, 4]
      ]
      let target: TargetId = 'onset-wk'

      expect(u.bins.findBin(bins, null, target)[2]).to.equal(4)

      // Onset at non standard position
      bins = [
        [201450, 201451, 1],
        [201451, 201452, 2],
        [null, null, 3],
        [201452, 201453, 4]
      ]
      expect(() => u.bins.findBin(bins, null, target)).to.throw('Bin value not found')
    })
  })
})

describe('expandBin', () => {
  describe('percent bins', () => {
    let bins: Bin[] = [
      [0.0, 0.1, 1],
      [0.1, 0.2, 2],
      [0.2, 0.3, 3],
      [0.3, 0.4, 4],
      [0.4, 0.5, 5],
      [0.5, 0.6, 6],
      [0.6, 0.7, 7],
      [0.7, 0.8, 8],
      [0.8, 0.9, 9],
      [0.9, 1.0, 10],
      [1.0, 1.1, 11]
    ]

    it('should work for normal cases', () => {
      let expanded = u.bins.expandBin(bins, 5, 'percent')
      expect(expanded.length).to.equal(bins.length)
      expect(bins.every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true
    })

    it('should work for edge cases', () => {
      let expanded = u.bins.expandBin(bins, 1, 'percent')
      expect(expanded.length).to.equal(7)
      expect(bins.slice(0, -4).every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true

      expanded = u.bins.expandBin(bins, 6, 'percent')
      expect(expanded.length).to.equal(10)
      expect(bins.slice(1).every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true
    })
  })

  describe('week bins', () => {
    it('should work for normal cases', () => {
      let bins: Bin[] = [
        [201449, 201450, 1],
        [201450, 201451, 2],
        [201451, 201452, 3],
        [201452, 201453, 4]
      ]

      let expanded = u.bins.expandBin(bins, 1, 'week')
      expect(expanded.length).to.equal(3)
      expect(bins.slice(0, -1).every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true
    })

    it('should work for edge cases', () => {
      let bins: Bin[] = [
        [201449, 201450, 1],
        [201450, 201451, 2],
        [201451, 201452, 3],
        [201452, 201453, 4]
      ]

      let expanded = u.bins.expandBin(bins, 0, 'week')
      expect(expanded.length).to.equal(2)
      expect(bins.slice(0, -2).every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true

      expanded = u.bins.expandBin(bins, 3, 'week')
      expect(expanded.length).to.equal(2)
      expect(bins.slice(2).every((b, idx) => arrayEqual(b, expanded[idx]))).to.be.true
    })

    it('should work for onsets', () => {
      // Onset bin at standard position
      let bins: Bin[] = [
        [201449, 201450, 1],
        [201450, 201451, 2],
        [201451, 201452, 3],
        [201452, 201453, 4],
        [null, null, 5]
      ]

      let expanded = u.bins.expandBin(bins, 4, 'week')
      expect(expanded.length).to.equal(1)
      expect(arrayEqual(bins[4], expanded[0])).to.be.true
    })
  })
})

describe('Week to epiweek', () => {
  it('should be correct for normal cases', () => {
    let seasonId = 2017
    let weeks = [2, 29, 30, 50, 51, 52]
    let eweeks = [201802, 201829, 201730, 201750, 201751, 201752]

    weeks.forEach((w, i) => {
      expect(u.epiweek.weekToEpiweek(w, seasonId)).to.equal(eweeks[i])
    })
  })

  it('should be correct for edge cases', () => {
    let seasonId = 2017
    let weeks = [0.1, 1.2, 52, 53.3, 54.3]
    let eweeks = [201752, 201801, 201752, 201801, 201802]

    weeks.forEach((w, i) => {
      expect(u.epiweek.weekToEpiweek(w, seasonId)).to.equal(eweeks[i])
    })
  })
})
