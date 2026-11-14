import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, SIGNAL, fade, rise } from '../theme';

const N = 8;
const CX = 560;
const CY = 500;
const R = 210;

const pos = (i: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
};

export const RingShot: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = fade(frame, 6, 20);
  const travel = rise(frame, 30, 120);
  const formula = fade(frame, 150, 24);
  const angle = -Math.PI / 2 + travel * Math.PI * 1.5;

  return (
    <Stage chapter="07" name="Ring AllReduce" tag="示意 · 8 卡">
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={COPPER} strokeWidth={1.5} strokeDasharray="4 10" opacity={0.4 * enter} />
        {Array.from({ length: N }, (_, i) => {
          const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / N + 0.22;
          const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / N - 0.22;
          const large = 0;
          return (
            <path
              key={i}
              d={`M${CX + R * Math.cos(a0)} ${CY + R * Math.sin(a0)} A ${R} ${R} 0 ${large} 1 ${CX + R * Math.cos(a1)} ${CY + R * Math.sin(a1)}`}
              fill="none"
              stroke={SIGNAL}
              strokeWidth={3}
              opacity={enter}
            />
          );
        })}
        <rect
          x={CX + (R + 4) * Math.cos(angle) - 12}
          y={CY + (R + 4) * Math.sin(angle) - 12}
          width={24}
          height={24}
          rx={5}
          fill={COPPER_HI}
          opacity={enter}
        />
      </svg>
      {Array.from({ length: N }, (_, i) => {
        const p = pos(i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - 46,
              top: p.y - 46,
              width: 92,
              height: 92,
              borderRadius: 14,
              background: '#1d140e',
              border: `2px solid ${COPPER_HI}`,
              opacity: enter,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {i}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 1040, top: 240, width: 760, opacity: formula }}>
        <div style={{ fontSize: 36, color: INK2 }}>每卡要搬的数据</div>
        <div style={{ marginTop: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 54, fontWeight: 700, color: COPPER_HI }}>
          2(N−1)/N × S
        </div>
        <div style={{ marginTop: 28, fontSize: 36, lineHeight: 1.45 }}>
          先 <span style={{ color: SIGNAL }}>ReduceScatter</span>，每卡留下一块局部和
          <br />
          再 <span style={{ color: SIGNAL }}>AllGather</span>，把各块拼成完整结果
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: INK }}>
          N = <Num size={40}>72</Num> 时，系数约 <Num size={40} color={COPPER_HI}>1.97</Num>
        </div>
        <div style={{ marginTop: 10, fontSize: 32, color: INK2 }}>环只是算法形状，NVL72 上真正走的是交换芯片</div>
      </div>
    </Stage>
  );
};
