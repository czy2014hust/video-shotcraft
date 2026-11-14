import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';

/** Each topology gets one 7s beat; the sixth beat is the comparison table. */
export const TOPO_PHASE = 210;
const PH = TOPO_PHASE;
const GPU_W = 116;
const GPU_H = 64;
const TRAVEL_AT = 120;
const TRAVEL_LEN = 40;

type Pt = { x: number; y: number };
type Infra = Pt & { id: string; label: string; w: number };
type Phase = {
  tab: string;
  name: string;
  sub: string;
  color: string;
  gpus: Pt[];
  infra: Infra[];
  links: Array<[string, string]>;
  path: string[];
  lines: string;
  far: string;
  note: string;
};

const ROW_PCIE = [150, 280, 410, 540, 760, 890, 1020, 1150].map((x) => ({ x, y: 690 }));
const CIRCLE = Array.from({ length: 8 }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
  return { x: 650 + 250 * Math.cos(a), y: 530 + 230 * Math.sin(a) };
});
const ROW = Array.from({ length: 8 }, (_, i) => ({ x: 650 + (i - 3.5) * 130, y: 720 }));

const pairs = (n: number) => {
  const out: Array<[string, string]> = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push([`g${i}`, `g${j}`]);
  return out;
};

const PHASES: Phase[] = [
  {
    tab: 'PCIe 树',
    name: 'PCIe 树',
    sub: 'GPU 挂在 CPU 和 PCIe 交换下面',
    color: SLOW,
    gpus: ROW_PCIE,
    infra: [
      { id: 'cpu', label: 'CPU', x: 650, y: 300, w: 170 },
      { id: 'pa', label: 'PCIe 交换', x: 345, y: 490, w: 210 },
      { id: 'pb', label: 'PCIe 交换', x: 955, y: 490, w: 210 },
    ],
    links: [
      ['cpu', 'pa'],
      ['cpu', 'pb'],
      ...[0, 1, 2, 3].map((i): [string, string] => ['pa', `g${i}`]),
      ...[4, 5, 6, 7].map((i): [string, string] => ['pb', `g${i}`]),
    ],
    path: ['g0', 'pa', 'cpu', 'pb', 'g7'],
    lines: '10',
    far: '3',
    note: '上行 x16 单向约 64 GB/s，同组几块卡共用。',
  },
  {
    tab: '直连',
    name: '直连',
    sub: '两两之间一条线',
    color: COPPER,
    gpus: CIRCLE,
    infra: [],
    links: pairs(8),
    path: ['g0', 'g4'],
    lines: '28',
    far: '0',
    note: '72 卡要 2,556 条线，每卡 71 个口。NVLink 5 每卡只有 18 条。',
  },
  {
    tab: '环',
    name: '环',
    sub: '每卡只连左右邻居',
    color: SIGNAL,
    gpus: CIRCLE,
    infra: [],
    links: Array.from({ length: 8 }, (_, i): [string, string] => [`g${i}`, `g${(i + 1) % 8}`]),
    path: ['g0', 'g1', 'g2', 'g3', 'g4'],
    lines: '8',
    far: '3',
    note: '72 卡时最远要中转 35 次。后面的 Ring 算法是数据的走法，不是这条硬件环。',
  },
  {
    tab: '胖树',
    name: '胖树',
    sub: '叶交换机连脊交换机',
    color: SLOW,
    gpus: ROW,
    infra: [
      { id: 's0', label: '脊', x: 455, y: 330, w: 150 },
      { id: 's1', label: '脊', x: 845, y: 330, w: 150 },
      ...[260, 520, 780, 1040].map((x, k) => ({ id: `l${k}`, label: '叶', x, y: 525, w: 150 })),
    ],
    links: [
      ...Array.from({ length: 8 }, (_, i): [string, string] => [`l${Math.floor(i / 2)}`, `g${i}`]),
      ...[0, 1, 2, 3].flatMap((k): Array<[string, string]> => [
        [`s0`, `l${k}`],
        [`s1`, `l${k}`],
      ]),
    ],
    path: ['g0', 'l0', 's0', 'l3', 'g7'],
    lines: '16',
    far: '3',
    note: '往上的总带宽不缩水，所以叫胖树。加交换机就能继续扩。',
  },
  {
    tab: 'NVSwitch',
    name: 'NVSwitch',
    sub: '每卡连到每一颗交换芯片',
    color: SIGNAL,
    gpus: ROW,
    infra: [320, 540, 760, 980].map((x, k) => ({ id: `w${k}`, label: '交换芯片', x, y: 420, w: 190 })),
    links: [0, 1, 2, 3].flatMap((k) => Array.from({ length: 8 }, (_, i): [string, string] => [`w${k}`, `g${i}`])),
    path: ['g0', 'w0', 'g7'],
    lines: '32',
    far: '1',
    note: '真机每卡 18 条，分别连 18 颗芯片。卡再多，也只中转一次。',
  },
];

const linkStarts = (count: number) => {
  const starts: number[] = [];
  let t = 26;
  for (let i = 0; i < count; i++) {
    starts.push(t);
    t += Math.max(1.5, 6 - i * 0.4);
  }
  return starts;
};

const along = (pts: Pt[], t: number): Pt => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i] || i === seg.length - 1) {
      const k = seg[i] === 0 ? 0 : Math.min(1, left / seg[i]);
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
    }
    left -= seg[i];
  }
  return pts[pts.length - 1];
};

const reachedAt = (pts: Pt[]) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let acc = 0;
  return pts.map((_, i) => {
    if (i > 0) acc += seg[i - 1];
    return total === 0 ? 0 : acc / total;
  });
};

export const TopologiesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(PHASES.length, Math.floor(frame / PH));
  const local = frame - idx * PH;

  return (
    <Stage chapter="04" name="五种接法" tag="示意 · 8 卡">
      <Tabs active={idx} />
      {idx < PHASES.length ? (
        <div style={{ position: 'absolute', left: 80, top: 196, fontSize: 30, color: INK2 }}>
          <span style={{ color: COPPER_HI }}>■</span> 橙色块 = 一个数据包，从 GPU0 出发，去最远的那张卡
        </div>
      ) : null}
      {idx < PHASES.length ? <Diagram idx={idx} local={local} /> : <Summary local={local} />}
    </Stage>
  );
};

const Tabs: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: 'absolute', left: 80, right: 80, top: 128, display: 'flex', gap: 16 }}>
    {PHASES.map((p, i) => {
      const on = i === active;
      const done = i < active;
      return (
        <div
          key={p.tab}
          style={{
            flex: 1,
            padding: '10px 18px',
            borderRadius: 12,
            border: `1.5px solid ${on ? COPPER_HI : '#2a3138'}`,
            background: on ? '#24180f' : 'transparent',
            fontSize: 32,
            color: on ? COPPER_HI : done ? INK2 : INK3,
          }}
        >
          {p.tab}
        </div>
      );
    })}
  </div>
);

const Diagram: React.FC<{ idx: number; local: number }> = ({ idx, local }) => {
  const ph = PHASES[idx];
  const prev = idx > 0 ? PHASES[idx - 1].gpus : ph.gpus;
  const morph = idx === 0 ? 1 : rise(local, 0, 26);
  const enter = idx === 0 ? fade(local, 4, 20) : 1;
  const out = 1 - fade(local, PH - 12, 12);
  const gpus = ph.gpus.map((p, i) => ({
    x: prev[i].x + (p.x - prev[i].x) * morph,
    y: prev[i].y + (p.y - prev[i].y) * morph,
  }));
  const infraIn = fade(local, 14, 16) * out;
  const pos = (id: string): Pt => (id.startsWith('g') ? gpus[Number(id.slice(1))] : ph.infra.find((n) => n.id === id)!);
  const starts = linkStarts(ph.links.length);
  const travel = rise(local, TRAVEL_AT, TRAVEL_LEN);
  const pathPts = ph.path.map(pos);
  const marks = reachedAt(pathPts);
  const packet = along(pathPts, travel);
  const flowOn = fade(local, TRAVEL_AT - 10, 10) * out;
  const arrived = fade(local, TRAVEL_AT + TRAVEL_LEN + 2, 12);
  const card = fade(local, 18, 18) * out;
  const onPath = (id: string) => {
    const k = ph.path.indexOf(id);
    return k >= 0 && local >= TRAVEL_AT && travel >= marks[k] - 0.001;
  };

  return (
    <>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: enter }}>
        {ph.links.map(([a, b], i) => {
          const p = pos(a);
          const q = pos(b);
          const t = rise(local, starts[i], 14);
          return (
            <line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={p.x + (q.x - p.x) * t}
              y2={p.y + (q.y - p.y) * t}
              stroke={ph.color}
              strokeWidth={idx === 1 ? 1.6 : 2.4}
              opacity={(idx === 1 ? 0.55 : 0.85) * out}
            />
          );
        })}
        <polyline
          points={pathPts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={COPPER_HI}
          strokeWidth={5}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - travel}
          opacity={flowOn}
        />
        {ph.infra.map((n) => (
          <Box key={n.id} x={n.x} y={n.y} w={n.w} label={n.label} stroke={onPath(n.id) ? COPPER_HI : ph.color === COPPER ? SLOW : ph.color} opacity={infraIn} hot={onPath(n.id)} />
        ))}
        {gpus.map((g, i) => (
          <Box key={i} x={g.x} y={g.y} w={GPU_W} label={`GPU${i}`} mono stroke={onPath(`g${i}`) ? COPPER_HI : COPPER} opacity={1} hot={onPath(`g${i}`)} />
        ))}
        <rect
          x={packet.x - 14}
          y={packet.y - 14}
          width={28}
          height={28}
          rx={6}
          fill={COPPER_HI}
          opacity={flowOn * (1 - fade(local, TRAVEL_AT + TRAVEL_LEN - 4, 10))}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 1290,
          top: 250,
          width: 540,
          opacity: card,
          transform: `translateY(${(1 - card) * 12}px)`,
          padding: '30px 34px',
          borderRadius: 18,
          border: '1.5px solid #2a3138',
          background: 'rgba(18,22,27,0.92)',
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, color: COPPER_HI }}>{ph.name}</div>
        <div style={{ marginTop: 6, fontSize: 32, color: INK2 }}>{ph.sub}</div>
        <Metric label="8 卡要几条线" value={ph.lines} opacity={1} />
        <Metric label="最远要中转几次" value={ph.far} opacity={arrived} accent />
        <div style={{ marginTop: 22, fontSize: 32, lineHeight: 1.45, color: INK2 }}>{ph.note}</div>
      </div>
    </>
  );
};

const Metric: React.FC<{ label: string; value: string; opacity: number; accent?: boolean }> = ({ label, value, opacity, accent }) => (
  <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
    <div style={{ fontSize: 32, color: INK }}>{label}</div>
    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, color: accent ? COPPER_HI : INK, opacity }}>{value}</div>
  </div>
);

const Box: React.FC<{ x: number; y: number; w: number; label: string; stroke: string; opacity: number; hot: boolean; mono?: boolean }> = ({
  x,
  y,
  w,
  label,
  stroke,
  opacity,
  hot,
  mono,
}) => (
  <g opacity={opacity}>
    <rect
      x={x - w / 2}
      y={y - GPU_H / 2}
      width={w}
      height={GPU_H}
      rx={14}
      fill={hot ? '#2a1a0f' : '#14110e'}
      stroke={stroke}
      strokeWidth={hot ? 3 : 2}
    />
    <text x={x} y={y + 11} textAnchor="middle" fill={INK} fontFamily={mono ? 'JetBrains Mono' : 'Noto Sans SC'} fontWeight={mono ? 700 : 500} fontSize={32}>
      {label}
    </text>
  </g>
);

const ROWS = [
  { name: 'PCIe 树', far: '3', big: '不是卡间主路', use: '主机、网卡、存储', tone: 'slow' },
  { name: '直连', far: '0', big: '每卡要 71 个口', use: '8 卡以内', tone: 'plain' },
  { name: '环', far: '3', big: '最远中转 35 次', use: '相邻卡传递', tone: 'plain' },
  { name: '胖树', far: '3', big: '跨叶仍是 3 次', use: '柜间 scale-out', tone: 'slow' },
  { name: 'NVSwitch', far: '1', big: '每卡 18 条，仍是 1 次', use: '柜内 scale-up', tone: 'hot' },
] as const;

const Summary: React.FC<{ local: number }> = ({ local }) => {
  const starts = [10, 30, 46, 58, 66];
  const cols = '1fr 1fr 1.7fr 1.3fr';
  return (
    <div style={{ position: 'absolute', left: 96, right: 96, top: 250 }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '0 28px 14px', fontSize: 32, color: INK2, opacity: fade(local, 0, 14) }}>
        <div>接法</div>
        <div>8 卡最远中转</div>
        <div>到了 72 卡</div>
        <div>用在哪</div>
      </div>
      {ROWS.map((row, i) => {
        const t = rise(local, starts[i], 20);
        const hot = row.tone === 'hot';
        return (
          <div
            key={row.name}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              alignItems: 'center',
              padding: '16px 28px',
              marginBottom: 10,
              borderRadius: 14,
              background: hot ? '#24180f' : '#12161b',
              border: `1.5px solid ${hot ? COPPER_HI : '#242b33'}`,
              opacity: t,
              transform: `translateY(${(1 - t) * 10}px)`,
              fontSize: 36,
            }}
          >
            <div style={{ fontWeight: 700, color: hot ? COPPER_HI : INK }}>{row.name}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, color: hot ? COPPER_HI : INK }}>{row.far}</div>
            <div style={{ color: INK2 }}>{row.big}</div>
            <div style={{ color: hot ? COPPER_HI : row.tone === 'slow' ? SLOW : INK2 }}>{row.use}</div>
          </div>
        );
      })}
    </div>
  );
};
