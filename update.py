from datetime import datetime
import re
import requests

# Source list channel MAC/Stalker
M3U_URL = "https://github.com/Love4vn/Stalker2M3U/raw/refs/heads/1/Mac_playlist.m3u"

# =========================
# TARGET CHANNELS
# =========================
# Alias disesuaikan dari list channel TNT
TARGETS = [
    {
        "name": "TNT SPORT 1 HD",
        "aliases": ["UK-NOWTV| TNT SPORT 1 HD", "TNT SPORT 1 HD", "TNT SPORTS 1 HD"],
        "output": "TNT_SPORT_1_HD.m3u8",
    },
    {
        "name": "TNT SPORT 2 HD",
        "aliases": ["UK-NOWTV| TNT SPORT 2 HD", "TNT SPORT 2 HD", "TNT SPORTS 2 HD"],
        "output": "TNT_SPORT_2_HD.m3u8",
    },
    {
        "name": "TNT SPORT 3 HD",
        "aliases": ["UK-NOWTV| TNT SPORT 3 HD", "TNT SPORT 3 HD", "TNT SPORTS 3 HD"],
        "output": "TNT_SPORT_3_HD.m3u8",
    },
    {
        "name": "TNT SPORTS 4 HD",
        "aliases": ["UK-NOWTV| TNT SPORTS 4 HD", "UK-NOWTV| TNT SPORT 4 HD", "TNT SPORTS 4 HD", "TNT SPORT 4 HD"],
        "output": "TNT_SPORT_4_HD.m3u8",
    },
]

# Output gabungan semua target
COMBINED_OUTPUT = "TNT.m3u8"


def clean_name(text):
    text = (text or "").lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_attr(extinf, key):
    marker = key + '="'
    if marker not in extinf:
        return ""
    return extinf.split(marker, 1)[1].split('"', 1)[0].strip()


def is_stream_url(line):
    line_low = (line or "").lower().strip()
    return line_low.startswith(("http://", "https://", "rtmp://", "rtsp://"))


def parse_m3u_blocks(text):
    """
    Parse M3U menjadi blok channel lengkap:
    EXTINF + EXTVLCOPT/KODIPROP/header lain + URL stream.
    """
    channels = []
    block = []
    extinf = None

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue

        if line.startswith("#EXTINF"):
            # buang blok lama yang belum selesai
            block = [line]
            extinf = line
            continue

        if extinf:
            block.append(line)

            if is_stream_url(line):
                name = extinf.rsplit(",", 1)[-1].strip() if "," in extinf else ""
                channels.append({
                    "name": name,
                    "tvg_name": parse_attr(extinf, "tvg-name"),
                    "tvg_id": parse_attr(extinf, "tvg-id"),
                    "extinf": extinf,
                    "url": line,
                    "block": block[:],
                })

                block = []
                extinf = None

    return channels


def find_channel(channels, aliases):
    aliases_low = [clean_name(a) for a in aliases]

    # 1) exact match dulu
    for ch in channels:
        fields = [
            ch.get("name", ""),
            ch.get("tvg_name", ""),
            ch.get("tvg_id", ""),
        ]
        fields_low = [clean_name(f) for f in fields]

        if any(a == f for a in aliases_low for f in fields_low):
            return ch

    # 2) contains fallback
    for ch in channels:
        fields = [
            ch.get("name", ""),
            ch.get("tvg_name", ""),
            ch.get("tvg_id", ""),
        ]
        text = clean_name(" ".join(fields))

        if any(a and a in text for a in aliases_low):
            return ch

    return None


def write_m3u(output, blocks):
    lines = ["#EXTM3U"]

    for block in blocks:
        lines.extend(block)
        lines.append("")

    with open(output, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines).rstrip() + "\n")


def run():
    try:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "*/*",
        }
        r = requests.get(M3U_URL, headers=headers, timeout=40)
        r.raise_for_status()
        channels = parse_m3u_blocks(r.text)
    except Exception as e:
        print(f"{datetime.now()} gagal ambil M3U: {e}")
        return

    combined_blocks = []

    for target in TARGETS:
        output = target["output"]
        ch = find_channel(channels, target["aliases"])

        if ch:
            write_m3u(output, [ch["block"]])
            combined_blocks.append(ch["block"])
            count = 1
            print(f"{datetime.now()} OK: {target['name']}")
            print(f"URL: {ch['url']}")
        else:
            write_m3u(output, [[f"# ERROR: URL target tidak ditemukan untuk {target['name']}"]])
            count = 0
            print(f"{datetime.now()} ERROR: {target['name']} tidak ditemukan")

        print(f"IPTV: {count}")
        print(f"生成文件: {output}")
        print("-" * 50)

    if combined_blocks:
        write_m3u(COMBINED_OUTPUT, combined_blocks)
        print(f"{datetime.now()} Gabungan selesai: {COMBINED_OUTPUT}")
    else:
        write_m3u(COMBINED_OUTPUT, [["# ERROR: semua target TNT tidak ditemukan"]])
        print(f"{datetime.now()} Gabungan gagal: target tidak ditemukan")


if __name__ == "__main__":
    run()
