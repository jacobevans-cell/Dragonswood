#!/usr/bin/env bash
cd "$(dirname "$0")/../site" && python3 -m http.server 8080
