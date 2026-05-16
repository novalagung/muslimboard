#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="https://download.geonames.org/export/dump"
ZIP_BASE_URL="https://download.geonames.org/export/zip"
DATA_DIR="${GEONAMES_DATA_DIR:-$SCRIPT_DIR/data/geonames}"
OUTPUT="${GEONAMES_DB_PATH:-data/geonames.sqlite}"

mkdir -p "$DATA_DIR"

download_from() {
    base_url="$1"
    file="$2"
    if [ -f "$DATA_DIR/$file" ]; then
        echo "skip existing: $file"
        return
    fi
    echo "download: $file"
    curl -L "$base_url/$file" -o "$DATA_DIR/$file"
}

download_from "$BASE_URL" "cities500.zip"
download_from "$BASE_URL" "alternateNamesV2.zip"
download_from "$BASE_URL" "countryInfo.txt"
download_from "$BASE_URL" "admin1CodesASCII.txt"
download_from "$BASE_URL" "admin2Codes.txt"
download_from "$ZIP_BASE_URL" "allCountries.zip"

go run ./utility/geonames-import -data-dir "$DATA_DIR" -output "$OUTPUT"
