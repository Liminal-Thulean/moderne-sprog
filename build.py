#!/usr/bin/env python3
"""
build.py — Glossarium static build
Stitches CSS + JS modules into each language's HTML.

Usage:
    python3 build.py          # build all languages
    python3 build.py --watch  # rebuild on any source file change

Source files (edit these):
    glossarium.css             <- shared base styles (variables, keyframes, utilities)
    {lang}/{lang}.css          <- language-specific styles (extends glossarium.css)
    {lang}/{lang}_shell.html   <- App component + placeholders
    {lang}/{lang}_*.js         <- modules (shared, reader, tables, etc.)

Output (deploy these):
    {lang}/{lang}.html         <- fully inlined, ready for Azure Static Web Apps

Placeholders in shell HTML:
    /* @@STYLES@@ */   <- replaced with inlined CSS (glossarium.css + lang.css)
    // @@MODULES@@     <- replaced with concatenated JS modules
"""

import os, sys, re, time, hashlib

BASE = os.path.dirname(os.path.abspath(__file__))

LANGUAGES = {
    "greek": {
        "shell":   "greek/greek_shell.html",
        "css":     ["glossarium.css", "greek/greek.css"],
        "modules": ["greek/greek_shared.js", "greek/greek_reader.js", "greek/greek_tables.js"],
        "out":     "greek/greek.html",
    },
    "latin": {
        "shell":   "latin/latin_shell.html",
        "css":     ["glossarium.css", "latin/latin.css"],
        "modules": ["latin/latin_shared.js", "latin/latin_reader.js", "latin/latin_tables.js"],
        "out":     "latin/latin.html",
    },
    "chinese": {
        "shell":   "chinese/chinese_shell.html",
        "css":     ["glossarium.css", "chinese/chinese.css"],
        "modules": [
            "chinese/chinese_shared.js",
            "chinese/chinese_data.js",
            "chinese/chinese_drill.js",
            "chinese/chinese_reader.js",
            "chinese/chinese_patterns.js",
            "chinese/chinese_matching.js",
        ],
        "out":     "chinese/chinese.html",
    },
}

CSS_PLACEHOLDER = "/* @@STYLES@@ */"
JS_PLACEHOLDER  = "// @@MODULES@@"

def build(lang, cfg):
    shell_path = os.path.join(BASE, cfg["shell"])
    out_path   = os.path.join(BASE, cfg["out"])

    with open(shell_path, encoding="utf-8") as f:
        shell = f.read()

    # ── CSS ──────────────────────────────────────────────────────────────────
    if CSS_PLACEHOLDER in shell:
        css_parts = []
        for css_file in cfg.get("css", []):
            css_path = os.path.join(BASE, css_file)
            try:
                with open(css_path, encoding="utf-8") as f:
                    css_src = f.read().strip()
                # Strip top JSDoc-style comment block if present
                css_src = re.sub(r'^/\*.*?\*/\s*', '', css_src, flags=re.DOTALL)
                css_parts.append(f"/* ── {os.path.basename(css_file)} ── */\n{css_src}")
            except FileNotFoundError:
                print(f"  WARNING: CSS file not found: {css_file}")
        shell = shell.replace(CSS_PLACEHOLDER, "\n\n".join(css_parts))
    else:
        print(f"  NOTE: '{CSS_PLACEHOLDER}' not in {cfg['shell']} — CSS not injected")

    # ── JS ───────────────────────────────────────────────────────────────────
    if JS_PLACEHOLDER not in shell:
        print(f"  WARNING: '{JS_PLACEHOLDER}' not found in {cfg['shell']}")
        return

    js_parts = []
    for mod in cfg["modules"]:
        mod_path = os.path.join(BASE, mod)
        with open(mod_path, encoding="utf-8") as f:
            src = f.read()
        src = re.sub(r'^/\*\*.*?\*/\s*', '', src, flags=re.DOTALL)
        js_parts.append(f"// ── {os.path.basename(mod)} ──────────────────────────\n{src.strip()}")

    shell = shell.replace(JS_PLACEHOLDER, "\n\n".join(js_parts))

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(shell)

    lines = shell.count("\n")
    print(f"  Built {cfg['out']} ({lines} lines)")

def build_all():
    print("Building...")
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
    # Watch CSS files too
    for css in ["glossarium.css"]:
        p = os.path.join(BASE, css)
        watched[p] = file_hash(p)
    for cfg in LANGUAGES.values():
        for src in [cfg["shell"]] + cfg.get("css", []) + cfg["modules"]:
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
