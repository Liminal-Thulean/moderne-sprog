#!/usr/bin/env python3
"""
Language Nexus — Azure TTS Audio Generator
Danish (da-DK-ChristelNeural)

SETUP
-----
1. Set your Azure Speech key and region in the config below,
   or export them as environment variables:
       export AZURE_SPEECH_KEY="your_key_here"
       export AZURE_SPEECH_REGION="northeurope"

USAGE
-----
Write one entry per line in your input txt file.
Lines can be:
  - A bare word or phrase:       hej
  - word | filename_stem:        en / et | en_et          (use when da field has slashes/spaces)
  - # comment lines are skipped
  - blank lines are skipped

Run:
    python3 generate_audio.py input.txt

Output:
    audio/da/<filename_stem>.mp3

The filename stem is derived automatically from the text unless you specify one
with the | separator. Rules:
  - lowercase
  - spaces → underscores
  - slashes, commas, special chars → removed
  - Danish letters kept as-is (æ ø å are valid in filenames)

Example input.txt:
    # M1W1 greetings
    hej
    goddag
    farvel
    god morgen
    tak
    
    # M1W2 numbers
    nul
    en / et | en_et
    to
    
    # Sentences
    Hej! Jeg hedder Anna. | hej_jeg_hedder_anna
"""

import os
import re
import sys
import time
import pathlib
import urllib.request
import urllib.error
import ssl

# ── CONFIG ────────────────────────────────────────────────────────────────────

SPEECH_KEY    = os.environ.get("AZURE_SPEECH_KEY", "3ADtxoIMrHasg9Gwy9DcltVct2nh4yYk1oL8Ng3bVmlfrgRysSZ8JQQJ99BJACYeBjFXJ3w3AAAYACOG65lj")
SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION", "eastus")
VOICE         = "da-DK-ChristelNeural"
OUTPUT_DIR    = pathlib.Path("audio/da")
RATE          = "0%"      # speaking rate adjustment, e.g. "-10%" to slow down
PITCH         = "0%"      # pitch adjustment

# Delay between API calls (seconds) — be gentle with the free tier
API_DELAY     = 0.3

# ── SSML TEMPLATE ─────────────────────────────────────────────────────────────

SSML_TEMPLATE = """<speak version='1.0' xml:lang='da-DK'>
  <voice name='{voice}'>
    <prosody rate='{rate}' pitch='{pitch}'>
      {text}
    </prosody>
  </voice>
</speak>"""

# ── HELPERS ───────────────────────────────────────────────────────────────────

def make_filename(text: str) -> str:
    """Derive a safe filename stem from Danish text."""
    s = text.lower().strip()
    # Remove punctuation except Danish letters, spaces, hyphens
    s = re.sub(r"[^\wæøå\s\-]", "", s, flags=re.UNICODE)
    # Collapse whitespace to underscores
    s = re.sub(r"\s+", "_", s)
    # Collapse multiple underscores
    s = re.sub(r"_+", "_", s)
    s = s.strip("_")
    return s or "audio"


def parse_input(filepath: str) -> list[tuple[str, str]]:
    """
    Parse input txt file.
    Returns list of (text, filename_stem) tuples.
    """
    entries = []
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "|" in line:
                parts = line.split("|", 1)
                text = parts[0].strip()
                stem = parts[1].strip()
            else:
                text = line
                stem = make_filename(text)
            if text:
                entries.append((text, stem))
    return entries


def synthesise(text: str, out_path: pathlib.Path) -> bool:
    """
    Call Azure TTS REST API and save MP3 to out_path.
    Returns True on success.
    """
    # Escape XML special chars in text
    safe_text = (text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;"))

    ssml = SSML_TEMPLATE.format(
        voice=VOICE,
        rate=RATE,
        pitch=PITCH,
        text=safe_text,
    )

    url = f"https://{SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "LanguageNexus-TTS",
    }

    req = urllib.request.Request(
        url,
        data=ssml.encode("utf-8"),
        headers=headers,
        method="POST",
    )

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            audio_data = resp.read()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(audio_data)
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"    ✗ HTTP {e.code}: {body[:200]}")
        return False
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_audio.py <input.txt> [--overwrite]")
        sys.exit(1)

    input_file = sys.argv[1]
    overwrite  = "--overwrite" in sys.argv

    if SPEECH_KEY == "YOUR_KEY_HERE":
        print("ERROR: Set AZURE_SPEECH_KEY environment variable or edit SPEECH_KEY in the script.")
        sys.exit(1)

    if not pathlib.Path(input_file).exists():
        print(f"ERROR: Input file '{input_file}' not found.")
        sys.exit(1)

    entries = parse_input(input_file)
    if not entries:
        print("No entries found in input file.")
        sys.exit(0)

    print(f"Voice:      {VOICE}")
    print(f"Region:     {SPEECH_REGION}")
    print(f"Output:     {OUTPUT_DIR}/")
    print(f"Entries:    {len(entries)}")
    print(f"Overwrite:  {overwrite}")
    print()

    ok = skip = fail = 0

    for i, (text, stem) in enumerate(entries, 1):
        out_path = OUTPUT_DIR / f"{stem}.mp3"
        prefix   = f"[{i}/{len(entries)}]"

        if out_path.exists() and not overwrite:
            print(f"{prefix} SKIP  {stem}.mp3  (already exists)")
            skip += 1
            continue

        print(f"{prefix} GEN   {stem}.mp3  ← {text!r}")
        success = synthesise(text, out_path)
        if success:
            size = out_path.stat().st_size
            print(f"         ✓ saved ({size/1024:.1f} KB)")
            ok += 1
        else:
            fail += 1

        time.sleep(API_DELAY)

    print()
    print(f"Done — {ok} generated · {skip} skipped · {fail} failed")
    if ok > 0:
        print(f"Files saved to: {OUTPUT_DIR.resolve()}/")


if __name__ == "__main__":
    main()
