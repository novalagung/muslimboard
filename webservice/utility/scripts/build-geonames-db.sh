#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="https://download.geonames.org/export/dump"
DATA_DIR="${GEONAMES_DATA_DIR:-$SCRIPT_DIR/data/geonames}"
OUTPUT="${GEONAMES_DB_PATH:-data/geonames.sqlite}"

mkdir -p "$DATA_DIR"

download() {
    file="$1"
    if [ ! -f "$DATA_DIR/$file" ]; then
        curl -L "$BASE_URL/$file" -o "$DATA_DIR/$file"
    fi
}

download "cities500.zip"
download "alternateNamesV2.zip"
download "countryInfo.txt"
download "admin1CodesASCII.txt"
download "admin2Codes.txt"

go run ./utility/geonames-import -data-dir "$DATA_DIR" -output "$OUTPUT"
