/**
 * Single source of truth for shot boundaries, captions and sound cues.
 * Visual beats live here so the picture and the sound stay on the same numbers.
 * 8280 frames = 4 min 36 s. Durations are the agreed cut; nothing was shortened to fit.
 */

export const FPS = 30;

const RAW = [
  ['open', '01 通信全景', 300],
  ['split', '02 为什么要通信', 480],
  ['terms', '03 三个词', 1080],
  ['topologies', '04 五种接法', 1260],
  ['ladder', '05 带宽阶梯', 480],
  ['anatomy', '06 拆开 NVL72', 660],
  ['scale', '07 柜内与柜间', 420],
  ['collectives', '08 集合通信', 480],
  ['traffic', '09 AllGather · All-to-All', 1080],
  ['cost', '10 通信要多久', 840],
  ['train', '11 训练怎么放', 480],
  ['infer', '12 推理看延迟', 420],
  ['outro', '13 收束', 300],
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
  termsBi: 480,
  topoSwitch: 1002,
  ladderTrap: 236,
  anatomyLinks: 184,
  anatomyAll: 400,
  scalePull: 78,
  trafficFast: 800,
  trafficSlow: 910,
  costLock: 640,
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
  line('c-open', 'open', 160, 120, '72 块 GPU 要像一块那样协同\n靠柜内超过 5,000 根铜缆'),
  line('c-split-a', 'split', 24, 140, '405B 模型，BF16 权重约 810 GB'),
  line('c-split-b', 'split', 180, 140, '单卡显存 186 GB，装不下\n切开之后，卡与卡就要交换数据'),
  line('c-split-c', 'split', 340, 120, '810 ÷ 186 ≈ 4.4\n光权重至少 5 块卡，还没算 KV'),

  line('c-terms-a', 'terms', 40, 150, 'Scale-up：在一个域里加带宽\n卡和卡还在同一跳里'),
  line('c-terms-b', 'terms', 200, 140, 'Scale-out：往域外加机器\n柜和柜之间走网卡'),
  line('c-terms-c', 'terms', 400, 160, '双向带宽是两个方向加起来\n1.8 TB/s 双向，就是单向 900 GB/s'),
  line('c-terms-d', 'terms', 580, 120, '后面的对比，全按单向算'),
  line('c-terms-e', 'terms', 760, 150, '不经网卡就能互相到达的一组卡\n叫一个 NVLink 域'),
  line('c-terms-f', 'terms', 930, 130, 'NVL72 柜内任意两卡\n中间一颗交换芯片，一跳'),

  line('c-topo-pcie', 'topologies', 16, 184, 'PCIe 树：GPU 挂在 CPU 下面\n两组之间要绕 CPU 根'),
  line('c-topo-direct', 'topologies', 226, 184, '直连：两两一条线，不用中转\n可到 72 卡，每卡要 71 个口'),
  line('c-topo-ring', 'topologies', 436, 184, '环：每卡只连左右邻居\n线最省，离得越远中转越多'),
  line('c-topo-fat', 'topologies', 646, 184, '胖树：叶交换机连脊交换机\n加交换机就能扩，柜间常用'),
  line('c-topo-nv', 'topologies', 856, 184, 'NVSwitch：每卡连到每颗交换芯片\n任意两卡只中转一次'),
  line('c-topo-end', 'topologies', 1066, 184, '柜内用 NVSwitch 做 scale-up\n柜间用胖树做 scale-out'),

  line('c-ladder-a', 'ladder', 20, 160, '先看清单位\nGb 是比特，GB 是字节'),
  line('c-ladder-b', 'ladder', 250, 200, '400 Gb/s 只有 50 GB/s\n和 NVLink 单向 900 GB/s 不是一个量级'),

  line('c-anat-a', 'anatomy', 36, 160, '打开刚才那张全互联\n每条链路连向一颗交换芯片'),
  line('c-anat-b', 'anatomy', 220, 160, '18 条都连上了，任意两卡只有一跳\n单卡双向 1.8 TB/s'),
  line('c-anat-c', 'anatomy', 440, 180, '每颗交换芯片连全部 72 卡\n这一柜是一个 NVLink 域'),

  line('c-scale-a', 'scale', 24, 140, '出了 NVLink 域，就是 scale-out'),
  line('c-scale-b', 'scale', 180, 200, '单向大约只有柜内的 18 分之一'),

  line('c-col-1', 'collectives', 16, 96, '广播：同一份数据\n从一块 GPU 发给其余所有卡'),
  line('c-col-2', 'collectives', 136, 96, '聚合：每卡先拿一块\n最后每卡都有完整的一份'),
  line('c-col-3', 'collectives', 256, 96, '全部归约：先合成一个结果\n再把这个结果发回每卡'),
  line('c-col-4', 'collectives', 376, 96, '全交换：每卡发给每卡\n内容各不相同'),

  line('c-tr-a', 'traffic', 20, 100, 'AllGather：每卡出一块\n每卡拼成完整一份'),
  line('c-tr-b', 'traffic', 130, 100, 'All-to-All：每卡对每卡各发一块\n块都不同'),
  line('c-tr-c', 'traffic', 260, 190, 'S 是每卡最终的完整缓冲区\n每卡要收进 (N−1)/N × S'),
  line('c-tr-d', 'traffic', 500, 210, 'algBW 是 S 除以耗时\nbusBW 再乘 (N−1)/N，才和链路对得上'),
  line('c-tr-e', 'traffic', 800, 240, '同样 10 GB：柜内约 11 毫秒\n出域约 197 毫秒'),

  line('c-cost-a', 'cost', 36, 200, 'Ring AllReduce 要走两遍\n每卡收发约 2(N−1)/N × S'),
  line('c-cost-b', 'cost', 300, 180, '交换机内归约省掉第二遍，所以也约 11 毫秒\n和 AllGather 的 11 毫秒不是一回事'),
  line('c-cost-c', 'cost', 520, 280, '同样 10 GB 梯度：柜内 **22 毫秒**，走网络要 400 毫秒'),

  line('c-train-a', 'train', 30, 180, '又密又大的通信，看 busBW，留在柜内'),
  line('c-train-b', 'train', 240, 200, '点对点、梯度同步，可以跨柜\n参数分片取权重，用的是 AllGather'),
  line('c-infer-a', 'infer', 24, 160, '逐 token 解码，拼的是延迟'),
  line('c-infer-b', 'infer', 200, 180, 'KV 搬运看带宽\n专家交换就是前面算过的 All-to-All'),
];

export const PEAK_F: Record<string, number> = {
  'audio/sfx/fs-755054.mp3': 0.215 * FPS,
  'audio/sfx/fs-406559.mp3': 0.005 * FPS,
  'audio/sfx/fs-427823.mp3': 0.215 * FPS,
  'audio/sfx/fs-59989.mp3': 0.045 * FPS,
};

/** Remotion 4.0.484, h264/aac, 48 kHz, mp4. Measured 2026-11-13, see AUDIO.md. */
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
  cue('sfx-terms', at('terms', BEAT.termsBi), 'audio/sfx/fs-59989.mp3', 0.7, 8, '双向箭头合上'),
  cue('sfx-topo', at('topologies', BEAT.topoSwitch), 'audio/sfx/fs-406559.mp3', 0.34, 18, 'NVSwitch 那张数据包到达，中转 1 次落定'),
  cue('sfx-ladder', at('ladder', BEAT.ladderTrap), 'audio/sfx/fs-406559.mp3', 0.34, 18, '400 Gb/s 单位纠正'),
  cue('sfx-anatomy', at('anatomy', BEAT.anatomyLinks), 'audio/sfx/fs-59989.mp3', 0.7, 8, '18 条链路收束'),
  cue('sfx-scale', at('scale', BEAT.scalePull), 'audio/sfx/fs-427823.mp3', 0.4, 24, '镜头从单柜拉到多柜'),
  cue('sfx-traffic-a', at('traffic', BEAT.trafficFast), 'audio/sfx/fs-406559.mp3', 0.32, 18, '柜内 11 毫秒落定'),
  cue('sfx-traffic-b', at('traffic', BEAT.trafficSlow), 'audio/sfx/fs-406559.mp3', 0.32, 18, '出域 197 毫秒落定'),
  cue('sfx-cost', at('cost', BEAT.costLock), 'audio/sfx/fs-406559.mp3', 0.36, 18, '400 毫秒对比条落定'),
  cue('sfx-outro', at('outro', BEAT.outroLock), 'audio/sfx/fs-755054.mp3', 0.48, 45, '三个词全部落定'),
];
