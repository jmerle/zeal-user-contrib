# Zeal User Contrib

A convenient CLI to add Dash's User Contributed docsets to Zeal.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Build Status](https://dev.azure.com/jmerle/zeal-user-contrib/_apis/build/status/Build?branchName=master)](https://dev.azure.com/jmerle/zeal-user-contrib/_build/latest?definitionId=12&branchName=master)
[![Version](https://img.shields.io/npm/v/zeal-user-contrib.svg)](https://npmjs.org/package/zeal-user-contrib)
[![License](https://img.shields.io/npm/l/zeal-user-contrib.svg)](https://github.com/jmerle/zeal-user-contrib/blob/master/package.json)

## Install

```
$ npm install --global zeal-user-contrib
# or
$ yarn global add zeal-user-contrib
```

## Usage

Simply run `zeal-user-contrib` and select the docset you want to install. If the script cannot find Zeal's docsets directory or if you have custom needs, you can specify the output directory with `--output-directory path/to/zeal/docsets`. 

```
$ zeal-user-contrib --help
conveniently add Dash's User Contributed docsets to Zeal

USAGE
  $ zeal-user-contrib

OPTIONS
  -h, --help                             show CLI help
  -o, --outputDirectory=outputDirectory  path to Zeal's docsets directory, overriding the default search for it
  -v, --verbose
  --version                              show CLI version
```
