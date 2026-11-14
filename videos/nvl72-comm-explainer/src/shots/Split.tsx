import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, MONO, fade, rise } from '../theme';

const TILES = 8;

export const SplitShot: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = fade(frame, 8, 28);
  const split = rise(frame, BEAT.splitBreak, 96);
  const verdict = fade(frame, 196, 24);
  const count = fade(frame, 330, 22);

  return (
    <Stage chapter="02" name="为什么要通信" tag="示意 · 权重">
      <div style={{ position: 'absolute', left: 96, top: 150, opacity: enter }}>
        <div style={{ fontFamily: MONO, fontSize: 32, color: INK2, letterSpacing: '0.06em' }}>405B 稠密模型 · BF16</div>
        <div style={{ marginTop: 8, fontSize: 40, fontWeight: 500, color: INK }}>
          权重 <Num size={64} color={COPPER_HI}>810 GB</Num>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 390, height: 180 }}>
        {Array.from({ length: TILES }, (_, index) => {
          const spread = (index - (TILES - 1) / 2) * 168;
          const x = 960 - 70 + spread * split;
          const y = (1 - split) * 10;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 140,
                height: 150,
                borderRadius: 16,
                background: '#1d140e',
                border: `2px solid ${index === 3 && split > 0.85 ? COPPER_HI : COPPER}`,
                opacity: enter,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: index === 3 && split > 0.85 ? '0 0 28px rgba(244,183,129,0.35)' : 'none',
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 32, color: COPPER_HI, fontWeight: 700 }}>GPU</div>
              <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 32, color: COPPER_HI, opacity: split }}>W{index + 1}</div>
              <div style={{ marginTop: 6, fontSize: 32, color: INK2 }}>{index === 3 ? '186 GB' : '显存'}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 640,
          opacity: verdict,
          display: 'flex',
          alignItems: 'baseline',
          gap: 28,
        }}
      >
        <div style={{ fontSize: 40, color: INK }}>
          单卡 <Num size={72} color={COPPER_HI}>186 GB</Num>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: COPPER }}>装不下 810 GB</div>
        <div style={{ fontSize: 36, color: INK2 }}>图上 8 块是示意，NVL72 有 72 块</div>
      </div>
      <div style={{ position: 'absolute', left: 96, top: 760, fontSize: 36, color: INK, opacity: count }}>
        810 ÷ 186 ≈ <Num size={48} color={COPPER_HI}>4.4</Num>
        <span style={{ color: INK2 }}> ，光权重至少 5 块卡，还没算 KV 和激活</span>
      </div>
      {/* capacity bar: one card's 186 GB against the 810 GB weight block */}
      <div style={{ position: 'absolute', left: 96, top: 850, width: 1100, opacity: count }}>
        <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ width: `${(186 / 810) * 100 * Math.min(1, count + 0.2)}%`, background: COPPER_HI }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 32, color: INK2 }}>橙色 = 一块卡装得下的 186 GB；剩下约 624 GB 必须摊到别的卡上，切开就得通信</div>
      </div>
    </Stage>
  );
};
