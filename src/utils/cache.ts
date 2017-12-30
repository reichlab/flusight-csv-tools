import * as Papa from 'papaparse'
import * as fs from 'fs-extra'
import * as path from 'path'
import { userCacheDir } from 'appdirs'

const CACHE_DIR = path.join(userCacheDir(), 'flusight-csv-tools')

/**
 * Tell if the file is present in cache
 */
export async function isInCache(cacheFile: string): Promise<boolean> {
  await fs.ensureDir(CACHE_DIR)
  return await fs.pathExists(path.join(CACHE_DIR, cacheFile))
}

/**
 * Read csv using papaparse
 */
async function readCsv(filePath: string): Promise<Array<any>> {
  return Papa.parse((await fs.readFile(filePath, 'utf8')).trim(), {
    dynamicTyping: true
  }).data
}

/**
 * Read json from file
 */
async function readJSON(filePath: string): Promise<any> {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

/**
 * Return data read from cache for the given filename
 */
export async function readFromCache(cacheFile: string): Promise<any> {
  let filePath = path.join(CACHE_DIR, cacheFile)
  if (filePath.endsWith('.json')) {
    return await readJSON(filePath)
  } else if (filePath.endsWith('.csv')) {
    return await readCsv(filePath)
  } else {
    throw Error('File type not understood')
  }
}

/**
 * Write the provided data in cacheFile
 */
export async function writeInCache(cacheFile: string, data: any):  Promise<string> {
  await fs.ensureDir(CACHE_DIR)
  await fs.writeFile(path.join(CACHE_DIR, cacheFile), data)
  return cacheFile
}
