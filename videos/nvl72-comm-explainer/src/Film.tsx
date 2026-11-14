import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Progress } from './Progress';
import { Caption } from './gfx';
import { AnatomyShot } from './shots/Anatomy';
import { CollectivesShot } from './shots/Collectives';
import { CostShot } from './shots/Cost';
import { InferShot } from './shots/Infer';
import { LadderShot } from './shots/Ladder';
import { OpenShot } from './shots/Open';
import { OutroShot } from './shots/Outro';
import { ScaleShot } from './shots/Scale';
import { SplitShot } from './shots/Split';
import { TermsShot } from './shots/Terms';
import { TopologiesShot } from './shots/Topologies';
import { TrafficShot } from './shots/Traffic';
import { TrainShot } from './shots/Train';
import { BG } from './theme';
import { CAPTIONS, SFX, SHOTS } from './timeline';

const SCENES = {
  open: OpenShot,
  split: SplitShot,
  terms: TermsShot,
  topologies: TopologiesShot,
  ladder: LadderShot,
  anatomy: AnatomyShot,
  scale: ScaleShot,
  collectives: CollectivesShot,
  traffic: TrafficShot,
  cost: CostShot,
  train: TrainShot,
  infer: InferShot,
  outro: OutroShot,
} as const;

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {SHOTS.map((item) => {
      const Scene = SCENES[item.id as keyof typeof SCENES];
      return (
        <Sequence key={item.id} from={item.from} durationInFrames={item.duration}>
          <Scene />
        </Sequence>
      );
    })}
    {CAPTIONS.map((cue) => (
      <Sequence key={cue.id} from={cue.from} durationInFrames={cue.duration}>
        <Caption text={cue.text} duration={cue.duration} />
      </Sequence>
    ))}
    {SFX.map((cue) => (
      <Sequence key={cue.id} from={cue.from} durationInFrames={cue.durationInFrames}>
        <Audio src={staticFile(cue.src)} volume={cue.volume} />
      </Sequence>
    ))}
    <Progress />
  </AbsoluteFill>
);
