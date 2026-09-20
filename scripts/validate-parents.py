#!/usr/bin/env python3
"""Validate content/parents.json against content/parents.schema.json.

Run from repo root:
    python3 scripts/validate-parents.py

Exits 0 on success, 1 on failure (with a reason). Pre-commit hook target.
"""
import json, sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
SCHEMA = ROOT / "content" / "parents.schema.json"
DATA = ROOT / "content" / "parents.json"

try:
    import jsonschema  # type: ignore
except ImportError:
    sys.stderr.write(
        "jsonschema not installed. Run: pip install jsonschema\n"
    )
    sys.exit(2)

with SCHEMA.open(encoding="utf-8") as f:
    schema = json.load(f)
with DATA.open(encoding="utf-8") as f:
    data = json.load(f)

try:
    jsonschema.validate(data, schema)
except jsonschema.ValidationError as e:
    sys.stderr.write(f"parents.json invalid: {e.message}\n")
    sys.exit(1)

# Pin-window sanity check
today = date.today().isoformat()
for m in data.get("messages", []):
    pin = m.get("pin_until")
    if pin and pin < today:
        sys.stderr.write(
            f"warning: message {m.get('id')} has expired pin_until ({pin})\n"
        )

sys.stdout.write("parents.json OK\n")
