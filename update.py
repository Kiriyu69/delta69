import requests
import os
import re

SOURCE_URL = "https://raw.githubusercontent.com/Love4vn/Stalker2M3U-public/refs/heads/main/Mac_playlist.m3u"

CHANNELS = {
    "TNT SPORTS 1 HD": "data/tnts1.txt",
    "TNT SPORTS 2 HD": "data/tnts2.txt",
    "TNT SPORTS 3 HD": "data/tnts3.txt",
    "TNT SPORTS 4 HD": "data/tnts4.txt",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

def get_playlist():
    r = requests.get(SOURCE_URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.text

def find_channel_url(m3u_text, channel_name):
    lines = [line.strip() for line in m3u_text.splitlines() if line.strip()]

    for i, line in enumerate(lines):
        if line.startswith("#EXTINF") and channel_name.lower() in line.lower():
            for j in range(i + 1, min(i + 6, len(lines))):
                if lines[j].startswith("http"):
                    return lines[j]

    return None

def main():
    os.makedirs("data", exist_ok=True)

    m3u = get_playlist()

    for name, output_file in CHANNELS.items():
        url = find_channel_url(m3u, name)

        if url:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(url.strip() + "\n")
            print(f"OK: {name} -> {output_file}")
        else:
            print(f"NOT FOUND: {name}")

if __name__ == "__main__":
    main()