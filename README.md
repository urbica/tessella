# Mapbox Vector Tiles Server

Tessella is a lightweight Node.js [Mapbox Vector Tiles](https://github.com/mapbox/vector-tile-spec) server.

## Installation

Tessella depends on node version 7.

```shell
npm install tessella -g
```

...or build from source

```shell
git clone https://github.com/urbica/tessella.git
cd tessella
npm install
```

## Usage

```shell
tessella data.mbtiles
```

## Using with Docker

```shell
docker run -d -p 4000:4000 -v <path>:/usr/src/app/data.mbtiles urbica/tessella
```

Where `path` is path to your mbtiles file.

```shell
docker run -d \
  -p 4000:4000 \
  -v ./poi.mbtiles:/usr/src/app/data.mbtiles
  urbica/tessella
```
