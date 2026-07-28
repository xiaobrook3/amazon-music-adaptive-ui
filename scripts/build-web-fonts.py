"""Repack the Ember Modern OTFs as WOFF2 for the web build.

Browsers' OpenType Sanitizer rejects the shipped Ember Modern OTFs, so the
hosted web build silently fell back to Amazon Ember for every headline.
Repacking as WOFF2 normalizes the tables, passes OTS, and cuts ~60% of the
file size. Native keeps using the original OTFs.

Usage:  python -m pip install fonttools brotli
        python scripts/build-web-fonts.py
"""
import os
import sys
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets", "fonts", "Amazon_Music_FONTS", "Ember Modern 1.1")
OUT = os.path.join(ROOT, "assets", "fonts", "EmberModern")

JOBS = [
    ("EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Regular.otf", "EmberModernDisplay-Regular.woff2"),
    ("EmberModernDisplay-V1.1/EmberModernDisplayV1.1-Bold.otf",    "EmberModernDisplay-Bold.woff2"),
    ("EmberModernText-V1.1/EmberModernTextV1.1-Regular.otf",       "EmberModernText-Regular.woff2"),
    ("EmberModernText-V1.1/EmberModernTextV1.1-Bold.otf",          "EmberModernText-Bold.woff2"),
]


def main():
    os.makedirs(OUT, exist_ok=True)
    missing = 0

    for src_rel, out_name in JOBS:
        src = os.path.join(SRC, *src_rel.split("/"))
        dst = os.path.join(OUT, out_name)
        if not os.path.exists(src):
            print(f"MISSING  {src_rel}")
            missing += 1
            continue

        font = TTFont(src)
        family = next((r.toUnicode() for r in font["name"].names if r.nameID == 1), "?")
        style = next((r.toUnicode() for r in font["name"].names if r.nameID == 2), "?")
        font.flavor = "woff2"
        font.save(dst)

        print(f"OK  {out_name:38s} <- [{family} / {style}]  "
              f"{os.path.getsize(src) // 1024}KB -> {os.path.getsize(dst) // 1024}KB")

    if missing:
        print(f"\n{missing} source font(s) missing — web will fall back to Amazon Ember.")
        return 1
    print("\nwrote to:", OUT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
