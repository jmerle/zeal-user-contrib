# Zeal User Contrib

[![Build Status](https://github.com/jmerle/zeal-user-contrib/workflows/Build/badge.svg)](https://github.com/jmerle/zeal-user-contrib/actions?query=workflow%3ABuild)
[![Version](https://img.shields.io/npm/v/zeal-user-contrib.svg)](https://npmjs.org/package/zeal-user-contrib)

![](https://i.imgur.com/Tax0nTT.gif)

A convenient CLI to add Dash's User Contributed docsets to Zeal. It automates the process of going to [zealusercontributions.now.sh](https://zealusercontributions.now.sh/), adding the XML feed to Zeal and downloading the icons to the correct directory.

## Install

```
$ npm install --global zeal-user-contrib
```

## Usage

```
Usage: zeal-user-contrib [options]

Options:
  -V, --version                  output the version number
  -m, --mirror <mirror>          the mirror to use, by default a random one is chosen (choices: "sanfrancisco", "newyork", "london", "frankfurt")
  -o, --output-directory <path>  path to Zeal's docsets directory, overriding the default search for it
  -f, --force                    overwrite existing docsets
  -h, --help                     display help for command
```
