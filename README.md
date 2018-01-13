# flusight-csv-tools

[![Build Status](https://img.shields.io/travis/reichlab/flusight-csv-tools/master.svg?style=flat-square)](https://travis-ci.org/reichlab/flusight-csv-tools)
[![npm](https://img.shields.io/npm/v/flusight-csv-tools.svg?style=flat-square)](https://www.npmjs.com/package/flusight-csv-tools)
[![npm](https://img.shields.io/npm/l/flusight-csv-tools.svg?style=flat-square)](https://www.npmjs.com/package/flusight-csv-tools)

_This is a work in progress as of now._

Node toolkit for CDC FluSight format CSVs. Provides features for:

```js
const fct = require('flusight-csv-tools')
```

1. Parsing CSVs (`fct.Csv` class)
2. Verifying CSVs (`fct.verify` module)
3. Scoring targets (`fct.score` module)
4. Fetching true values (`fct.truth` module)
5. Metadata related to CDC FluSight (`fct.meta` module)
6. Utilities for working with
   - Bin distributions (`fct.utils.bins` module)
   - Time and epiweeks (`fct.utils.epiweek` module)
