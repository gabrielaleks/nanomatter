#!/bin/sh
rm -f "${MATTER_STORAGE_PATH:-/matter}/matter.lock"
rm -f "${MATTER_STORAGE_PATH:-/matter}/matter.pid"
exec "$@"
