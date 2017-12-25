import { getSeasonData } from '../src/delphi'
import { expect } from 'chai'
import 'mocha'

describe('Delphi API request', () => {
  it('should succeed for a simple request', async () => {
    expect((await getSeasonData(2016, 0)).message).to.equal('success')
  })

  it('should return correct number of data items', async () => {
    expect((await getSeasonData(2016, 0)).epidata.length).to.equal(572)
  })
})
