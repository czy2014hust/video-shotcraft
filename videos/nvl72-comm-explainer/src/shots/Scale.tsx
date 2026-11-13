import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, SIGNAL, SLOW, fade, rise } from '../theme';

export const ScaleShot: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = rise(frame, BEAT.scalePull, 70);
  const ratio = fade(frame, 168, 24);
  const rackW = 280 - pull * 40;
  const gap = 80 + pull * 220;
  const center = 960;

  return (
    <Stage chapter="05" name="柜内与柜间" tag="scale-up / scale-out">
      {[ -1, 0, 1 ].map((slot) => {
        const show = slot === 0 ? 1 : pull;
        const x = center + slot * gap - rackW / 2;
        return (
          <div key={slot} style={{ position: 'absolute', left: x, top: 250, opacity: show }}>
            <Rack width={rackW} hot={slot === 0} />
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 32, color: slot === 0 ? COPPER_HI : INK2 }}>
              {slot === 0 ? 'NVLink 域' : '另一柜'}
            </div>
          </div>
        );
      })}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line
          x1={center - gap + rackW / 2}
          y1={430}
          x2={center - rackW / 2}
          y2={430}
          stroke={SLOW}
          strokeWidth={3}
          opacity={pull}
        />
        <line
          x1={center + rackW / 2}
          y1={430}
          x2={center + gap - rackW / 2}
          y2={430}
          stroke={SLOW}
          strokeWidth={3}
          opacity={pull}
        />
      </svg>
      <div style={{ position: 'absolute', left: 96, top: 680, opacity: ratio }}>
        <div style={{ fontSize: 36, color: INK2 }}>单向带宽</div>
        <div style={{ marginTop: 8, fontSize: 40 }}>
          <Num size={64} color={COPPER_HI}>900</Num>
          <span style={{ color: INK2 }}> GB/s</span>
          <span style={{ margin: '0 18px', color: INK3ish }}>→</span>
          <Num size={64} color={SLOW}>50</Num>
          <span style={{ color: INK2 }}> GB/s</span>
          <span style={{ marginLeft: 28, color: SIGNAL, fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 64 }}>18×</span>
        </div>
      </div>
    </Stage>
  );
};

const INK3ish = '#5d6772';

const Rack: React.FC<{ width: number; hot: boolean }> = ({ width, hot }) => (
  <div
    style={{
      width,
      height: 360,
      borderRadius: 12,
      background: '#0e1216',
      border: `2px solid ${hot ? COPPER : '#2a3138'}`,
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}
  >
    {Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          borderRadius: 3,
          background: i % 4 === 2 ? (hot ? '#14302a' : '#121816') : hot ? '#2a1a10' : '#161412',
        }}
      />
    ))}
  </div>
);
