import json
import os
from typing import Any, List
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"


def _path(name: str) -> Path:
    return DATA_DIR / f"{name}.json"


def load_data(name: str) -> List[dict]:
    """Load a JSON data file, returning an empty list if not found."""
    p = _path(name)
    if not p.exists():
        return []
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(name: str, data: Any) -> None:
    """Persist data to a JSON file atomically."""
    p = _path(name)
    tmp = p.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    os.replace(tmp, p)
