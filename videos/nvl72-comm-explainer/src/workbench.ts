import { Film } from './Film';
import { Progress } from './Progress';
import { Caption } from './gfx';
import { AnatomyShot } from './shots/Anatomy';
import { CollectivesShot } from './shots/Collectives';
import { CommTimeShot } from './shots/CommTime';
import { InferShot } from './shots/Infer';
import { LadderShot } from './shots/Ladder';
import { OPEN_DEFAULTS, OpenShot } from './shots/Open';
import { OUTRO_DEFAULTS, OutroShot } from './shots/Outro';
import { ScaleShot } from './shots/Scale';
import { SplitShot } from './shots/Split';
import { TermsShot } from './shots/Terms';
import { TopologiesShot } from './shots/Topologies';
import { TrainShot } from './shots/Train';
import { BG } from './theme';
import { CAPTIONS, FPS, SFX, SHOTS, TOTAL } from './timeline';

const textSchema = (label: string) => [{ type: 'text' as const, key: 'text', label, default: '' }];

const SCENE = {
  open: OpenShot,
  split: SplitShot,
  terms: TermsShot,
  topologies: TopologiesShot,
  ladder: LadderShot,
  anatomy: AnatomyShot,
  scale: ScaleShot,
  collectives: CollectivesShot,
  commtime: CommTimeShot,
  train: TrainShot,
  infer: InferShot,
  outro: OutroShot,
} as const;

export const WORKBENCH = {
  name: 'NVL72 通信',
  fps: FPS,
  width: 1920,
  height: 1080,
  total: TOTAL,
  background: BG,
  shots: SHOTS.map((item) => ({
    id: item.id,
    label: item.label,
    from: item.from,
    duration: item.duration,
    component: SCENE[item.id as keyof typeof SCENE],
    ...(item.id === 'open'
      ? {
          props: OPEN_DEFAULTS,
          schema: [
            { type: 'text', key: 'kicker', label: '眉题', default: OPEN_DEFAULTS.kicker },
            { type: 'text', key: 'heroNum', label: '主数字', default: OPEN_DEFAULTS.heroNum },
            { type: 'text', key: 'heroRest', label: '主标题后半', default: OPEN_DEFAULTS.heroRest },
            { type: 'text', key: 'line', label: '第二行', default: OPEN_DEFAULTS.line },
            { type: 'text', key: 'sub', label: '副题', default: OPEN_DEFAULTS.sub },
          ],
        }
      : {}),
    ...(item.id === 'outro'
      ? {
          props: OUTRO_DEFAULTS,
          schema: [
            { type: 'text', key: 'words', label: '三个词，逗号分隔', default: OUTRO_DEFAULTS.words },
            { type: 'text', key: 'line', label: '收束句', default: OUTRO_DEFAULTS.line },
          ],
        }
      : {}),
  })),
  transitions: [],
  overlays: [
    {
      id: 'progress',
      label: '进度条',
      from: 0,
      duration: TOTAL,
      component: Progress,
    },
  ],
  captions: CAPTIONS.map((cue) => ({
    id: cue.id,
    label: cue.text.split('\n')[0],
    from: cue.from,
    duration: cue.duration,
    component: Caption,
    props: { text: cue.text },
    schema: textSchema('字幕'),
    durationProp: 'duration',
  })),
  sfx: SFX.map((cue) => ({
    from: cue.from,
    duration: cue.durationInFrames,
    src: cue.src,
    volume: cue.volume,
    label: cue.note,
  })),
  bgm: [],
  order: ['overlays', 'captions'] as const,
  original: Film,
};
