"""Resize a Radiance RGBE .hdr image without changing exposure or color balance."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import numpy as np


def _decode_scanlines(payload: bytes, width: int, height: int) -> np.ndarray:
    pixels = np.empty((height, width, 4), dtype=np.uint8)
    offset = 0
    for y in range(height):
        marker = payload[offset : offset + 4]
        if len(marker) != 4 or marker[0] != 2 or marker[1] != 2 or marker[2] & 0x80:
            size = width * height * 4
            flat = np.frombuffer(payload[offset : offset + size], dtype=np.uint8)
            if flat.size != size:
                raise ValueError("Unsupported or truncated non-RLE HDR payload")
            return flat.reshape(height, width, 4).copy()
        if (marker[2] << 8 | marker[3]) != width:
            raise ValueError("HDR scanline width does not match header")
        offset += 4
        scanline = np.empty((width, 4), dtype=np.uint8)
        for channel in range(4):
            x = 0
            while x < width:
                code = payload[offset]
                offset += 1
                if code > 128:
                    count = code - 128
                    value = payload[offset]
                    offset += 1
                    scanline[x : x + count, channel] = value
                else:
                    count = code
                    if count == 0:
                        raise ValueError("Invalid zero-length HDR RLE packet")
                    scanline[x : x + count, channel] = np.frombuffer(
                        payload[offset : offset + count], dtype=np.uint8
                    )
                    offset += count
                x += count
        pixels[y] = scanline
    return pixels


def read_hdr(path: Path) -> tuple[np.ndarray, list[bytes], str]:
    data = path.read_bytes()
    header_end = data.find(b"\n\n")
    if header_end < 0:
        raise ValueError("Radiance header terminator not found")
    header = data[:header_end].splitlines()
    resolution_start = header_end + 2
    resolution_end = data.find(b"\n", resolution_start)
    resolution = data[resolution_start:resolution_end].decode("ascii")
    match = re.fullmatch(r"([+-])Y\s+(\d+)\s+([+-])X\s+(\d+)", resolution.strip())
    if not match:
        raise ValueError(f"Unsupported HDR orientation: {resolution}")
    y_sign, height, x_sign, width = match.groups()
    rgba = _decode_scanlines(data[resolution_end + 1 :], int(width), int(height))
    rgb = rgbe_to_float(rgba)
    if y_sign == "+":
        rgb = np.flip(rgb, axis=0)
    if x_sign == "-":
        rgb = np.flip(rgb, axis=1)
    return rgb, header, "-Y {height} +X {width}"


def rgbe_to_float(rgbe: np.ndarray) -> np.ndarray:
    exponent = rgbe[..., 3].astype(np.int32)
    scale = np.ldexp(np.ones(exponent.shape, dtype=np.float32), exponent - (128 + 8))
    scale[exponent == 0] = 0
    return rgbe[..., :3].astype(np.float32) * scale[..., None]


def float_to_rgbe(rgb: np.ndarray) -> np.ndarray:
    maximum = np.max(rgb, axis=2)
    mantissa, exponent = np.frexp(maximum)
    scale = np.zeros_like(maximum, dtype=np.float32)
    valid = maximum > 1e-32
    scale[valid] = mantissa[valid] * 256.0 / maximum[valid]
    rgbe = np.zeros((*rgb.shape[:2], 4), dtype=np.uint8)
    rgbe[..., :3] = np.clip(rgb * scale[..., None], 0, 255).astype(np.uint8)
    rgbe[..., 3][valid] = np.clip(exponent[valid] + 128, 0, 255).astype(np.uint8)
    return rgbe


def _encode_channel(values: np.ndarray) -> bytes:
    output = bytearray()
    i = 0
    size = len(values)
    while i < size:
        run_start = i
        while run_start < size:
            run_length = 1
            while (
                run_start + run_length < size
                and run_length < 127
                and values[run_start + run_length] == values[run_start]
            ):
                run_length += 1
            if run_length >= 4:
                break
            run_start += run_length
        if run_start > i:
            literal_length = min(run_start - i, 128)
            output.append(literal_length)
            output.extend(values[i : i + literal_length].tobytes())
            i += literal_length
            continue
        run_length = 1
        while i + run_length < size and run_length < 127 and values[i + run_length] == values[i]:
            run_length += 1
        output.extend((128 + run_length, int(values[i])))
        i += run_length
    return bytes(output)


def write_hdr(path: Path, rgb: np.ndarray, source_header: list[bytes]) -> None:
    height, width = rgb.shape[:2]
    if not 8 <= width <= 32767:
        raise ValueError("Radiance scanline RLE requires a width from 8 to 32767")
    header = [line for line in source_header if not line.startswith(b"FORMAT=")]
    header.append(b"FORMAT=32-bit_rle_rgbe")
    output = bytearray(b"\n".join(header) + b"\n\n")
    output.extend(f"-Y {height} +X {width}\n".encode("ascii"))
    rgbe = float_to_rgbe(rgb)
    for scanline in rgbe:
        output.extend((2, 2, width >> 8, width & 255))
        for channel in range(4):
            output.extend(_encode_channel(scanline[:, channel]))
    path.write_bytes(output)


def resize_half(rgb: np.ndarray) -> np.ndarray:
    height, width = rgb.shape[:2]
    if width % 2 or height % 2:
        raise ValueError("Half-size averaging requires even source dimensions")
    return rgb.reshape(height // 2, 2, width // 2, 2, 3).mean(axis=(1, 3), dtype=np.float32)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    source, header, _ = read_hdr(args.source)
    resized = resize_half(source)
    write_hdr(args.destination, resized, header)
    verified, _, _ = read_hdr(args.destination)
    error = np.abs(verified - resized)
    print(f"source={source.shape[1]}x{source.shape[0]} destination={verified.shape[1]}x{verified.shape[0]}")
    print(f"bytes={args.destination.stat().st_size} max={verified.max():.6f} mean={verified.mean():.6f}")
    print(f"rgbe_mean_abs_error={error.mean():.8f} rgbe_max_abs_error={error.max():.8f}")


if __name__ == "__main__":
    main()
