---
name: uv
description: Use when you plan to use the `uv` CLI for managing Python projects.
---

**General guidelines**
1. Never use "uv pip..." or "uv run python...". These can be replaced: instead of `uv pip install xyz`, just run `uv add xyz` (and ideally first use `uv init` and `uv venv`, then `source .venv/bin/activate`, to isolate your deps). Instead of `uv run python xyz.py`, just run `uv run xyz.py`.
