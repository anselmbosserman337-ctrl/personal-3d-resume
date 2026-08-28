"""Generate non-destructive, display-sized WebP assets for the portfolio."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "public"
RESAMPLE = Image.Resampling.LANCZOS


def save_and_report(source: Image.Image, destination: Path, *, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    source.save(destination, "WEBP", quality=quality, method=6)
    with Image.open(destination) as decoded:
        expected = np.asarray(source.convert("RGB"), dtype=np.float32)
        actual = np.asarray(decoded.convert("RGB"), dtype=np.float32)
    mse = float(np.mean((expected - actual) ** 2))
    psnr = math.inf if mse == 0 else 20 * math.log10(255 / math.sqrt(mse))
    print(f"{destination.relative_to(ROOT)} {source.width}x{source.height} {destination.stat().st_size} bytes PSNR={psnr:.2f}dB")


def resized(source_path: str, destination_path: str, *, width: int, quality: int) -> None:
    with Image.open(ROOT / source_path) as image:
        image = image.convert("RGB")
        height = round(image.height * width / image.width)
        output = image.resize((width, height), RESAMPLE)
        save_and_report(output, ROOT / destination_path, quality=quality)


def cover_crop(image: Image.Image, width: int, height: int) -> Image.Image:
    target_ratio = width / height
    source_ratio = image.width / image.height
    if source_ratio > target_ratio:
        crop_width = round(image.height * target_ratio)
        left = (image.width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, image.height))
    else:
        crop_height = round(image.width / target_ratio)
        top = (image.height - crop_height) // 2
        image = image.crop((0, top, image.width, top + crop_height))
    return image.resize((width, height), RESAMPLE)


def hero_variant(destination: str, width: int, height: int, quality: int) -> None:
    with Image.open(ROOT / "scrapbook/hero-scrapbook-full.webp") as image:
        output = cover_crop(image.convert("RGB"), width, height)
        save_and_report(output, ROOT / destination, quality=quality)


def main() -> None:
    resized("works/covers/economics.png", "works/optimized/economics-cover.webp", width=720, quality=86)
    resized("works/covers/ai.png", "works/optimized/ai-cover.webp", width=720, quality=86)
    resized("works/covers/expression.png", "works/optimized/programming-cover.webp", width=720, quality=86)
    resized(
        "works/covers/expression-writing-image-one.png",
        "works/optimized/expression-writing-cover.webp",
        width=720,
        quality=86,
    )
    resized("works/nova/gallery-composite.jpg", "works/optimized/project-nova-cover.webp", width=720, quality=84)
    hero_variant("scrapbook/hero-scrapbook-mobile.webp", 900, 1600, 84)
    hero_variant("scrapbook/hero-scrapbook-tablet.webp", 1280, 960, 84)


if __name__ == "__main__":
    main()
