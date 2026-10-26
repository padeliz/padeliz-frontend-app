#!/usr/bin/env python3
"""Hard rename edition→event in player App (except singular app/event screen folder)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {"node_modules", ".git", "tools", ".expo", "dist", "assets"}

REPLACEMENTS = [
    ("id_edition_division", "id_event_division"),
    ("edition_division_id", "event_division_id"),
    ("id_edition", "id_event"),
    ("edition_id", "event_id"),
    ("/editions/", "/events/"),
    ("/editions", "/events"),
    ("'editions'", "'events'"),
    ('"editions"', '"events"'),
    ("host: 'editions'", "host: 'events'"),
    ('host: "editions"', 'host: "events"'),
    ("padeliz-app://editions", "padeliz-app://events"),
    ("editionShareUrl", "eventShareUrl"),
    ("Edition", "Event"),
    ("edition", "event"),
]


def transform(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = text.replace("EventEvent", "Event")
    text = text.replace("event_event_", "event_")
    # Keep in-app route folder semantics: app/event is already singular — don't break /event/
    return text


def main() -> None:
    updated = 0
    for path in ROOT.rglob("*"):
        try:
            if not path.is_file() or path.is_symlink():
                continue
        except OSError:
            continue
        if any(part in SKIP for part in path.parts):
            continue
        if path.suffix not in {".ts", ".tsx", ".js", ".jsx", ".json"}:
            continue
        text = path.read_text(encoding="utf-8")
        new = transform(text)
        if new != text:
            path.write_text(new, encoding="utf-8")
            updated += 1
    print(f"content updated: {updated}")

    # Rename app/editions → app/events deeplink folder
    editions_dir = ROOT / "app" / "editions"
    if editions_dir.exists():
        target = ROOT / "app" / "events"
        if not target.exists():
            editions_dir.rename(target)
            print("renamed app/editions -> app/events")

    files = [p for p in ROOT.rglob("*") if p.is_file() and "edition" in p.name.lower() and "node_modules" not in p.parts]
    files.sort(key=lambda p: len(str(p)), reverse=True)
    for f in files:
        new_name = f.name.replace("edition", "event").replace("Edition", "Event")
        target = f.with_name(new_name)
        if target.exists() or f == target:
            continue
        f.rename(target)
        print(f"file {f.relative_to(ROOT)} -> {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
