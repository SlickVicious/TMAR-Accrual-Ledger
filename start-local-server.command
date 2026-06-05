#!/bin/bash
# ============================================================
#  start-local-server.command  (macOS — double-clickable)
#  Serves the TMAR app locally over HTTP so it has a STABLE
#  origin (localStorage persists, no file:// security errors,
#  behaves like the deployed site).
#
#  Bookmark this URL and use it for ALL local testing:
#      http://localhost:5501/TMAR-Accrual-Ledger.html
#  (Configure your CORS proxy + API key ONCE on that origin;
#   they persist as long as you keep using localhost:5501.)
#
#  If double-click is blocked, run once:  chmod +x start-local-server.command
# ============================================================
cd "$(dirname "$0")" || exit 1
PORT=5501
PAGE="TMAR-Accrual-Ledger.html"

if ! command -v python3 >/dev/null 2>&1; then
  echo "[!] python3 not found. Install it (python.org or 'brew install python')."
  read -n 1 -s -r -p "Press any key to close..."; echo
  exit 1
fi

if [ ! -f "$PAGE" ]; then
  echo "[!] $PAGE not found in: $(pwd)"
  echo "    Keep this script in the same folder as the TMAR HTML file."
  read -n 1 -s -r -p "Press any key to close..."; echo
  exit 1
fi

echo "============================================================"
echo "  TMAR local server"
echo "  Folder : $(pwd)"
echo "  URL    : http://localhost:$PORT/$PAGE"
echo "------------------------------------------------------------"
echo "  Leave this window open. Press Ctrl+C (or close it) to stop."
echo "============================================================"

# Open the browser once the server has had a moment to bind.
( sleep 1 && open "http://localhost:$PORT/$PAGE" ) &
exec python3 -m http.server "$PORT"
