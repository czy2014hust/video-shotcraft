import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { BEAT } from '../timeline';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';

const COLORS = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a'];

export const TrafficShot: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = frame < 240 ? 0 : frame < 480 ? 1 : frame < 750 ? 2 : 3;

  return (
    <Stage chapter="09" name="AllGather · All-to-All" tag="理想值 · 只算带宽项">
      {phase === 0 ? <Pair frame={frame} /> : null}
      {phase === 1 ? <Bytes frame={frame} /> : null}
      {phase === 2 ? <Bandwidth frame={frame} /> : null}
      {phase === 3 ? <Times frame={frame} /> : null}
    </Stage>
  );
};

const Pair: React.FC<{ frame: number }> = ({ frame }) => {
  const move = rise(frame, 24, 80);
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, top: 170, display: 'flex', gap: 36 }}>
      <Panel title="AllGather" sub="同色块拼成一份">
        <Row colors={COLORS.map(() => COLORS[0])} move={move} gather />
      </Panel>
      <Panel title="All-to-All" sub="异色块互相交换">
        <Row colors={COLORS} move={move} gather={false} />
      </Panel>
    </div>
  );
};

const Panel: React.FC<{ title: string; sub: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <div style={{ flex: 1, border: `1.5px solid ${COPPER}`, borderRadius: 18, padding: '28px 28px 36px', background: '#12161b' }}>
    <div style={{ fontFamily: MONO, fontSize: 36, fontWeight: 700, color: COPPER_HI }}>{title}</div>
    <div style={{ marginTop: 8, fontSize: 32, color: INK2 }}>{sub}</div>
    <div style={{ marginTop: 28 }}>{children}</div>
  </div>
);

const Row: React.FC<{ colors: string[]; move: number; gather: boolean }> = ({ colors, move, gather }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    {colors.map((color, index) => (
      <div key={index} style={{ width: 110, textAlign: 'center' }}>
        <div
          style={{
            height: 72,
            borderRadius: 10,
            background: '#1d140e',
            border: `2px solid ${COPPER}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 4,
            padding: 8,
          }}
        >
          {colors.map((cell, k) => (
            <div
              key={k}
              style={{
                borderRadius: 2,
                background: gather ? (move > 0.4 ? COLORS[0] : k === index ? color : '#2b1c12') : move > 0.45 ? cell : k === index ? color : '#2b1c12',
              }}
            />
          ))}
        </div>
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 32, color: INK2 }}>{index}</div>
      </div>
    ))}
  </div>
);

const Bytes: React.FC<{ frame: number }> = ({ frame }) => {
  const inView = fade(frame - 240, 0, 20);
  return (
    <div style={{ position: 'absolute', left: 140, top: 220, opacity: inView }}>
      <div style={{ fontSize: 36, color: INK2 }}>每卡要收进的字节</div>
      <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 72, fontWeight: 700, color: COPPER_HI }}>(N−1)/N × S</div>
      <div style={{ marginTop: 28, fontSize: 36, color: INK }}>
        S 是每卡最终的完整缓冲区。N = 72 时，系数约 <Num size={48}>0.986</Num>
      </div>
      <div style={{ marginTop: 18, fontSize: 36, color: INK2 }}>
        S = 10 GB 时，每卡约收 <Num size={48} color={SIGNAL}>9.86 GB</Num>
      </div>
      <div style={{ marginTop: 28, fontSize: 32, color: INK3 }}>All-to-All 按每人等量交换来算。真实的专家路由并不均匀。</div>
    </div>
  );
};

const Bandwidth: React.FC<{ frame: number }> = ({ frame }) => {
  const inView = fade(frame - 480, 0, 20);
  return (
    <div style={{ position: 'absolute', left: 140, top: 220, width: 1600, opacity: inView }}>
      <Def name="algBW" formula="S / 耗时" note="算法报出来的速度，用完整缓冲区除以墙上时间" />
      <Def name="busBW" formula="algBW × (N−1)/N" note="AllGather、All-to-All、ReduceScatter 都乘这个系数。和链路单向带宽对齐的是它" />
      <div style={{ marginTop: 12, fontSize: 32, color: INK3 }}>AllReduce 的系数是 2(N−1)/N，下一镜再算。</div>
    </div>
  );
};

const Def: React.FC<{ name: string; formula: string; note: string }> = ({ name, formula, note }) => (
  <div style={{ marginBottom: 36 }}>
    <div style={{ fontFamily: MONO, fontSize: 32, color: INK2 }}>{name}</div>
    <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 56, fontWeight: 700, color: COPPER_HI }}>{formula}</div>
    <div style={{ marginTop: 8, fontSize: 32, color: INK }}>{note}</div>
  </div>
);

const Times: React.FC<{ frame: number }> = ({ frame }) => {
  const fast = rise(frame, 760, 40);
  const slow = rise(frame, 860, 50);
  return (
    <div style={{ position: 'absolute', left: 140, top: 200, width: 1640 }}>
      <div style={{ fontSize: 36, color: INK2, marginBottom: 28 }}>
        S = <Num size={40}>10 GB</Num> · N = <Num size={40}>72</Num> · 理想值
      </div>
      <Bar label="柜内 NVLink · 900 GB/s 单向" time="≈ 11 ms" extra="algBW ≈ 913 · busBW 900" width={11 / 197} color={COPPER_HI} t={fast} />
      <Bar label="出域 400G · 50 GB/s" time="≈ 197 ms" extra="algBW ≈ 51 · busBW 50" width={1} color={SLOW} t={slow} />
      <div style={{ marginTop: 8, fontSize: 32, color: INK3 }}>单位 GB/s。只算带宽项，不含固定延迟和软件栈。</div>
    </div>
  );
};

const Bar: React.FC<{ label: string; time: string; extra: string; width: number; color: string; t: number }> = ({
  label,
  time,
  extra,
  width,
  color,
  t,
}) => (
  <div style={{ marginBottom: 36 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 36 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 48, color, opacity: t }}>{time}</div>
    </div>
    <div style={{ marginTop: 10, height: 18, borderRadius: 9, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ width: `${Math.max(1.5, width * t * 100)}%`, height: '100%', borderRadius: 9, background: color }} />
    </div>
    <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 32, color: INK2, opacity: t }}>{extra}</div>
  </div>
);
