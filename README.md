# Zeal User Contrib

A convenient CLI to add Dash's User Contributed docsets to Zeal. It automates the process of going to [zealusercontributions.herokuapp.com](https://zealusercontributions.herokuapp.com/), adding the XML feed to Zeal and downloading the icons to the correct directory.

[![Build Status](https://github.com/jmerle/zeal-user-contrib/workflows/Build/badge.svg)](https://github.com/jmerle/zeal-user-contrib/actions?query=workflow%3ABuild)
[![Version](https://img.shields.io/npm/v/zeal-user-contrib.svg)](https://npmjs.org/package/zeal-user-contrib)
[![License](https://img.shields.io/npm/l/zeal-user-contrib.svg)](https://github.com/jmerle/zeal-user-contrib/blob/master/LICENSE)
[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

![](https://i.imgur.com/Tax0nTT.gif)

## Install

```
$ npm install --global zeal-user-contrib
# or
$ yarn global add zeal-user-contrib
```

## Usage

```
$ zeal-user-contrib --help
conveniently add Dash's User Contributed docsets to Zeal

USAGE
  $ zeal-user-contrib

OPTIONS
  -f, --force                                         overwrite existing docsets
  -h, --help                                          show CLI help
  -m, --mirror=sanfrancisco|newyork|london|frankfurt  the mirror to use, by default a random one is chosen
  -o, --output-directory=output-directory             path to Zeal's docsets directory, overriding the default search for it
  -v, --version                                       show CLI version
```
