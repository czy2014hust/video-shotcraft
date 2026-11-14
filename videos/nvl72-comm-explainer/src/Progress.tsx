import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COPPER } from './theme';
import { SHOTS, TOTAL } from './timeline';

/** 3px chapter rail. Width follows shot length. No timecode. */
export const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const inset = 80;
  const gap = 4;
  const usable = 1920 - inset * 2 - gap * (SHOTS.length - 1);
  let x = inset;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {SHOTS.map((item) => {
        const width = (item.duration / TOTAL) * usable;
        const left = x;
        x += width + gap;
        const seen = frame - item.from;
        const filled = seen <= 0 ? 0 : seen >= item.duration ? 1 : seen / item.duration;
        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left,
              bottom: 0,
              width,
              height: 3,
              borderRadius: 1,
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ width: `${filled * 100}%`, height: '100%', background: COPPER, borderRadius: 1 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
