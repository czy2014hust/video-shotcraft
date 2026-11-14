import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER_HI, INK, INK2, MONO, SLOW, rise } from '../theme';

const ROWS = [
  { name: '张量并行 TP', comm: 'AllGather · ReduceScatter · AllReduce', where: '看 busBW · 柜内', hot: true },
  { name: '专家并行 EP', comm: 'All-to-All', where: '看 busBW · 柜内', hot: true },
  { name: '流水并行 PP', comm: '点对点收发', where: '可以跨柜', hot: false },
  { name: '数据并行 DP', comm: '梯度归约', where: '可以跨柜', hot: false },
];

export const TrainShot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage chapter="11" name="训练怎么放" tag="通信放在哪一级">
      <div style={{ position: 'absolute', left: 120, top: 180, width: 1680 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1fr', padding: '0 28px 16px', fontSize: 32, color: INK2 }}>
          <div>并行方式</div>
          <div>主要在传什么</div>
          <div>放在哪</div>
        </div>
        {ROWS.map((row, index) => {
          const t = rise(frame, 16 + index * 28, 22);
          return (
            <div
              key={row.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.2fr 1fr',
                alignItems: 'center',
                padding: '22px 28px',
                marginBottom: 12,
                borderRadius: 14,
                background: '#12161b',
                border: '1px solid #242b33',
                opacity: t,
                transform: `translateY(${(1 - t) * 12}px)`,
                fontSize: 40,
                fontWeight: 500,
              }}
            >
              <div style={{ fontFamily: MONO }}>{row.name}</div>
              <div style={{ fontSize: 32 }}>{row.comm}</div>
              <div style={{ color: row.hot ? COPPER_HI : SLOW }}>{row.where}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 18, fontSize: 32, color: INK2 }}>
          参数分片（FSDP / ZeRO）取权重用 AllGather。上下文并行的环形传递，柜内或跨柜都可以，看序列有多长。
        </div>
      </div>
    </Stage>
  );
};

void INK;
