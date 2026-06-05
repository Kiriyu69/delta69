from datetime import datetime
import re
import requests

# Source list channel TNT / NOW TV
M3U_URL = "https://github.com/Love4vn/Stalker2M3U/raw/refs/heads/1/Mac_playlist.m3u"

# =========================
# TARGET CHANNELS
# Match by group-title + tvg-chno + channel name
# =========================
TARGETS = [
    {
        "name": "TNT SPORT 1 HD",
        "channel_name": "UK-NOWTV| TNT SPORT 1 HD",
        "group": "[globalgnet.live] UK| NOW TV",
        "chno": "5306",
        "output": "TNT_SPORT_1_HD.m3u8",
    },
    {
        "name": "TNT SPORT 2 HD",
        "channel_name": "UK-NOWTV| TNT SPORT 2 HD",
        "group": "[globalgnet.live] UK| NOW TV",
        "chno": "5310",
        "output": "TNT_SPORT_2_HD.m3u8",
    },
    {
        "name": "TNT SPORT 3 HD",
        "channel_name": "UK-NOWTV| TNT SPORT 3 HD",
        "group": "[globalgnet.live] UK| NOW TV",
        "chno": "5313",
        "output": "TNT_SPORT_3_HD.m3u8",
    },
    {
        "name": "TNT SPORTS 4 HD",
        "channel_name": "UK-NOWTV| TNT SPORTS 4 HD",
        "group": "[globalgnet.live] UK| NOW TV",
        "chno": "5316",
        "output": "TNT_SPORTS_4_HD.m3u8",
    },
]


def norm(text):
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def parse_attr(extinf, key):
    marker = key + '="'
    if marker not in extinf:
        return ""
    return extinf.split(marker, 1)[1].split('"', 1)[0].strip()


def is_url(line):
    return line.lower().startswith(("http://", "https://"))


def parse_m3u(text):
    """Return list: {name, group, chno, tvg_name, tvg_id, extinf, url}."""
    channels = []
    last_extinf = None

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue

        if line.startswith("#EXTINF"):
            last_extinf = line
            continue

        # Skip headers/options. Keep last EXTINF until real URL is found.
        if last_extinf and line.startswith("#"):
            continue

        if last_extinf and is_url(line):
            name = last_extinf.rsplit(",", 1)[-1].strip() if "," in last_extinf else ""
            channels.append({
                "name": name,
                "group": parse_attr(last_extinf, "group-title"),
                "chno": parse_attr(last_extinf, "tvg-chno"),
                "tvg_name": parse_attr(last_extinf, "tvg-name"),
                "tvg_id": parse_attr(last_extinf, "tvg-id"),
                "extinf": last_extinf,
                "url": line,
            })
            last_extinf = None

    return channels


def find_target_channel(channels, target):
    target_group = norm(target["group"])
    target_chno = str(target["chno"]).strip()
    target_name = norm(target["channel_name"])

    # Strict match: group-title + tvg-chno + name/tvg-name
    for ch in channels:
        if (
            norm(ch.get("group")) == target_group
            and str(ch.get("chno", "")).strip() == target_chno
            and target_name in {norm(ch.get("name")), norm(ch.get("tvg_name"))}
        ):
            return ch

    # Fallback: chno + channel name
    for ch in channels:
        if (
            str(ch.get("chno", "")).strip() == target_chno
            and target_name in {norm(ch.get("name")), norm(ch.get("tvg_name"))}
        ):
            return ch

    return None


def build_hls_master(url):
    return [
        "#EXTM3U",
        "#EXT-X-VERSION:4",
        "#EXT-X-INDEPENDENT-SEGMENTS",
        '#EXT-X-STREAM-INF:BANDWIDTH=800000,AVERAGE-BANDWIDTH=600000,RESOLUTION=1280x720,FRAME-RATE=25.000,CODECS="avc1.64001F,mp4a.40.2",AUDIO="audio_0"',
        url,
    ]


def write_output(path, lines):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines).rstrip() + "\n")


def run():
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(M3U_URL, headers=headers, timeout=40)
        response.raise_for_status()
        channels = parse_m3u(response.text)
    except Exception as e:
        print(f"{datetime.now()} gagal ambil M3U: {e}")
        return

    for target in TARGETS:
        ch = find_target_channel(channels, target)

        if not ch:
            lines = [
                "#EXTM3U",
                f"# ERROR: target tidak ditemukan: group={target['group']} chno={target['chno']} name={target['channel_name']}",
            ]
            count = 0
        else:
            lines = build_hls_master(ch["url"])
            count = 1

        write_output(target["output"], lines)

        print(f"{datetime.now()} {target['name']}")
        print(f"IPTV: {count}")
        print(f"生成文件: {target['output']}")
        if ch:
            print(ch["url"])
        print("-" * 50)


if __name__ == "__main__":
    run()
