#!/usr/bin/env python3
"""Export the vertical cut's captions from src/vertical/timeline-vertical.ts.

Parses the RAW shot table and the line(...) caption calls verbatim — no
retyping — and writes CSV / Markdown / SRT. Frame convention at 30 fps:
a caption occupies [from, from+duration); times are frame/fps, rounded to
milliseconds (round-half-up on the exact frame fraction).

Usage: python3 scripts/export-vertical-subtitles.py [out_dir]
"""
import csv
import io
import re
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

FPS = 30
SRC = Path(__file__).resolve().parent.parent / "src/vertical/timeline-vertical.ts"


def parse():
    text = SRC.read_text(encoding="utf-8")
    raw = re.findall(r"\['(v-[a-z-]+)',\s*'([^']+)',\s*(\d+)\]", text)
    shots, cursor = {}, 0
    for sid, label, dur in raw:
        shots[sid] = {"id": sid, "label": label, "from": cursor, "duration": int(dur)}
        cursor += int(dur)
    caps = []
    for m in re.finditer(
        r"line\('([a-z0-9-]+)',\s*'(v-[a-z-]+)',\s*(\d+),\s*(\d+),\s*'((?:[^'\\]|\\.)*)'\)", text
    ):
        cid, sid, at, dur, body = m.groups()
        caps.append(
            {
                "cue": cid,
                "shot": sid,
                "chapter": shots[sid]["label"],
                "from": shots[sid]["from"] + int(at),
                "duration": int(dur),
                "text": body.replace("\\n", "\n"),
            }
        )
    caps.sort(key=lambda c: c["from"])
    return shots, caps, cursor


def tc(frame, srt=False):
    ms_total = int((Decimal(frame * 1000) / FPS).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    h, rem = divmod(ms_total, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{',' if srt else '.'}{ms:03d}"


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    out.mkdir(parents=True, exist_ok=True)
    shots, caps, total = parse()

    # validation: bounds, positive durations, overlaps, gaps
    problems, gaps = [], []
    prev_end = 0
    for i, c in enumerate(caps, 1):
        end = c["from"] + c["duration"]
        shot = shots[c["shot"]]
        if c["duration"] <= 0:
            problems.append(f"{c['cue']}: non-positive duration")
        if c["from"] < shot["from"] or end > shot["from"] + shot["duration"]:
            problems.append(f"{c['cue']}: outside its shot")
        if c["from"] < prev_end:
            problems.append(f"{c['cue']}: overlaps previous caption")
        if c["from"] > prev_end:
            gaps.append((prev_end, c["from"]))
        prev_end = max(prev_end, end)
    if prev_end < total:
        gaps.append((prev_end, total))

    rows = []
    for i, c in enumerate(caps, 1):
        end = c["from"] + c["duration"]
        rows.append(
            {
                "序号": i,
                "字幕ID": c["cue"],
                "章节": c["chapter"],
                "章节ID": c["shot"],
                "全文": c["text"],
                "起始帧": c["from"],
                "结束帧(不含)": end,
                "开始": tc(c["from"]),
                "结束": tc(end),
                "时长(秒)": f"{c['duration'] / FPS:.3f}",
                "时长(帧)": c["duration"],
            }
        )

    with open(out / "nvl72-vertical-subtitles.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    md = [
        "# NVL72 竖屏版字幕表（旁白字幕）",
        "",
        f"来源：`src/vertical/timeline-vertical.ts`（自动导出，未人工改写） · {FPS} fps · 片长 {total} 帧（{tc(total)}）",
        "区间约定：字幕占 [起始帧, 结束帧)；时间 = 帧 ÷ 30，四舍五入到毫秒。",
        "说明：本片无配音旁白，只有音效；本表是帧时间线精确，尚未做音频对齐。画面标题/图解标签不计入字幕。",
        "",
        "| 序号 | 章节 | 全文 | 起始帧 | 结束帧(不含) | 开始 | 结束 | 时长(秒) |",
        "|---|---|---|---:|---:|---|---|---:|",
    ]
    for r in rows:
        md.append(
            f"| {r['序号']} | {r['章节']} | {r['全文'].replace(chr(10), '<br>')} | {r['起始帧']} | {r['结束帧(不含)']} | {r['开始']} | {r['结束']} | {r['时长(秒)']} |"
        )
    md += ["", "## 无字幕空档", ""]
    for a, b in gaps:
        md.append(f"- 帧 {a}–{b - 1}（{tc(a)}–{tc(b)}，{b - a} 帧）：无旁白字幕（画面动画/收束画面承担信息）")
    md += ["", f"校验：共 {len(rows)} 条；越界/负时长/非预期重叠问题 {len(problems)} 个。"]
    (out / "nvl72-vertical-subtitles.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    srt = io.StringIO()
    for i, c in enumerate(caps, 1):
        srt.write(f"{i}\n{tc(c['from'], True)} --> {tc(c['from'] + c['duration'], True)}\n{c['text']}\n\n")
    (out / "nvl72-vertical-subtitles.srt").write_text(srt.getvalue(), encoding="utf-8")

    print(f"captions={len(caps)} total_frames={total} problems={problems}")
    print(f"gaps={gaps}")


if __name__ == "__main__":
    main()
