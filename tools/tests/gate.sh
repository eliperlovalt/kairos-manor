#!/usr/bin/env bash
# The push gate. Runs the CLAUDE.md rules that bind every push:
#   1. the root index.html is exactly the build of src/index.html
#   2. walk_test, reach_test and audit_test pass on src/ AND on the root copy
# On success it writes .git/eh-gate-ok (never committed) holding the hashes of
# both pages. The push hook in .claude/hooks/guard.py checks that stamp.
#
# usage: tools/tests/gate.sh          (about 4.5 minutes in a cloud session)
# Finds EH_NODE_MODULES and CHROME on its own when they are not set.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

if [ -z "${EH_NODE_MODULES:-}" ]; then
  for d in /root/eh-node/node_modules /home/claude/tools/node_modules; do
    [ -d "$d/three" ] && export EH_NODE_MODULES="$d" && break
  done
fi
if [ -z "${CHROME:-}" ]; then
  c=$(ls /opt/pw-browsers/chromium-*/chrome-linux64/chrome 2>/dev/null | head -1)
  [ -n "$c" ] && export CHROME="$c"
fi
[ -d "${EH_NODE_MODULES:-}/three" ] || { echo "gate: no three.js; run npm i three@0.160.0 esbuild and set EH_NODE_MODULES"; exit 1; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
python3 tools/build.py src/index.html "$tmp/built.html" >/dev/null || { echo "gate: build failed"; exit 1; }
if ! cmp -s "$tmp/built.html" index.html; then
  echo "gate: FAIL root index.html is not the build of src/index.html"
  echo "      run: python3 tools/build.py src/index.html index.html"
  exit 1
fi
echo "gate: build matches root copy"
cmp -s src/kits.json kits.json || { echo "gate: FAIL kits.json beside the root page is missing or stale (the Catalog reads it); rebuild"; exit 1; }

fail=0
for f in src .; do
  for t in walk reach audit goal; do
    s=$(date +%s)
    if python3 tools/tests/${t}_test.py "$f" > "$tmp/$t.log" 2>&1; then
      echo "gate: ok   ${t}_test $f ($(( $(date +%s) - s ))s)"
    else
      echo "gate: FAIL ${t}_test $f"; tail -20 "$tmp/$t.log"; fail=1
    fi
  done
done
for f in src .; do
  s=$(date +%s)
  if python3 tools/tests/objects_test.py "$f" > "$tmp/ob.log" 2>&1; then
    echo "gate: ok   objects_test $f ($(( $(date +%s) - s ))s)"
  else
    echo "gate: FAIL objects_test $f"; tail -30 "$tmp/ob.log"; fail=1
  fi
done
for f in src .; do
  s=$(date +%s)
  if ZF_STRICT=0 python3 tools/tests/surface_test.py "$f" > "$tmp/sf.log" 2>&1; then
    echo "gate: ok   surface_test $f ($(( $(date +%s) - s ))s) $(grep -o 'z-fight scan.*' "$tmp/sf.log")"
  else
    echo "gate: FAIL surface_test $f"; tail -20 "$tmp/sf.log"; fail=1
  fi
done
for f in src .; do
  s=$(date +%s)
  if python3 tools/tests/kairos_turntable.py "$f" > "$tmp/kt.log" 2>&1; then
    echo "gate: ok   kairos_turntable $f ($(( $(date +%s) - s ))s)"
  else
    echo "gate: FAIL kairos_turntable $f"; tail -20 "$tmp/kt.log"; fail=1
  fi
done
# v1.67: the walker bot. Every pair of rooms joined by a door, every stair and a circuit of the grounds, walked on foot twice.
# A fall or a pass-through fails the gate; sticks, missing routes and rooms with no way in are printed.
s=$(date +%s)
if python3 tools/tests/walkbot.py src 2 --strict > "$tmp/wb.log" 2>&1; then
  echo "gate: ok   walkbot src ($(( $(date +%s) - s ))s)$(sed -n 2p "$tmp/wb.log")"
  echo "gate:      walkbot:$(grep -E '^  (falls|pass-throughs|sticks|no route|rooms with no way in) ' "$tmp/wb.log" | tr -s ' ' | tr '\n' ';')"
  grep -E '^      ' "$tmp/wb.log" | head -20
else
  echo "gate: FAIL walkbot src"; head -60 "$tmp/wb.log"; fail=1
fi
[ $fail = 0 ] || { rm -f .git/eh-gate-ok; exit 1; }

sha256sum src/index.html index.html > .git/eh-gate-ok
echo "gate: passed; stamp written"
