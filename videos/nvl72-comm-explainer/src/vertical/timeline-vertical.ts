/**
 * Vertical cut: 1080×1920, 90 s (2700 frames). A native re-layout, not a crop:
 * title on top, diagram stacked in the middle, caption zone at the bottom.
 * Numbers, palette and fonts are shared with the landscape film.
 */
import { sfxFrom, type CaptionCue, type SfxCue } from '../timeline';

const RAW = [
  ['v-open', '01 机柜', 360],
  ['v-split', '02 为什么要通信', 360],
  ['v-topo', '03 怎么接', 540],
  ['v-collectives', '04 集合通信', 450],
  ['v-time', '05 要多久', 630],
  ['v-outro', '06 收束', 360],
] as const;

let cursor = 0;
export const V_SHOTS = RAW.map(([id, label, duration]) => {
  const shot = { id, label, duration, from: cursor };
  cursor += duration;
  return shot;
});
export const V_TOTAL = cursor;

const vshot = (id: string) => V_SHOTS.find((s) => s.id === id)!;
const line = (id: string, shotId: string, at: number, duration: number, text: string): CaptionCue => ({
  id,
  from: vshot(shotId).from + at,
  duration,
  text,
});

export const V_CAPTIONS: CaptionCue[] = [
  line('vc-open', 'v-open', 150, 190, '72 块 GPU 装在一柜里\n像一块 GPU 一样工作'),
  line('vc-split-a', 'v-split', 20, 150, '405B 模型，权重约 810 GB\n单卡 186 GB，装不下'),
  line('vc-split-b', 'v-split', 190, 150, '切开摊到多卡上\n卡与卡就必须交换数据'),
  line('vc-topo-a', 'v-topo', 16, 160, '只连左右邻居的环\n离得越远，中转越多'),
  line('vc-topo-b', 'v-topo', 196, 160, 'NVSwitch：每卡连到每颗交换芯片\n任意两卡只中转一次'),
  line('vc-topo-c', 'v-topo', 376, 150, '柜内一跳，柜间走胖树\n这就是 scale-up 和 scale-out'),
  line('vc-col-a', 'v-collectives', 16, 200, 'AllGather：每卡出一块\n拼成完整一份'),
  line('vc-col-b', 'v-collectives', 236, 200, 'All-to-All：每卡给每卡不同的块\nMoE 专家并行就靠它'),
  line('vc-time-a', 'v-time', 16, 190, '通信要多久：先付固定延迟 α\n再按数据量除以带宽'),
  line('vc-time-b', 'v-time', 226, 190, 'AllGather 搬 10 GB\n柜内约 11 毫秒，出域约 197 毫秒'),
  line('vc-time-c', 'v-time', 436, 180, 'All-to-All 同账\n系数决定搬多少，busBW 决定多快'),
];

const cue = (id: string, target: number, src: string, volume: number, durationInFrames: number, note: string): SfxCue => ({
  id,
  from: sfxFrom(target, src),
  src,
  volume,
  durationInFrames,
  note,
});

export const V_SFX: SfxCue[] = [
  cue('vsfx-open', vshot('v-open').from + 120, 'audio/sfx/fs-755054.mp3', 0.42, 45, '竖屏机柜托盘排齐'),
  cue('vsfx-split', vshot('v-split').from + 110, 'audio/sfx/fs-427823.mp3', 0.5, 24, '权重切开'),
  cue('vsfx-topo', vshot('v-topo').from + 330, 'audio/sfx/fs-406559.mp3', 0.34, 18, 'NVSwitch 数据包一跳到达'),
  cue('vsfx-time', vshot('v-time').from + 400, 'audio/sfx/fs-406559.mp3', 0.32, 18, '柜内 11 毫秒计数落定'),
  cue('vsfx-outro', vshot('v-outro').from + 170, 'audio/sfx/fs-755054.mp3', 0.48, 45, '三个词落定'),
];
