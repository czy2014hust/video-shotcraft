import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SLOW, fade, rise } from '../theme';

const ROWS = [
  { name: 'HBM3e 显存带宽', value: '8 TB/s', note: '单卡片上', width: 1, tone: 'ink' as const },
  { name: 'NVLink 5', value: '900 GB/s', note: '单向 · 卡间', width: 1, tone: 'copper' as const },
  { name: 'PCIe Gen5 ×16', value: '64 GB/s', note: '单向', width: 64 / 900, tone: 'slow' as const },
  { name: '400G 网卡', value: '50 GB/s', note: '单向', width: 50 / 900, tone: 'slow' as const },
];

const barColor = (tone: 'ink' | 'copper' | 'slow') =>
  tone === 'copper' ? COPPER_HI : tone === 'ink' ? INK : SLOW;

export const LadderShot: React.FC = () => {
  const frame = useCurrentFrame();
  const trap = rise(frame, BEAT.ladderTrap, 22);
  const strike = rise(frame, BEAT.ladderTrap, 16);
  const notes = fade(frame, 320, 22);

  return (
    <Stage chapter="05" name="带宽阶梯" tag="单向对齐">
      <div style={{ position: 'absolute', left: 96, top: 148, width: 1040 }}>
        {ROWS.map((row, index) => {
          const t = rise(frame, 18 + index * 28, 26);
          return (
            <div key={row.name} style={{ marginBottom: 28, opacity: t, transform: `translateY(${(1 - t) * 14}px)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 36, fontWeight: 500 }}>
                  {row.name}
                  <span style={{ marginLeft: 16, fontSize: 32, color: INK2 }}>{row.note}</span>
                </div>
                <Num size={44} color={barColor(row.tone)}>
                  {row.value}
                </Num>
              </div>
              <div style={{ marginTop: 10, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}>
                <div
                  style={{
                    width: `${Math.max(1.2, row.width * t * 100)}%`,
                    height: '100%',
                    borderRadius: 8,
                    background: barColor(row.tone),
                  }}
                />
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 4, fontSize: 36, color: INK, opacity: notes }}>
          折算：NVLink 是 400G 的 <Num size={44} color={COPPER_HI}>18×</Num>，是 PCIe 的约 <Num size={44} color={COPPER_HI}>14×</Num>
        </div>
        <div style={{ marginTop: 8, fontSize: 32, color: INK3, opacity: notes }}>
          条按 NVLink 单向 900 GB/s 对齐。HBM 约是它的 9 倍，单独画满。PCIe 双向约 128 GB/s。
        </div>
        <div style={{ marginTop: 10, fontSize: 32, color: INK2, opacity: notes }}>
          NVLink-C2C：Grace 与两块 GPU <span style={{ color: INK }}>共享 900 GB/s 双向</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 96,
          top: 250,
          width: 560,
          opacity: trap,
          transform: `translateY(${(1 - trap) * 12}px)`,
          border: `1.5px solid ${COPPER}`,
          borderRadius: 18,
          padding: '32px 36px',
          background: 'rgba(20,14,10,0.88)',
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 32, color: INK3 }}>单位陷阱</div>
        <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 54, fontWeight: 700, color: INK2, position: 'relative' }}>
          400 GB/s
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '54%',
              height: 4,
              width: `${strike * 78}%`,
              background: COPPER_HI,
            }}
          />
        </div>
        <div style={{ marginTop: 18, fontSize: 40, color: INK }}>
          400 Gb/s = <Num size={56} color={COPPER_HI}>50 GB/s</Num>
        </div>
        <div style={{ marginTop: 12, fontSize: 32, color: INK2 }}>b 是比特，B 是字节，差 8 倍</div>
      </div>
    </Stage>
  );
};
