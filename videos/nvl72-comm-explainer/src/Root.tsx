import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { FPS, TOTAL } from './timeline';
import { VerticalFilm } from './vertical/VerticalFilm';
import { V_TOTAL } from './vertical/timeline-vertical';

export const Root: React.FC = () => (
  <>
    <Composition
      id="Nvl72Film"
      component={Film}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Nvl72Vertical"
      component={VerticalFilm}
      durationInFrames={V_TOTAL}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
