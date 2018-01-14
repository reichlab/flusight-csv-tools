import { Csv, score } from '../src/'
import { regionIds, targetIds } from '../src/meta'
import { expect } from 'chai'
import * as almostEqual from 'almost-equal'
import 'mocha'
import { RegionTargetIndex, Score } from '../src/interfaces'
import { cache } from '../src/utils/index';


/**
 * Return true if the scores match. Scores here are indexed by
 * targetId and then scoreId
 */
function scoresEqual(scoreA: { [index: string]: Score },
                     scoreB: { [index: string]: Score }): boolean {
  for (let target of targetIds) {
    for (let scoreId of ['logScore', 'error']) {
      if(!almostEqual(scoreA[target][scoreId], scoreB[target][scoreId])) {
        return false
      }
    }
  }

  return true
}

describe('Scores', () => {
  it('should be correct for sample.csv', async () => {
    let csv = new Csv('./test/data/sample.csv', 201720, 'sample')

    let expectedScore = {
      nat: {
        '1-ahead': { logScore: -Infinity, error: -5.03411 },
        '2-ahead': { logScore: -Infinity, error: -5.69074 },
        '3-ahead': { logScore: -Infinity, error: -6.156090000000001 },
        '4-ahead': { logScore: -Infinity, error: -6.294873 },
        'peak': { logScore: -Infinity, error: -2.1390599999999997 },
        'peak-wk': { logScore: -1.4086095021368603, error: 2 },
        'onset-wk': { logScore: -Infinity, error: 1 }
      }
    }

    let calculatedScore = await score.score(csv)
    expect(scoresEqual(expectedScore.nat, calculatedScore.nat)).to.be.true
  }).timeout(0)

  it('should be correct for sample2.csv', async () => {
    let csv = new Csv('./test/data/sample2.csv', 201720, 'sample2')

    let expectedScore = {
      nat: {
        '1-ahead': { logScore: -1.4940521728850975, error: -0.11971539428982769 },
        '2-ahead': { logScore: -1.4252846580598586, error: -0.09328083484576499 },
        '3-ahead': { logScore: -1.712127901971514, error: -0.0827351841778543 },
        '4-ahead': { logScore: -1.9755750256876092, error: -0.2033435882352843 },
        'peak': { logScore: -0.7031219962300552, error: -0.039060000002438144 },
        'peak-wk': { logScore: -0.8368084555740485, error: 1 },
        'onset-wk': { logScore: -0.8979822612093167, error: 0 }
      }
    }

    let calculatedScore = await score.score(csv)
    expect(scoresEqual(expectedScore.nat, calculatedScore.nat)).to.be.true
  }).timeout(0)


  it('should be aggregated correctly', async () => {
    let csv = new Csv('./test/data/sample.csv', 201720, 'sample')
    let csv2 = new Csv('./test/data/sample2.csv', 201720, 'sample2')

    let expectedScore = {
      nat: {
        '1-ahead': { logScore: -Infinity, error: -2.576912697144914 },
        '2-ahead': { logScore: -Infinity, error: -2.8920104174228825 },
        '3-ahead': { logScore: -Infinity, error: -3.1194125920889277 },
        '4-ahead': { logScore: -Infinity, error: -3.249108294117642 },
        'peak': { logScore: -Infinity, error: -1.089060000001219 },
        'peak-wk': { logScore: -1.1227089788554543, error: 1.5 },
        'onset-wk': { logScore: -Infinity, error: 0.5 }
      }
    }

    let scores = await Promise.all([score.score(csv), score.score(csv2)])
    let aggregatedScore = score.meanScores(scores)
    expect(scoresEqual(expectedScore.nat, aggregatedScore.nat)).to.be.true
  }).timeout(0)
})
