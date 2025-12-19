#!/usr/bin/env python3
"""
Generate mock vocabulary data with audio and lightweight SVG art.

This script creates:
  - mock-data/cards.json
  - mock-data/audio/*.wav        (pronunciation + example sentence)
  - mock-data/images/*.svg       (simple semantic illustrations)

Prerequisites: macOS `say` + `afconvert` for audio generation.
"""

from __future__ import annotations

import json
import subprocess
from html import escape
from pathlib import Path
from typing import Callable, Dict, List, Tuple

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "audio"
IMAGE_DIR = ROOT / "images"
DATA_FILE = ROOT / "cards.json"


Card = Dict[str, object]
SceneBuilder = Callable[[Card], Tuple[str, str]]


cards: List[Card] = [
    {
        "id": "east",
        "word": "east",
        "partOfSpeech": "noun",
        "phonetic": "iːst",
        "cefrLevel": "B1",
        "rank": 1,
        "definition": "the direction where the sun rises",
        "example": "My window looks to the east, so I can watch the sunrise every morning.",
        "imageAlt": "Sunrise spreading light over an eastern horizon.",
        "tags": ["direction", "geography"],
        "theme": "sunrise",
        "palette": ["#0f172a", "#1e3a8a", "#f59e0b", "#fbbf24"],
    },
    {
        "id": "expensive",
        "word": "expensive",
        "partOfSpeech": "adjective",
        "phonetic": "ɪkˈspensɪv",
        "cefrLevel": "B2",
        "rank": 2,
        "definition": "costing a lot of money",
        "example": "My friend drives an expensive sports car.",
        "imageAlt": "Sleek sports car on a road.",
        "tags": ["money", "lifestyle"],
        "theme": "car",
        "palette": ["#0b132b", "#1c2541", "#4cc9f0", "#e0fbfc"],
    },
    {
        "id": "flower",
        "word": "flower",
        "partOfSpeech": "noun",
        "phonetic": "ˈflaʊər",
        "cefrLevel": "A2",
        "rank": 3,
        "definition": "the colored part of a plant that makes seeds or fruit",
        "example": "She gave pink flowers to her grandmother.",
        "imageAlt": "Soft pink flowers with stems and leaves.",
        "tags": ["nature", "plants"],
        "theme": "flower",
        "palette": ["#132a13", "#2d6a4f", "#ffb3c1", "#ffd6e0"],
    },
    {
        "id": "river",
        "word": "river",
        "partOfSpeech": "noun",
        "phonetic": "ˈrɪvər",
        "cefrLevel": "A2",
        "rank": 4,
        "definition": "a large, natural flow of water across the land",
        "example": "We camped beside the river and listened to the water all night.",
        "imageAlt": "Blue river winding between banks.",
        "tags": ["nature", "water"],
        "theme": "river",
        "palette": ["#0b3c5d", "#1d8a99", "#53c5f2", "#e0fbfc"],
    },
    {
        "id": "mountain",
        "word": "mountain",
        "partOfSpeech": "noun",
        "phonetic": "ˈmaʊntən",
        "cefrLevel": "B1",
        "rank": 5,
        "definition": "a very high hill with steep sides",
        "example": "Clouds wrapped around the mountain after the storm.",
        "imageAlt": "Sharp mountains with snow and a warm sun.",
        "tags": ["nature", "landform"],
        "theme": "mountain",
        "palette": ["#0f172a", "#1e293b", "#10b981", "#fbbf24"],
    },
    {
        "id": "generous",
        "word": "generous",
        "partOfSpeech": "adjective",
        "phonetic": "ˈdʒenərəs",
        "cefrLevel": "B2",
        "rank": 6,
        "definition": "willing to give more help or kindness than is usual",
        "example": "She is generous with her time and mentors new teammates.",
        "imageAlt": "Hands offering a bright heart.",
        "tags": ["character", "kindness"],
        "theme": "hands",
        "palette": ["#172554", "#1d4ed8", "#f472b6", "#f9a8d4"],
    },
    {
        "id": "fragile",
        "word": "fragile",
        "partOfSpeech": "adjective",
        "phonetic": "ˈfrædʒaɪl",
        "cefrLevel": "B2",
        "rank": 7,
        "definition": "easily broken or damaged",
        "example": "The glass vase is fragile, so handle it carefully.",
        "imageAlt": "Shattered glass icon on a warning label.",
        "tags": ["warning", "handling"],
        "theme": "fragile",
        "palette": ["#1f2937", "#111827", "#f97316", "#fbbf24"],
    },
    {
        "id": "victory",
        "word": "victory",
        "partOfSpeech": "noun",
        "phonetic": "ˈvɪktəri",
        "cefrLevel": "B1",
        "rank": 8,
        "definition": "success over an opponent or difficulty",
        "example": "The team celebrated their victory with a trophy parade.",
        "imageAlt": "Golden trophy on a podium.",
        "tags": ["success", "celebration"],
        "theme": "trophy",
        "palette": ["#111827", "#1f2937", "#eab308", "#facc15"],
    },
]


def save_json(data: List[Dict[str, object]]) -> None:
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def speak_to_wav(text: str, destination: Path) -> None:
    """
    Generate audio using macOS `say` and convert to WAV for browser playback.
    """
    if destination.exists():
        return

    temp_aiff = destination.with_suffix(".aiff")
    subprocess.run(["say", "-o", str(temp_aiff), text], check=True)
    subprocess.run(
        ["afconvert", "-f", "WAVE", "-d", "LEI16", str(temp_aiff), str(destination)],
        check=True,
    )
    temp_aiff.unlink(missing_ok=True)


def svg_wrapper(card: Card, scene_defs: str, scene_body: str) -> str:
    colors = card["palette"]
    word = escape(str(card["word"]).title())
    definition = escape(str(card["definition"]).capitalize().rstrip(".") + ".")
    line_two = escape(f"{card['partOfSpeech']} · CEFR {card['cefrLevel']}")

    return f"""<svg viewBox="0 0 960 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{escape(card['imageAlt'])}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{colors[1]}"/>
      <stop offset="100%" stop-color="{colors[0]}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{colors[2]}"/>
      <stop offset="100%" stop-color="{colors[3]}"/>
    </linearGradient>
    {scene_defs}
  </defs>
  <rect width="960" height="600" fill="url(#bg)"/>
  {scene_body}
  <rect x="40" y="36" width="360" height="140" rx="22" fill="#0b0f1a" opacity="0.65"/>
  <text x="64" y="98" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="700">{word}</text>
  <text x="64" y="136" fill="#e2e8f0" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="500">{definition}</text>
  <text x="64" y="168" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600">{line_two}</text>
</svg>"""


def sunrise_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = """
    <radialGradient id="sunGlow" cx="50%" cy="60%" r="60%">
      <stop offset="0%" stop-color="rgba(255, 223, 138, 0.9)"/>
      <stop offset="100%" stop-color="rgba(255, 223, 138, 0)"/>
    </radialGradient>
    """
    body = f"""
    <rect y="360" width="960" height="240" fill="{colors[0]}" opacity="0.85"/>
    <circle cx="480" cy="360" r="140" fill="url(#sunGlow)"/>
    <circle cx="480" cy="360" r="110" fill="{colors[3]}" opacity="0.95"/>
    <g stroke="{colors[3]}" stroke-width="10" stroke-linecap="round">
      <line x1="480" y1="360" x2="480" y2="232"/>
      <line x1="480" y1="360" x2="612" y2="304"/>
      <line x1="480" y1="360" x2="348" y2="304"/>
      <line x1="480" y1="360" x2="620" y2="360"/>
      <line x1="480" y1="360" x2="340" y2="360"/>
    </g>
    <rect y="360" width="960" height="36" fill="{colors[2]}" opacity="0.9"/>
    """
    return defs, body


def car_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = """
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(255,255,255,0.9)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.6)"/>
    </linearGradient>
    """
    body = f"""
    <rect y="400" width="960" height="200" fill="{colors[0]}" opacity="0.8"/>
    <rect y="360" width="960" height="40" fill="{colors[1]}"/>
    <path d="M200 390 Q280 320 420 320 L610 320 Q700 320 750 360 L800 390 L800 420 L200 420 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="440" y="330" width="120" height="60" rx="8" fill="url(#glass)" stroke="{colors[3]}" stroke-width="3"/>
    <rect x="300" y="330" width="110" height="60" rx="8" fill="url(#glass)" stroke="{colors[3]}" stroke-width="3"/>
    <g fill="#0f172a" stroke="{colors[3]}" stroke-width="8">
      <circle cx="300" cy="420" r="46"/>
      <circle cx="680" cy="420" r="46"/>
    </g>
    """
    return defs, body


def flower_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = """
    <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
      <stop offset="100%" stop-color="rgba(255,182,193,0.6)"/>
    </radialGradient>
    """
    body = f"""
    <rect y="380" width="960" height="220" fill="{colors[0]}" opacity="0.8"/>
    <g stroke="{colors[1]}" stroke-width="14" stroke-linecap="round">
      <line x1="360" y1="380" x2="360" y2="520"/>
      <line x1="480" y1="360" x2="480" y2="520"/>
      <line x1="600" y1="380" x2="600" y2="520"/>
    </g>
    <g stroke="{colors[1]}" stroke-width="12" stroke-linecap="round">
      <line x1="360" y1="440" x2="320" y2="420"/>
      <line x1="600" y1="440" x2="640" y2="420"/>
    </g>
    <g>
      <circle cx="360" cy="340" r="50" fill="url(#bloom)" stroke="{colors[3]}" stroke-width="6"/>
      <circle cx="480" cy="310" r="60" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="6"/>
      <circle cx="600" cy="340" r="50" fill="url(#bloom)" stroke="{colors[3]}" stroke-width="6"/>
    </g>
    """
    return defs, body


def river_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = ""
    body = f"""
    <rect y="360" width="960" height="240" fill="{colors[1]}" opacity="0.8"/>
    <path d="M0 260 C180 280 220 220 360 240 C520 264 560 210 760 240 C870 258 930 240 960 230 L960 420 L0 420 Z" fill="{colors[2]}" opacity="0.9"/>
    <path d="M0 400 C180 380 300 420 480 380 C640 348 760 410 960 380 L960 600 L0 600 Z" fill="{colors[3]}" opacity="0.6"/>
    """
    return defs, body


def mountain_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = ""
    body = f"""
    <circle cx="140" cy="140" r="70" fill="{colors[3]}" opacity="0.9"/>
    <path d="M120 420 L360 200 L520 420 Z" fill="{colors[1]}" stroke="{colors[3]}" stroke-width="4"/>
    <path d="M320 420 L540 170 L780 420 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="4"/>
    <polygon points="540,170 580,220 500,220" fill="#ffffff" opacity="0.85"/>
    <polygon points="360,200 400,250 320,250" fill="#ffffff" opacity="0.85"/>
    <rect y="420" width="960" height="180" fill="{colors[0]}" opacity="0.85"/>
    """
    return defs, body


def hands_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = ""
    body = f"""
    <rect y="360" width="960" height="240" fill="{colors[0]}" opacity="0.75"/>
    <path d="M260 420 Q320 390 360 420 L460 470 Q500 500 460 520 L320 520 Q240 500 240 460 Z" fill="{colors[1]}" stroke="{colors[3]}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M700 420 Q640 390 600 420 L500 470 Q460 500 500 520 L640 520 Q720 500 720 460 Z" fill="{colors[1]}" stroke="{colors[3]}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M480 360 C480 320 520 300 540 320 C560 300 600 320 600 360 C600 410 540 440 540 440 C540 440 480 410 480 360 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="6"/>
    """
    return defs, body


def fragile_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = ""
    body = f"""
    <rect x="260" y="200" width="440" height="320" rx="22" fill="{colors[1]}" stroke="{colors[3]}" stroke-width="10" opacity="0.9"/>
    <polygon points="320,240 440,300 400,340 520,380 420,440 520,500 360,500 360,320" fill="{colors[2]}" opacity="0.85"/>
    <line x1="360" y1="220" x2="600" y2="220" stroke="{colors[3]}" stroke-width="10"/>
    <line x1="320" y1="520" x2="640" y2="520" stroke="{colors[3]}" stroke-width="10"/>
    """
    return defs, body


def trophy_scene(card: Card) -> Tuple[str, str]:
    colors = card["palette"]
    defs = ""
    body = f"""
    <rect y="420" width="960" height="180" fill="{colors[0]}" opacity="0.8"/>
    <path d="M360 420 L600 420 L600 360 Q660 330 660 260 L660 200 L300 200 L300 260 Q300 330 360 360 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M360 200 L300 200 C280 230 240 240 220 220 C190 200 190 160 220 150 C240 140 270 160 300 190 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="8"/>
    <path d="M600 200 L660 200 C680 230 720 240 740 220 C770 200 770 160 740 150 C720 140 690 160 660 190 Z" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="8"/>
    <rect x="420" y="420" width="120" height="50" fill="{colors[2]}" stroke="{colors[3]}" stroke-width="6" rx="8"/>
    <rect x="360" y="470" width="240" height="30" fill="{colors[3]}" opacity="0.9" rx="6"/>
    <circle cx="480" cy="280" r="42" fill="{colors[3]}" opacity="0.95"/>
    """
    return defs, body


SCENES: Dict[str, SceneBuilder] = {
    "sunrise": sunrise_scene,
    "car": car_scene,
    "flower": flower_scene,
    "river": river_scene,
    "mountain": mountain_scene,
    "hands": hands_scene,
    "fragile": fragile_scene,
    "trophy": trophy_scene,
}


def build_media(card: Card) -> Card:
    theme = card["theme"]
    if theme not in SCENES:
        raise ValueError(f"Unknown scene theme: {theme}")

    defs, body = SCENES[theme](card)
    svg = svg_wrapper(card, defs, body)
    image_path = IMAGE_DIR / f"{card['id']}.svg"
    image_path.write_text(svg)

    pronunciation_audio = AUDIO_DIR / f"{card['id']}_pronunciation.wav"
    example_audio = AUDIO_DIR / f"{card['id']}_sentence.wav"
    speak_to_wav(str(card["word"]), pronunciation_audio)
    speak_to_wav(str(card["example"]), example_audio)

    return {
        "id": card["id"],
        "word": card["word"],
        "partOfSpeech": card["partOfSpeech"],
        "phonetic": card["phonetic"],
        "cefrLevel": card["cefrLevel"],
        "rank": card["rank"],
        "definition": card["definition"],
        "example": card["example"],
        "image": f"images/{card['id']}.svg",
        "imageAlt": card["imageAlt"],
        "audio": {
            "pronunciation": f"audio/{card['id']}_pronunciation.wav",
            "example": f"audio/{card['id']}_sentence.wav",
        },
        "tags": card["tags"],
    }


def main() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    output_cards = [build_media(card) for card in cards]
    save_json(output_cards)


if __name__ == "__main__":
    main()
