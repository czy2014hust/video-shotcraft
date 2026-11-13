/**
 * Single source of truth for shot boundaries, captions and sound cues.
 * Visual beats live here so the picture and the sound stay on the same numbers.
 */

export const FPS = 30;

const RAW = [
  ['open', '01 通信全景', 240],
  ['split', '02 为什么要通信', 360],
  ['ladder', '03 带宽阶梯', 420],
  ['anatomy', '04 拆开 NVL72', 510],
  ['scale', '05 柜内与柜间', 300],
  ['collectives', '06 集合通信', 320],
  ['ring', '07 Ring AllReduce', 300],
  ['cost', '08 通信要多久', 420],
  ['train', '09 训练怎么放', 360],
  ['infer', '10 推理看延迟', 300],
  ['outro', '11 收束', 240],
] as const;

let cursor = 0;
export const SHOTS = RAW.map(([id, label, duration]) => {
  const shot = { id, label, duration, from: cursor };
  cursor += duration;
  return shot;
});

export const TOTAL = cursor;

export const shot = (id: string) => {
  const found = SHOTS.find((item) => item.id === id);
  if (!found) throw new Error(`unknown shot ${id}`);
  return found;
};

/** Local frame where a shot's main action locks. SFX peaks aim here. */
export const BEAT = {
  openTitle: 96,
  splitBreak: 90,
  ladderTrap: 236,
  anatomyLinks: 184,
  scalePull: 78,
  costLock: 206,
  outroLock: 144,
} as const;

export type CaptionCue = { id: string; from: number; duration: number; text: string };

const line = (id: string, shotId: string, at: number, duration: number, text: string): CaptionCue => ({
  id,
  from: shot(shotId).from + at,
  duration,
  text,
});

export const CAPTIONS: CaptionCue[] = [
  line('c-open', 'open', 150, 90, '72 块 GPU 要像一块那样协同\n靠柜内超过 5,000 根铜缆'),
  line('c-split-a', 'split', 24, 120, '405B 模型，BF16 权重约 810 GB'),
  line('c-split-b', 'split', 188, 164, '单卡显存 186 GB，装不下\n切开之后，卡与卡就要交换数据'),
  line('c-ladder-a', 'ladder', 16, 150, '先看清单位\n双向还是单向，Gb 还是 GB'),
  line('c-ladder-b', 'ladder', 220, 190, '400 Gb/s 只有 50 GB/s\n和 NVLink 单向 900 GB/s 不是一个量级'),
  line('c-anat-a', 'anatomy', 36, 140, '每条链路连向一颗交换芯片'),
  line('c-anat-b', 'anatomy', 190, 290, '18 条都连上了，任意两卡只有一跳\n单卡双向 1.8 TB/s'),
  line('c-scale-a', 'scale', 20, 110, '柜内是 NVLink 域，一跳到任何一块卡'),
  line('c-scale-b', 'scale', 160, 130, '跨柜改走 400G 网卡\n单向大约只有柜内的 18 分之一'),
  line('c-col-1', 'collectives', 8, 72, '广播：同一份数据\n从一块 GPU 发给其余所有卡'),
  line('c-col-2', 'collectives', 88, 72, '聚合：每卡先拿一块\n最后每卡都有完整的一份'),
  line('c-col-3', 'collectives', 168, 72, '全部归约：先合成一个结果\n再把这个结果发回每卡'),
  line('c-col-4', 'collectives', 248, 68, '全交换：每卡发给每卡\n内容各不相同'),
  line('c-ring-a', 'ring', 20, 130, 'Ring AllReduce 分两步走\n先打碎归约，再把结果拼齐'),
  line('c-ring-b', 'ring', 168, 124, '每卡收发约 2(N−1)/N × S\n72 卡时，接近两份数据量'),
  line('c-cost-a', 'cost', 16, 140, '耗时 ≈ 固定延迟 + 数据量 / 带宽'),
  line('c-cost-b', 'cost', 176, 230, '10 GB 梯度、72 卡，理想值\n柜内约 22 毫秒，走网络约 400 毫秒'),
  line('c-train-a', 'train', 24, 150, '又密又大的通信，留在 NVLink 域'),
  line('c-train-b', 'train', 196, 150, '点对点、梯度同步，可以跨柜\n计算和通信要重叠着做'),
  line('c-infer-a', 'infer', 20, 130, '逐 token 解码，拼的是延迟'),
  line('c-infer-b', 'infer', 160, 130, 'KV 搬运和专家交换，拼的是带宽'),
];

/**
 * Peak offset of each file, in frames at 30fps, from sfx-source analysis
 * (energy peak, 10ms RMS window — not LUFS).
 * Output offset is measured for this render pipeline; see AUDIO.md.
 */
export const PEAK_F: Record<string, number> = {
  'audio/sfx/fs-755054.mp3': 0.215 * FPS,
  'audio/sfx/fs-406559.mp3': 0.005 * FPS,
  'audio/sfx/fs-427823.mp3': 0.215 * FPS,
  'audio/sfx/fs-59989.mp3': 0.045 * FPS,
};

/**
 * Remotion 4.0.484, h264/aac, 48 kHz, mp4. 2026-11-13 probe:
 * opening impact (fs-755054) targeted frame 96 with offset 1.28 landed at
 * energy-peak frame 95.4, so this pipeline's output lag is 0.95 frames.
 * Single sharp probe; see AUDIO.md.
 */
export const OUTPUT_AUDIO_OFFSET_F = 0.95;

export const sfxFrom = (target: number, src: string) =>
  Math.max(0, Math.round(target - (PEAK_F[src] ?? 0) - OUTPUT_AUDIO_OFFSET_F));

const at = (shotId: string, local: number) => shot(shotId).from + local;

export type SfxCue = {
  id: string;
  from: number;
  src: string;
  volume: number;
  durationInFrames: number;
  note: string;
};

const cue = (
  id: string,
  target: number,
  src: string,
  volume: number,
  durationInFrames: number,
  note: string,
): SfxCue => ({ id, from: sfxFrom(target, src), src, volume, durationInFrames, note });

export const SFX: SfxCue[] = [
  cue('sfx-open', at('open', BEAT.openTitle), 'audio/sfx/fs-755054.mp3', 0.42, 45, '开场标题落定'),
  cue('sfx-split', at('split', BEAT.splitBreak), 'audio/sfx/fs-427823.mp3', 0.5, 24, '权重块开始切开'),
  cue('sfx-ladder', at('ladder', BEAT.ladderTrap), 'audio/sfx/fs-406559.mp3', 0.34, 18, '400 Gb/s 单位纠正'),
  cue('sfx-anatomy', at('anatomy', BEAT.anatomyLinks), 'audio/sfx/fs-59989.mp3', 0.7, 8, '18 条链路收束'),
  cue('sfx-scale', at('scale', BEAT.scalePull), 'audio/sfx/fs-427823.mp3', 0.4, 24, '镜头从单柜拉到多柜'),
  cue('sfx-cost', at('cost', BEAT.costLock), 'audio/sfx/fs-406559.mp3', 0.36, 18, '400 毫秒对比条落定'),
  cue('sfx-outro', at('outro', BEAT.outroLock), 'audio/sfx/fs-755054.mp3', 0.48, 45, '三个词全部落定'),
];
