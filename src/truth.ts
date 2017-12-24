// Module for working with truth related data

import * as path from 'path'
import * as fs from 'fs-extra'
import * as Papa from 'papaparse'
import { userConfigDir } from 'appdirs'
import { SeasonId } from './interfaces'
import * as mmwr from 'mmwr-week'
import * as moment from 'moment'
import * as download from 'download'

// Url for fetching baseline data from
const baselineUrl = 'https://raw.githubusercontent.com/cdcepi/FluSight-forecasts/master/wILI_Baseline.csv'
const cacheDir = path.join(userConfigDir(), 'flusight-csv-tools')

/**
 * Return id for current season
 */
function currentSeasonId(): SeasonId {
  let mdate = new mmwr.MMWRDate()
  mdate.fromMomentDate(moment())
  return mdate.week >= 30 ? mdate.year : mdate.year - 1
}

/**
 * Ensure that an updated baseline csv is available in cache
 * @param fileName baseline filename
 */
function ensureBaselineFile(fileName) {
  if (fs.pathExistsSync(fileName)) {
    let data = Papa.parse(fs.readFileSync(fileName, 'utf8'), {
      dynamicTyping: true
    }).data

    let seasons = data[0].map(d => parseInt(d.split('/')[0]))
    if (seasons.indexOf(currentSeasonId()) === -1) {
      console.log('Baseline file not valid, downloading...')
      download(baselineUrl).pipe(fs.createWriteStream(fileName))
    }

  } else {
    console.log('Baseline file not found, downloading...')
    download(baselineUrl).pipe(fs.createWriteStream(fileName))
  }
}
