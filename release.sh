#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="${ROOT_DIR}/extension"
MANIFESTS_DIR="${EXTENSION_DIR}/manifests"
OUTPUT_DIR="${ROOT_DIR}/release"
TARGETS=(chrome safari edge firefox)

command -v rsync >/dev/null 2>&1 || {
  echo "error: rsync is required" >&2
  exit 1
}

command -v zip >/dev/null 2>&1 || {
  echo "error: zip is required" >&2
  exit 1
}

command -v node >/dev/null 2>&1 || {
  echo "error: node is required" >&2
  exit 1
}

mkdir -p "${OUTPUT_DIR}"

for target in "${TARGETS[@]}"; do
  manifest="${MANIFESTS_DIR}/${target}.json"
  if [[ ! -f "${manifest}" ]]; then
    echo "error: manifest not found for ${target}: ${manifest}" >&2
    exit 1
  fi

  version="$(node -e "console.log(require(process.argv[1]).version)" "${manifest}")"
  archive="${OUTPUT_DIR}/muslimboard-${target}-v${version}.zip"
  stage="$(mktemp -d)"

  rsync -a \
    --exclude "manifests" \
    --exclude ".DS_Store" \
    "${EXTENSION_DIR}/" \
    "${stage}/"

  cp "${manifest}" "${stage}/manifest.json"

  rm -f "${archive}"
  (
    cd "${stage}"
    zip -qr "${archive}" .
  )

  rm -rf "${stage}"
  echo "created ${archive}"
done
