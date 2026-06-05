from datetime import datetime
import os
import re
import requests

# Jika file "target url.txt" ada di repo, script akan baca dari file itu.
# Jika tidak ada, script akan ambil dari URL di bawah.
SOURCE_FILE = "target url.txt"
M3U_URL = "https://github.com/Love4vn/Stalker2M3U/raw/refs/heads/1/Mac_playlist.m3u"

# =========================
# TARGET CHANNELS
# =========================
TARGETS = [
    {
        "name": "TNT SPORTS 1 HEVC HD",
        "match": "UK: TNT SPORTS 1 HEVC HD",
        "output": "tnts1.m3u8",
    },
    {
        "name": "TNT SPORTS 2 HEVC HD",
        "match": "UK: TNT SPORTS 2 HEVC HD",
        "output": "tnts2.m3u8",
    },
    {
        "name": "TNT SPORTS 3 HEVC HD",
        "match": "UK: TNT SPORTS 3 HEVC HD",
        "output": "tnts3.m3u8",
    },
    {
        "name": "TNT SPORTS 4 HEVC HD",
        "match": "UK: TNT SPORTS 4 HEVC HD",
        "output": "tnts4.m3u8",
    },
]

BANDWIDTH = 2128000


def norm(text):
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def parse_attr(extinf, key):
    marker = key + '="'
    if marker not in extinf:
        return ""
    return extinf.split(marker, 1)[1].split('"', 1)[0].strip()


def is_url(line):
    return line.lower().startswith(("http://", "https://"))


def load_source_text():
    if os.path.exists(SOURCE_FILE):
        print(f"{datetime.now()} baca list lokal: {SOURCE_FILE}")
        with open(SOURCE_FILE, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    print(f"{datetime.now()} ambil list remote: {M3U_URL}")
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    r = requests.get(M3U_URL, headers=headers, timeout=40)
    r.raise_for_status()
    return r.text


def parse_m3u(text):
    channels = []
    last_extinf = None

    for raw in text.splitlines():
        line = raw.strip()

        if not line:
            continue

        if line.startswith("#EXTINF"):
            last_extinf = line
            continue

        # Abaikan VLCOPT/header lain sampai ketemu URL stream.
        if last_extinf and line.startswith("#"):
            continue

        if last_extinf and is_url(line):
            display_name = last_extinf.rsplit(",", 1)[-1].strip() if "," in last_extinf else ""
            channels.append({
                "name": display_name,
                "tvg_name": parse_attr(last_extinf, "tvg-name"),
                "extinf": last_extinf,
                "url": line,
            })
            last_extinf = None

    return channels


def find_target_channel(channels, target):
    target_match = norm(target["match"])

    # Match utama: nama setelah koma atau tvg-name harus sama persis.
    for ch in channels:
        names = {
            norm(ch.get("name")),
            norm(ch.get("tvg_name")),
        }
        if target_match in names:
            return ch

    # Fallback: cocok tanpa prefix "UK:"
    simple_target = target_match.replace("uk:", "").strip()
    for ch in channels:
        names_joined = " ".join([
            norm(ch.get("name")),
            norm(ch.get("tvg_name")),
        ])
        if simple_target and simple_target in names_joined:
            return ch

    return None


def build_output(url):
    return [
        "#EXTM3U",
        "#EXT-X-VERSION:3",
        "",
        f"#EXT-X-STREAM-INF:BANDWIDTH={BANDWIDTH}",
        url,
    ]


def write_output(path, lines):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines).rstrip() + "\n")


def run():
    try:
        source_text = load_source_text()
        channels = parse_m3u(source_text)
    except Exception as e:
        print(f"{datetime.now()} gagal ambil/baca list: {e}")
        return

    for target in TARGETS:
        ch = find_target_channel(channels, target)

        if ch:
            lines = build_output(ch["url"])
            count = 1
        else:
            lines = [
                "#EXTM3U",
                f"# ERROR: target tidak ditemukan: {target['match']}",
            ]
            count = 0

        write_output(target["output"], lines)

        print(f"{datetime.now()} {target['name']}")
        print(f"IPTV: {count}")
        print(f"生成文件: {target['output']}")
        if ch:
            print(ch["url"])
        print("-" * 50)


if __name__ == "__main__":
    run()
