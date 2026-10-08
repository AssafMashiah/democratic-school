#!/usr/bin/env python3
"""Validate the structured attributions used by the philosophy renderer."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "content" / "philosophy.json"

with DATA.open(encoding="utf-8") as source:
    pillars = json.load(source).get("pillars", [])

errors = []
for index, pillar in enumerate(pillars, start=1):
    author = pillar.get("quote_author")
    body = pillar.get("body_he", "")
    if not isinstance(author, str) or not 1 <= len(author) <= 80:
        errors.append(f"pillar {index}: quote_author must be 1–80 characters")
    elif f"({author})" not in body:
        errors.append(f"pillar {index}: quote_author must match an attribution in body_he")

if errors:
    sys.stderr.write("\n".join(errors) + "\n")
    sys.exit(1)

sys.stdout.write("philosophy.json OK\n")
