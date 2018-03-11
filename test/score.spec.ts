import { Csv, score } from '../src/'
import { regionIds, targetIds, scoreIds } from '../src/meta'
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
    for (let scoreId of scoreIds) {
      if(!almostEqual(scoreA[target][scoreId], scoreB[target][scoreId])) {
        return false
      }
    }
  }

  return true
}

describe('Scores', () => {
  it('should be correct for sample.csv', async () => {
    let csv = new Csv('./test/data/sample.csv', 201620, 'sample')

    let expectedScore = {
      nat: {
        '1-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: -5.01621,
          absError: 5.01621
        },
        '2-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: -5.66277,
          absError: 5.66277
        },
        '3-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: -6.15882,
          absError: 6.15882
        },
        '4-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: -6.228186,
          absError: 6.228186
        },
        'peak': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: -3.6397600000000003,
          absError: 3.6397600000000003
        },
        'peak-wk': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: 6,
          absError: 6
        },
        'onset-wk': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: 6,
          absError: 6
        }
      }
    }

    let calculatedScore = await score.score(csv)
    expect(scoresEqual(expectedScore.nat, calculatedScore.nat)).to.be.true
  }).timeout(0)

  it('should be correct for sample2.csv', async () => {
    let csv = new Csv('./test/data/sample2.csv', 201620, 'sample2')

    let expectedScore = {
      nat: {
        '1-ahead': {
          logScore: -1.4940521728850975,
          logScoreMultiBin: -0.03486223419697661,
          error: -0.10181539428982789,
          absError: 0.10181539428982789
        },
        '2-ahead': {
          logScore: -1.4252846580598586,
          logScoreMultiBin: -0.039093176422556504,
          error: -0.06531083484576494,
          absError: 0.06531083484576494
        },
        '3-ahead': {
          logScore: -1.712127901971514,
          logScoreMultiBin: -0.042362529487734966,
          error: -0.0854651841778542,
          absError: 0.0854651841778542
        },
        '4-ahead': {
          logScore: -1.9755750256876092,
          logScoreMultiBin: -0.04182105327172841,
          error: -0.13665658823528437,
          absError: 0.13665658823528437
        },
        'peak': {
          logScore: -7.748899330101157,
          logScoreMultiBin: -5.29130312929772,
          error: -1.5397600000024387,
          absError: 1.5397600000024387
        },
        'peak-wk': {
          logScore: -6.503339739507561,
          logScoreMultiBin: -5.404815819136896,
          error: 5,
          absError: 5
        },
        'onset-wk': {
          logScore: -6.377599525432952,
          logScoreMultiBin: -5.249647918775156,
          error: 5,
          absError: 5
        }
      }
    }

    let calculatedScore = await score.score(csv)
    expect(scoresEqual(expectedScore.nat, calculatedScore.nat)).to.be.true
  }).timeout(0)


  it('should be aggregated correctly', async () => {
    let csv = new Csv('./test/data/sample.csv', 201620, 'sample')
    let csv2 = new Csv('./test/data/sample2.csv', 201620, 'sample2')

    let expectedScore = {
      nat: {
        '1-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 2.559012697144914
        },
        '2-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 2.8640404174228826
        },
        '3-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 3.1221425920889274
        },
        '4-ahead': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 3.182421294117642
        },
        'peak': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 2.5897600000012195
        },
        'peak-wk': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 5.5
        },
        'onset-wk': {
          logScore: -Infinity,
          logScoreMultiBin: -Infinity,
          error: null,
          absError: 5.5
        }
      }
    }

    let scores = await Promise.all([score.score(csv), score.score(csv2)])
    let aggregatedScore = score.meanScores(scores)
    expect(scoresEqual(expectedScore.nat, aggregatedScore.nat)).to.be.true
  }).timeout(0)
})
