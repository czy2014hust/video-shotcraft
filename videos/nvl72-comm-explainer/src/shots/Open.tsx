import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, fade, rise, slide } from '../theme';

export const OPEN_DEFAULTS = {
  kicker: '大模型训练与推理',
  heroNum: '72',
  heroRest: '块 GPU',
  line: '像一块 GPU 一样工作',
  sub: '以 GB200 NVL72 为例',
};

/**
 * Front view of one NVL72 rack, drawn to count: 27 trays in 2:1 rhythm —
 * 18 compute trays (2 Grace + 4 GPU each = 72 GPU) and 9 switch trays
 * (2 NVSwitch each = 18 chips). A copper spine on the left ties the switch
 * trays together; packets run up and down it. Trays stagger in top→bottom.
 */
const RACK_X = 1210;
const RACK_Y = 168;
const RACK_W = 500;
const TRAY_H = 21;
const TRAY_GAP = 5;
const TRAYS = Array.from({ length: 27 }, (_, i) => (i % 3 === 2 ? 'switch' : 'compute') as 'compute' | 'switch');
const trayY = (i: number) => RACK_Y + 16 + i * (TRAY_H + TRAY_GAP);
const RACK_H = 16 * 2 + 27 * TRAY_H + 26 * TRAY_GAP;

export const OpenShot: React.FC<Partial<typeof OPEN_DEFAULTS>> = (props) => {
  const copy = { ...OPEN_DEFAULTS, ...props };
  const frame = useCurrentFrame();
  const title = fade(frame, 36, BEAT.openTitle - 36);
  const titleY = slide(frame, 36, BEAT.openTitle - 36, 28);
  const lineIn = fade(frame, 124, 24);
  const subIn = fade(frame, 156, 22);
  const statsIn = fade(frame, 178, 22);
  const rackIn = fade(frame, 10, 20);

  return (
    <Stage chapter="01" name="通信全景" tag="GB200 NVL72 · 机柜示意">
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        {/* rack frame */}
        <rect x={RACK_X - 14} y={RACK_Y - 14} width={RACK_W + 28} height={RACK_H + 28} rx={18} fill="#0d1013" stroke="#2c343c" strokeWidth={2} opacity={rackIn} />
        {/* copper spine tying switch trays */}
        <line x1={RACK_X - 34} y1={trayY(2)} x2={RACK_X - 34} y2={trayY(26)} stroke={COPPER} strokeWidth={3} opacity={0.55 * rackIn} />
        {TRAYS.map((kind, i) => {
          const y = trayY(i);
          const t = rise(frame, 16 + i * 3, 14);
          const isSw = kind === 'switch';
          return (
            <g key={i} opacity={t}>
              <rect x={RACK_X} y={y} width={RACK_W} height={TRAY_H} rx={4} fill={isSw ? '#0f201b' : '#1d140e'} stroke={isSw ? SIGNAL : COPPER} strokeWidth={isSw ? 1.6 : 1.1} />
              {isSw ? (
                <>
                  {[0, 1].map((s) => (
                    <rect key={s} x={RACK_X + 150 + s * 130} y={y + 5} width={86} height={TRAY_H - 10} rx={3} fill={SIGNAL} opacity={0.75} />
                  ))}
                  <line x1={RACK_X - 34} y1={y + TRAY_H / 2} x2={RACK_X} y2={y + TRAY_H / 2} stroke={COPPER_HI} strokeWidth={2} opacity={0.8} />
                </>
              ) : (
                <>
                  {[0, 1].map((s) => (
                    <rect key={`c${s}`} x={RACK_X + 18 + s * 52} y={y + 5} width={40} height={TRAY_H - 10} rx={3} fill="#3a2c1e" stroke={INK3} strokeWidth={0.8} />
                  ))}
                  {[0, 1, 2, 3].map((s) => (
                    <rect key={`g${s}`} x={RACK_X + 190 + s * 72} y={y + 4} width={52} height={TRAY_H - 8} rx={3} fill={COPPER_HI} opacity={0.28 + 0.5 * rise(frame, 60 + i * 2 + s, 16)} />
                  ))}
                </>
              )}
            </g>
          );
        })}
        {/* packets on the spine */}
        {[0, 1, 2].map((k) => {
          const span = trayY(26) - trayY(2);
          const tt = ((frame * 0.006 + k * 0.37) % 1 + 1) % 1;
          const y = trayY(2) + (k % 2 === 0 ? tt : 1 - tt) * span;
          return <circle key={k} cx={RACK_X - 34} cy={y} r={6} fill={SIGNAL} opacity={rackIn * fade(frame, 120, 20)} />;
        })}
      </svg>

      {/* rack legend */}
      <div style={{ position: 'absolute', left: RACK_X - 48, top: RACK_Y + RACK_H + 36, width: RACK_W + 90, opacity: fade(frame, 110, 20) }}>
        <div style={{ display: 'flex', gap: 28, fontSize: 32 }}>
          <span><span style={{ color: COPPER_HI }}>■</span> <span style={{ color: INK }}>计算托盘 ×18</span><span style={{ color: INK2 }}>（2 Grace + 4 GPU）</span></span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 28, fontSize: 32 }}>
          <span><span style={{ color: SIGNAL }}>■</span> <span style={{ color: INK }}>交换托盘 ×9</span><span style={{ color: INK2 }}>（2 颗 NVSwitch）→ 72 GPU 一跳互联</span></span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 96, top: 230, opacity: title, transform: `translateY(${titleY}px)` }}>
        <div style={{ fontSize: 36, fontWeight: 500, color: COPPER, letterSpacing: '0.12em' }}>{copy.kicker}</div>
        <div style={{ marginTop: 18, fontSize: 132, fontWeight: 900, lineHeight: 1, color: INK }}>
          <span style={{ fontFamily: MONO, fontWeight: 700, color: COPPER_HI }}>{copy.heroNum}</span>
          <span> {copy.heroRest}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 96, top: 500, fontSize: 72, fontWeight: 800, opacity: lineIn, transform: `translateY(${(1 - lineIn) * 16}px)` }}>
        {copy.line}
      </div>
      <div style={{ position: 'absolute', left: 96, top: 610, fontSize: 36, color: INK2, opacity: subIn }}>{copy.sub} · 右图就是这一柜</div>
      <div style={{ position: 'absolute', left: 96, top: 720, display: 'flex', gap: 72, opacity: statsIn }}>
        <Stat value={<><Num size={52}>5,000</Num><span style={{ fontSize: 32, color: INK2 }}>+</span></>} label="根铜缆（柜内背板）" />
        <Stat value={<><Num size={52}>≈3.2</Num><span style={{ fontSize: 32, color: INK2 }}> km</span></>} label="铜缆总长" />
        <Stat value={<><Num size={52} color={SIGNAL}>130</Num><span style={{ fontSize: 32, color: INK2 }}> TB/s</span></>} label="All-to-All 聚合" />
      </div>
    </Stage>
  );
};

const Stat: React.FC<{ value: React.ReactNode; label: string }> = ({ value, label }) => (
  <div>
    <div style={{ color: INK }}>{value}</div>
    <div style={{ marginTop: 4, fontSize: 32, color: INK2 }}>{label}</div>
  </div>
);
