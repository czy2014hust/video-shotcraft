import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, SIGNAL, SLOW, fade, rise } from '../theme';

export const TermsShot: React.FC = () => {
  const frame = useCurrentFrame();
  const scaleOut = rise(frame, 140, 50);
  const arrowOut = rise(frame, BEAT.termsBi - 28, 28);
  const hop = fade(frame, 760, 24);
  const domain = fade(frame, 900, 24);

  return (
    <Stage chapter="03" name="三个词" tag="scale-up / 单向 / 域">
      {frame < 360 ? (
        <ScaleBeat pull={scaleOut} />
      ) : frame < 720 ? (
        <DirectionBeat both={arrowOut} />
      ) : (
        <HopBeat hop={hop} domain={domain} />
      )}
    </Stage>
  );
};

const ScaleBeat: React.FC<{ pull: number }> = ({ pull }) => {
  const rackW = 220;
  const gap = 70 + pull * 280;
  return (
    <>
      {[-1, 0, 1].map((slot) => {
        const show = slot === 0 ? 1 : pull;
        const x = 960 + slot * gap - rackW / 2;
        return (
          <div key={slot} style={{ position: 'absolute', left: x, top: 280, opacity: show }}>
            <div
              style={{
                width: rackW,
                height: 300,
                borderRadius: 16,
                border: `2px solid ${slot === 0 ? COPPER_HI : SLOW}`,
                background: slot === 0 ? '#1d140e' : '#12161b',
                boxShadow: slot === 0 ? '0 0 28px rgba(244,183,129,0.25)' : 'none',
                padding: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                alignContent: 'start',
              }}
            >
              {Array.from({ length: 12 }, (_, d) => (
                <div key={d} style={{ height: 34, borderRadius: 5, background: slot === 0 ? COPPER : '#2a3138', opacity: slot === 0 ? 0.85 : 0.6 }} />
              ))}
              <div style={{ gridColumn: '1 / -1', marginTop: 8, fontSize: 32, color: slot === 0 ? COPPER_HI : INK2, textAlign: 'center' }}>
                {slot === 0 ? '域内加卡' : '域外加柜'}
              </div>
            </div>
            <div style={{ marginTop: 16, textAlign: 'center', fontSize: 32, color: slot === 0 ? COPPER_HI : INK2 }}>
              {slot === 0 ? 'scale-up' : 'scale-out'}
            </div>
          </div>
        );
      })}
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={960 - gap + rackW / 2} y1={430} x2={960 - rackW / 2} y2={430} stroke={SLOW} strokeWidth={3} opacity={pull} />
        <line x1={960 + rackW / 2} y1={430} x2={960 + gap - rackW / 2} y2={430} stroke={SLOW} strokeWidth={3} opacity={pull} />
      </svg>
    </>
  );
};

const DirectionBeat: React.FC<{ both: number }> = ({ both }) => (
  <div style={{ position: 'absolute', left: 180, right: 180, top: 300 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: INK2 }}>
      <span>GPU A</span><span>GPU B</span>
    </div>
    <svg width="1560" height="160">
      <line x1={80} y1={80} x2={1480} y2={80} stroke={COPPER} strokeWidth={6} />
      <polygon points="1480,80 1450,64 1450,96" fill={COPPER_HI} />
      <polygon points="80,80 110,64 110,96" fill={COPPER_HI} opacity={both} />
    </svg>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
      <div>
        <div style={{ fontSize: 32, color: INK2 }}>双向</div>
        <div style={{ marginTop: 8 }}>
          <Num size={72} color={COPPER_HI}>1.8</Num>
          <span style={{ fontSize: 36, color: INK2 }}> TB/s</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', opacity: both }}>
        <div style={{ fontSize: 32, color: INK2 }}>单向</div>
        <div style={{ marginTop: 8 }}>
          <Num size={72} color={SIGNAL}>900</Num>
          <span style={{ fontSize: 36, color: INK2 }}> GB/s</span>
        </div>
      </div>
    </div>
  </div>
);

const HopBeat: React.FC<{ hop: number; domain: number }> = ({ hop, domain }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 420,
        top: 240,
        width: 1080,
        height: 420,
        borderRadius: 24,
        border: `2px solid ${SIGNAL}`,
        opacity: domain,
      }}
    />
    <div style={{ position: 'absolute', left: 470, top: 200, fontSize: 32, color: SIGNAL, opacity: domain }}>NVLink 域</div>
    <Box x={500} y={360} label="GPU" />
    <Box x={860} y={360} label="交换芯片" accent={SIGNAL} />
    <Box x={1220} y={360} label="GPU" />
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <line x1={680} y1={450} x2={860} y2={450} stroke={COPPER_HI} strokeWidth={3} opacity={hop} />
      <line x1={1060} y1={450} x2={1220} y2={450} stroke={COPPER_HI} strokeWidth={3} opacity={hop} />
    </svg>
    <div style={{ position: 'absolute', left: 860, top: 560, width: 200, textAlign: 'center', fontSize: 32, color: COPPER_HI, opacity: hop }}>
      1 跳
    </div>
    <div style={{ position: 'absolute', left: 420, top: 700, fontSize: 32, color: INK3, opacity: domain }}>
      域内一跳就到；出了这个框，要经网卡、多跳、慢一个量级（第 07 章细算）
    </div>
  </>
);

const Box: React.FC<{ x: number; y: number; label: string; accent?: string }> = ({ x, y, label, accent = COPPER_HI }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 180,
      height: 140,
      borderRadius: 16,
      background: '#1d140e',
      border: `2px solid ${accent}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      color: INK,
    }}
  >
    {label}
  </div>
);
