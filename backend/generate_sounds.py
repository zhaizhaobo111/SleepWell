"""Generate ambient sleep sounds - fully vectorized numpy, no loops."""
import os
import wave
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "sounds")
SR = 44100
DUR = 60
N = SR * DUR


def write_wav(filename: str, samples: np.ndarray):
    path = os.path.join(OUTPUT_DIR, filename)
    samples = np.clip(samples, -1, 1)
    int16 = (samples * 32767).astype(np.int16)
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(int16.tobytes())
    mb = os.path.getsize(path) / 1024 / 1024
    print(f"  {filename} ({mb:.1f} MB)")


def moving_avg(signal: np.ndarray, window: int) -> np.ndarray:
    """Fast moving average via cumsum."""
    cs = np.cumsum(np.insert(signal, 0, 0))
    result = (cs[window:] - cs[:-window]) / window
    # Pad to keep same length
    pad = len(signal) - len(result)
    return np.concatenate([result, np.full(pad, result[-1])])


def white_noise():
    return np.random.uniform(-0.3, 0.3, N)


def pink_noise():
    w = np.random.uniform(-1, 1, N)
    pink = w.copy().astype(np.float64)
    for shift in [2, 4, 8, 16, 32, 64]:
        pink += np.roll(w, shift) / shift
    return (pink / np.max(np.abs(pink)) * 0.3).astype(np.float32)


def brown_noise():
    w = np.random.uniform(-1, 1, N)
    brown = np.cumsum(w) * 0.02
    return (brown / np.max(np.abs(brown)) * 0.5).astype(np.float32)


def rain():
    w = np.random.uniform(-1, 1, N).astype(np.float32)
    # Low-pass via moving average (smooth rain texture)
    rain_base = moving_avg(w, 200) * 8.0
    # Add click droplets
    clicks = np.zeros(N, dtype=np.float32)
    pos = np.random.choice(N, size=N // 500, replace=False)
    clicks[pos] = np.random.uniform(0.3, 0.8, len(pos)).astype(np.float32)
    click_smooth = moving_avg(clicks, 100)
    result = rain_base + click_smooth * 0.5
    return (result / np.max(np.abs(result)) * 0.35).astype(np.float32)


def ocean():
    t = np.arange(N, dtype=np.float32) / SR
    w = np.random.uniform(-1, 1, N).astype(np.float32)
    filtered = moving_avg(w, 300) * 10.0
    envelope = (0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * t)) ** 0.7
    result = filtered * envelope
    return (result / np.max(np.abs(result)) * 0.4).astype(np.float32)


def forest():
    t = np.arange(N, dtype=np.float32) / SR
    w = np.random.uniform(-1, 1, N).astype(np.float32)
    wind = moving_avg(w, 400) * 12.0
    # Bird chirps via sine bursts
    bird = np.zeros(N, dtype=np.float32)
    for start in range(0, N, SR * 6):
        clen = int(SR * 0.25)
        if start + clen > N:
            break
        ct = np.arange(clen, dtype=np.float32) / SR
        freq = 2500 + 800 * np.sin(ct * 50)
        chirp = 0.06 * np.sin(2 * np.pi * freq * ct) * np.exp(-ct * 10)
        bird[start:start+clen] += chirp
    result = wind + bird
    return (result / np.max(np.abs(result)) * 0.35).astype(np.float32)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating ambient sleep sounds...\n")

    fns = {
        "white_noise.wav": white_noise,
        "pink_noise.wav": pink_noise,
        "brown_noise.wav": brown_noise,
        "light_rain.wav": rain,
        "ocean_waves.wav": ocean,
        "forest_ambience.wav": forest,
    }
    for name, fn in fns.items():
        write_wav(name, fn())

    print(f"\nDone! {len(fns)} files in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
