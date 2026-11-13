import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER_HI, INK, INK2, INK3, SIGNAL, SLOW, fade, rise } from '../theme';

const BARS = [
  { name: 'NVLink + 交换机内归约', time: '≈ 11 ms', width: 11 / 400, color: SIGNAL },
  { name: 'NVLink 柜内 · 900 GB/s 单向', time: '≈ 22 ms', width: 22 / 400, color: COPPER_HI },
  { name: '若全走 400G 网络 · 50 GB/s', time: '≈ 400 ms', width: 1, color: SLOW },
];

export const CostShot: React.FC = () => {
  const frame = useCurrentFrame();
  const formula = fade(frame, 8, 22);

  return (
    <Stage chapter="08" name="通信要多久" tag="理想值 · 只算带宽项">
      <div style={{ position: 'absolute', left: 96, top: 150, opacity: formula }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 72, fontWeight: 700 }}>
          T ≈ <span style={{ color: INK2 }}>α</span> + <span style={{ color: COPPER_HI }}>S / B</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 32, color: INK2 }}>α 固定延迟 · S 数据量 · B 这条链路的带宽</div>
      </div>

      <div style={{ position: 'absolute', left: 96, top: 360, width: 1680 }}>
        <div style={{ fontSize: 36, color: INK, marginBottom: 26 }}>
          <Num size={40}>10 GB</Num> 梯度 · <Num size={40}>72</Num> 卡 AllReduce
        </div>
        {BARS.map((bar, index) => {
          const t = rise(frame, 70 + index * 52, 28);
          const locked = index === 2 ? fade(frame, BEAT.costLock, 12) : t;
          return (
            <div key={bar.name} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontSize: 36 }}>{bar.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 48, color: bar.color, opacity: locked }}>
                  {bar.time}
                </div>
              </div>
              <div style={{ height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${Math.max(0.8, bar.width * t * 100)}%`, height: '100%', borderRadius: 9, background: bar.color }} />
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: 8, fontSize: 32, color: INK3 }}>
          小消息反过来：延迟 α 占大头，这张图只说明大块数据。软件栈开销没有算进去。
        </div>
      </div>
    </Stage>
  );
};
