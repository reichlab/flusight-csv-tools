# flusight-csv-tools

[![Build Status](https://img.shields.io/travis/reichlab/flusight-csv-tools/master.svg?style=flat-square)](https://travis-ci.org/reichlab/flusight-csv-tools)
[![npm](https://img.shields.io/npm/v/flusight-csv-tools.svg?style=flat-square)](https://www.npmjs.com/package/flusight-csv-tools)
[![npm](https://img.shields.io/npm/l/flusight-csv-tools.svg?style=flat-square)](https://www.npmjs.com/package/flusight-csv-tools)

Node toolkit for CDC FluSight format CSVs. Provides features for:

_This is a work in progress as of now._

```js
const fct = require('flusight-csv-tools')
```

1. Parsing CSVs (`fct.Submission` class)
2. Verifying CSVs (`fct.verify` module)
3. Scoring targets (`fct.score` module)
4. Fetching true values (`fct.truth` module)
5. Other metadata related to CDC FluSight (`fct.meta` module)
