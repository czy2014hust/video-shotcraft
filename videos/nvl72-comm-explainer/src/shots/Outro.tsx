import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER_HI, INK, INK2, fade } from '../theme';

export const OUTRO_DEFAULTS = {
  words: '带宽,延迟,拓扑',
  line: '通信决定模型能扩到多大',
};

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const OutroShot: React.FC<Partial<typeof OUTRO_DEFAULTS>> = (props) => {
  const copy = { ...OUTRO_DEFAULTS, ...props };
  const words = copy.words.split(',');
  const frame = useCurrentFrame();
  const line = fade(frame, BEAT.outroLock + 8, 20);

  return (
    <Stage chapter="11" name="收束">
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 360,
          display: 'flex',
          justifyContent: 'center',
          gap: 72,
        }}
      >
        {words.map((word, index) => {
          const start = 24 + index * 48;
          const t = interpolate(frame, [start, start + 16], [0, 1], clamp);
          const scale = interpolate(frame, [start, start + 10, start + 18], [1.04, 0.992, 1], clamp);
          return (
            <div
              key={word}
              style={{
                fontSize: 120,
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: index === 1 ? COPPER_HI : INK,
                opacity: t,
                transform: `scale(${scale})`,
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 560,
          textAlign: 'center',
          fontSize: 40,
          color: INK2,
          opacity: line,
        }}
      >
        {copy.line}
      </div>
    </Stage>
  );
};
