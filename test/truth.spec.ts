import { truth } from '../src/'
import { regionIds, targetIds } from '../src/meta'
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
  }).timeout(0)
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

describe('Onset calculation', () => {
  it('should be null for next season', async () => {
    let season = truth.currentSeasonId() + 1
    let seasonTruth = await truth.getSeasonTruth(season)

    for (let region of regionIds) {
      expect(seasonTruth[region].every(d => d['onset-wk'] === null)).to.be.true
    }
  }).timeout(0)

  it('should be correct for past stable seasons', async () => {
    let onsetWks = {
      2015: {
        nat: 201603,
        hhs2: 201604,
        hhs6: 201547
      },
      2014: {
        nat: 201447,
        hhs2: 201445,
        hhs6: 201447
      },
      2011: {
        nat: null,
        hhs2: null,
        hhs6: null
      },
      2010: {
        nat: 201051,
        hhs2: 201049,
        hhs6: 201103
      }
    }

    for (let season in onsetWks) {
      let seasonTruth = await truth.getSeasonTruth(parseInt(season))

      for (let region in onsetWks[season]) {
        expect(seasonTruth[region].every(d => d['onset-wk'] === onsetWks[season][region])).to.be.true
      }
    }
  }).timeout(0)
})

describe('Peak calculations', () => {
  it('should be null for next season', async () => {
    let season = truth.currentSeasonId() + 1
    let seasonTruth = await truth.getSeasonTruth(season)

    for (let region of regionIds) {
      expect(seasonTruth[region].every(d => d['peak'] === null)).to.be.true
      expect(seasonTruth[region].every(d => d['peak-wk'] === null)).to.be.true
    }
  }).timeout(0)

  it('should be null for current season', async () => {
    let season = truth.currentSeasonId()
    let seasonTruth = await truth.getSeasonTruth(season)

    for (let region of regionIds) {
      expect(seasonTruth[region].every(d => d['peak'] === null)).to.be.true
      expect(seasonTruth[region].every(d => d['peak-wk'] === null)).to.be.true
    }
  }).timeout(0)

  it('should be correct for past stable seasons', async () => {
    let peaks = {
      2015: {
        nat: [3.56, 201610],
        hhs2: [4.08, 201611],
        hhs6: [5.32, 201607]
      },
      2014: {
        nat: [5.98, 201452],
        hhs2: [5.25, 201452],
        hhs6: [10.62, 201451]
      },
      2011: {
        nat: [2.39, 201211],
        hhs2: [1.35, 201149],
        hhs6: [4.11, 201211]
      },
      2010: {
        nat:  [4.55, 201105] ,
        hhs2: [4.48, 201052],
        hhs6: [7.95, 201107]
      }
    }

    for (let season in peaks) {
      let seasonTruth = await truth.getSeasonTruth(parseInt(season))

      for (let region in peaks[season]) {
        expect(seasonTruth[region].every(d => almostEqual(
          d['peak'], peaks[season][region][0], 0.01 // NOTE: A rather sloppy test
        ))).to.be.true
        expect(seasonTruth[region].every(d => d['peak-wk'] === peaks[season][region][1])).to.be.true
      }
    }
  }).timeout(0)
})
