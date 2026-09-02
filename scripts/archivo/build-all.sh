#!/usr/bin/env bash
# Regenera data/archivo/ completo. Corre desde la raíz del repo.
#   scripts/archivo/build-all.sh              # pega al GraphQL de BSN
#   scripts/archivo/build-all.sh --from-cache # usa raw/graphql/
set -euo pipefail
cd "$(dirname "$0")/../.."
NODE="node --experimental-strip-types --no-warnings"
$NODE scripts/archivo/extract-raw.ts
$NODE scripts/archivo/etl-stats.ts
$NODE scripts/archivo/etl-results.ts "$@"
$NODE scripts/archivo/build-insights.ts
