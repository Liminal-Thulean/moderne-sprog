#!/usr/bin/env python3
"""
build.py — Glossarium static build
Stitches _shared.js + _reader.js + _tables.js into each language's HTML.

Usage:
    python3 build.py          # builds greek/greek.html and latin/latin.html
    python3 build.py --watch  # rebuilds on any source file change

Source files (edit these):
    greek/greek_shell.html    <- App component + script tags placeholder
    greek/greek_shared.js     <- toKey, tokenise, POS_COLORS, WordToken
    greek/greek_reader.js     <- WORKS, INLINE_DICT, ReaderMode
    greek/greek_tables.js     <- paradigms, CATEGORIES, table components

Output (deploy these):
    greek/greek.html          <- fully inlined, ready for Azure Static Web Apps
    latin/latin.html
"""

import os, sys, re, time, hashlib

BASE = os.path.dirname(os.path.abspath(__file__))

LANGUAGES = {
    "greek": {
        "shell":   "greek/greek_shell.html",
        "modules": ["greek/greek_shared.js", "greek/greek_reader.js", "greek/greek_tables.js"],
        "out":     "greek/greek.html",
    },
    "latin": {
        "shell":   "latin/latin_shell.html",
        "modules": ["latin/latin_shared.js", "latin/latin_reader.js", "latin/latin_tables.js"],
        "out":     "latin/latin.html",
    },
}

PLACEHOLDER = "// @@MODULES@@"

def build(lang, cfg):
    shell_path = os.path.join(BASE, cfg["shell"])
    out_path   = os.path.join(BASE, cfg["out"])

    with open(shell_path, encoding="utf-8") as f:
        shell = f.read()

    if PLACEHOLDER not in shell:
        print(f"  WARNING: '{PLACEHOLDER}' not found in {cfg['shell']}")
        return

    parts = []
    for mod in cfg["modules"]:
        mod_path = os.path.join(BASE, mod)
        with open(mod_path, encoding="utf-8") as f:
            src = f.read()
        # Strip the JSDoc header comment if present (optional, keeps output cleaner)
        src = re.sub(r'^/\*\*.*?\*/\s*', '', src, flags=re.DOTALL)
        parts.append(f"// ── {os.path.basename(mod)} ──────────────────────────\n{src.strip()}")

    combined = "\n\n".join(parts)
    output   = shell.replace(PLACEHOLDER, combined)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(output)

    lines = output.count("\n")
    print(f"  Built {cfg['out']} ({lines} lines)")

def build_all():
    print(f"Building...")
    for lang, cfg in LANGUAGES.items():
        try:
            build(lang, cfg)
        except FileNotFoundError as e:
            print(f"  SKIP {lang}: {e}")
    print("Done.\n")

def file_hash(path):
    try:
        with open(path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()
    except:
        return ""

def watch():
    print("Watching for changes (Ctrl+C to stop)...\n")
    watched = {}
    for cfg in LANGUAGES.values():
        for src in [cfg["shell"]] + cfg["modules"]:
            p = os.path.join(BASE, src)
            watched[p] = file_hash(p)

    build_all()
    while True:
        time.sleep(1)
        changed = False
        for p in watched:
            h = file_hash(p)
            if h != watched[p]:
                watched[p] = h
                print(f"  Changed: {os.path.basename(p)}")
                changed = True
        if changed:
            build_all()

if __name__ == "__main__":
    if "--watch" in sys.argv:
        watch()
    else:
        build_all()
