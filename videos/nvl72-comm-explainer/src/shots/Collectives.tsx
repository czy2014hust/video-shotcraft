import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, SIGNAL, fade, rise } from '../theme';

const MODES = [
  { en: 'Broadcast', zh: '广播' },
  { en: 'AllGather', zh: '聚合' },
  { en: 'AllReduce', zh: '全部归约' },
  { en: 'All-to-All', zh: '全交换' },
];

const COLORS = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a'];
const N = 5;
const PHASE = 120;

export const CollectivesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = Math.min(3, Math.floor(frame / PHASE));
  const local = frame - phase * PHASE;
  const move = rise(local, 12, 40);

  return (
    <Stage chapter="08" name="集合通信" tag="示意 · 5 卡">
      <div style={{ position: 'absolute', left: 80, right: 80, top: 140, display: 'flex', gap: 18 }}>
        {MODES.map((mode, index) => {
          const on = index === phase;
          return (
            <div
              key={mode.en}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: 12,
                border: `1.5px solid ${on ? COPPER_HI : '#2a3138'}`,
                background: on ? '#24180f' : 'transparent',
                opacity: on ? 1 : 0.45,
              }}
            >
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: on ? COPPER_HI : INK2 }}>{mode.en}</div>
              <div style={{ fontSize: 32, marginTop: 2 }}>{mode.zh}</div>
            </div>
          );
        })}
      </div>

      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: N }, (_, i) => {
          const x = gpuX(i);
          if (phase === 0 && i > 0) {
            return (
              <line key={`l${i}`} x1={gpuX(0) + 48} y1={560} x2={x + 48} y2={560} stroke={SIGNAL} strokeWidth={2} opacity={0.35 + move * 0.5} />
            );
          }
          if (phase === 3) {
            return Array.from({ length: N }, (__, j) =>
              j === i ? null : (
                <line
                  key={`a${i}-${j}`}
                  x1={x + 48}
                  y1={500}
                  x2={gpuX(j) + 48}
                  y2={640}
                  stroke={COLORS[i]}
                  strokeWidth={1.5}
                  opacity={0.15 + move * 0.45}
                />
              ),
            );
          }
          return null;
        })}
        {phase === 0
          ? Array.from({ length: N - 1 }, (_, i) => {
              const x = gpuX(0) + 48 + (gpuX(i + 1) - gpuX(0)) * move;
              return <rect key={i} x={x - 10} y={546} width={20} height={20} rx={4} fill={COLORS[0]} />;
            })
          : null}
      </svg>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 500 }}>
        {Array.from({ length: N }, (_, i) => (
          <Gpu key={i} index={i} phase={phase} move={move} enter={fade(frame, 4 + i * 3, 12)} />
        ))}
      </div>
    </Stage>
  );
};

const gpuX = (i: number) => 250 + i * 300;

const Gpu: React.FC<{ index: number; phase: number; move: number; enter: number }> = ({ index, phase, move, enter }) => {
  const cells = Array.from({ length: N }, (_, k) => {
    if (phase === 0) return k === 0 ? move > 0 || index === 0 : false;
    if (phase === 1) return k === index || move > 0.15 && true && (k === index || move > 0);
    if (phase === 2) return true;
    return move > 0.2 || k === index;
  });
  // Phase-specific visibility, written explicitly so the boolean above stays readable.
  const show = (k: number) => {
    if (phase === 0) return index === 0 ? k === 0 : k === 0 && move > 0.55;
    if (phase === 1) return k === index || move > 0.72;
    if (phase === 2) return move > 0.45 || k === index;
    return true;
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: gpuX(index),
        top: 0,
        width: 150,
        height: 170,
        borderRadius: 16,
        background: '#1d140e',
        border: `2px solid ${COPPER}`,
        opacity: enter,
        padding: 16,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {cells.map((_, k) => (
          <div
            key={k}
            style={{
              height: 36,
              borderRadius: 4,
              background: show(k) ? COLORS[k] : '#2b1c12',
              opacity: show(k) ? 1 : 1,
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 18, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: INK }}>
        GPU {index}
      </div>
      {phase === 2 && move > 0.45 ? (
        <div style={{ textAlign: 'center', fontSize: 32, color: COPPER_HI, marginTop: 4 }}>Σ</div>
      ) : (
        <div style={{ height: 32 }} />
      )}
    </div>
  );
};

void INK2;
