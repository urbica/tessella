# tessella

[![Build Status](https://travis-ci.org/urbica/tessella.svg?branch=master)](https://travis-ci.org/urbica/tessella)
![docker pulls](https://img.shields.io/docker/pulls/urbica/tessella.svg)
![docker stars](https://img.shields.io/docker/stars/urbica/tessella.svg)

tessella is a lightweight Node.js [Mapbox Vector Tiles](https://github.com/mapbox/vector-tile-spec) server.

## Installation

Tessella requires node v7.6.0 or higher for ES2015 and async function support.
Inspired by [tessera](https://github.com/mojodna/tessera).

```shell
npm install tessella -g
npm install -g <tilelive modules...>
```

...or build from source

```shell
git clone https://github.com/urbica/tessella.git
cd tessella
yarn
```

## Usage

```shell
Usage: tessella [options] [URI]

where [URI] is is tilelive URI to serve and [options] is any of:
 --port - port to run on (default: 4000)
 --socket - use Unix socket instead of port
 --version - returns running version then exits
```

### Examples

MBTiles

```shell
npm install -g mbtiles
tessella mbtiles://./whatever.mbtiles
```

PostGIS

```shell
npm install -g tilelive-postgis
tessella postgis://localhost/test?table=tableName&geometry_field=geom
```

## Using with Docker

```shell
docker run -d -p 4000:4000 <URI>
```

Where `URI` is is tilelive URI to serve.
