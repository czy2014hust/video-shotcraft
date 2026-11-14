import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, SIGNAL, SLOW, fade } from '../theme';

const PHASES = [
  { id: 'pcie', from: 0, title: 'PCIe 树' },
  { id: 'direct', from: 240, title: '直连' },
  { id: 'ring', from: 450, title: '环' },
  { id: 'fat', from: 660, title: '胖树' },
  { id: 'nv', from: 870, title: 'NVSwitch' },
  { id: 'both', from: 1110, title: '柜内 + 柜间' },
] as const;

export const TopologiesShot: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = [...PHASES].reverse().find((item) => frame >= item.from) ?? PHASES[0];
  const enter = fade(frame - phase.from, 0, 16);

  return (
    <Stage chapter="04" name="五种接法" tag="示意">
      <div style={{ position: 'absolute', left: 96, top: 140, fontSize: 40, fontWeight: 700, color: COPPER_HI, opacity: enter }}>
        {phase.title}
      </div>
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: enter }}>
        {phase.id === 'pcie' ? <Pcie /> : null}
        {phase.id === 'direct' ? <Direct /> : null}
        {phase.id === 'ring' ? <RingTopo /> : null}
        {phase.id === 'fat' ? <Fat /> : null}
        {phase.id === 'nv' ? <NvSwitch /> : null}
        {phase.id === 'both' ? <Both /> : null}
      </svg>
    </Stage>
  );
};

const node = (x: number, y: number, label: string, stroke: string) => (
  <g key={`${x}-${y}-${label}`}>
    <rect x={x - 70} y={y - 36} width={140} height={72} rx={14} fill="#1d140e" stroke={stroke} strokeWidth={2} />
    <text x={x} y={y + 8} textAnchor="middle" fill={INK} fontFamily="Noto Sans SC" fontSize={32}>
      {label}
    </text>
  </g>
);

const Pcie: React.FC = () => (
  <g>
    <line x1={960} y1={300} x2={960} y2={420} stroke={SLOW} strokeWidth={8} />
    <line x1={420} y1={420} x2={1500} y2={420} stroke={SLOW} strokeWidth={4} />
    {[0, 1, 2, 3].map((i) => {
      const x = 420 + i * 360;
      return <line key={i} x1={x} y1={420} x2={x} y2={560} stroke={SLOW} strokeWidth={2} />;
    })}
    {node(960, 250, 'CPU', SLOW)}
    {[0, 1, 2, 3].map((i) => node(420 + i * 360, 640, 'GPU', COPPER))}
  </g>
);

const Direct: React.FC = () => {
  const xs = [360, 720, 1080, 1440];
  return (
    <g>
      {xs.map((x, i) =>
        xs.slice(i + 1).map((x2) => <line key={`${x}-${x2}`} x1={x} y1={480} x2={x2} y2={480} stroke={COPPER} strokeWidth={2} opacity={0.7} />),
      )}
      {xs.map((x, i) =>
        xs.map((x2, j) =>
          j > i + 1 ? <line key={`c${i}${j}`} x1={x} y1={420} x2={x2} y2={560} stroke={COPPER_HI} strokeWidth={1.5} opacity={0.35} /> : null,
        ),
      )}
      {xs.map((x, i) => node(x, 480, `GPU ${i}`, COPPER_HI))}
    </g>
  );
};

const RingTopo: React.FC = () => {
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 8;
    return { x: 960 + 260 * Math.cos(a), y: 500 + 220 * Math.sin(a) };
  });
  return (
    <g>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length];
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={SIGNAL} strokeWidth={3} />;
      })}
      {pts.map((p, i) => node(p.x, p.y, `${i}`, COPPER_HI))}
    </g>
  );
};

const Fat: React.FC = () => (
  <g>
    <line x1={960} y1={250} x2={640} y2={420} stroke={SLOW} strokeWidth={2} />
    <line x1={960} y1={250} x2={1280} y2={420} stroke={SLOW} strokeWidth={2} />
    {[360, 640, 1280, 1560].map((x, i) => (
      <line key={x} x1={i < 2 ? 640 : 1280} y1={420} x2={x} y2={640} stroke={SLOW} strokeWidth={2} />
    ))}
    {node(960, 220, '脊', SLOW)}
    {node(640, 420, '叶', SLOW)}
    {node(1280, 420, '叶', SLOW)}
    {[360, 640, 1280, 1560].map((x, i) => node(x, 680, `GPU ${i}`, COPPER))}
  </g>
);

const NvSwitch: React.FC = () => (
  <g>
    {[0, 1, 2, 3].map((i) => (
      <line key={i} x1={520} y1={300 + i * 110} x2={1280} y2={340 + i * 80} stroke={SIGNAL} strokeWidth={2.4} />
    ))}
    {[0, 1, 2, 3].map((i) => node(420, 300 + i * 110, `GPU ${i}`, COPPER_HI))}
    {[0, 1, 2, 3].map((i) => node(1400, 340 + i * 80, '交换', SIGNAL))}
  </g>
);

const Both: React.FC = () => (
  <g>
    <text x={480} y={230} fill={COPPER_HI} fontSize={32} fontFamily="Noto Sans SC">
      柜内 · NVSwitch
    </text>
    <text x={1180} y={230} fill={SLOW} fontSize={32} fontFamily="Noto Sans SC">
      柜间 · 胖树
    </text>
    {[0, 1, 2].map((i) => (
      <line key={`n${i}`} x1={360} y1={340 + i * 120} x2={700} y2={360 + i * 100} stroke={SIGNAL} strokeWidth={2.4} />
    ))}
    {[0, 1, 2].map((i) => node(280, 340 + i * 120, `GPU ${i}`, COPPER_HI))}
    {node(780, 460, '交换', SIGNAL)}
    <line x1={1180} y1={360} x2={1500} y2={520} stroke={SLOW} strokeWidth={2} />
    <line x1={1180} y1={560} x2={1500} y2={520} stroke={SLOW} strokeWidth={2} />
    {node(1100, 360, 'GPU', COPPER)}
    {node(1100, 560, 'GPU', COPPER)}
    {node(1580, 520, '网', SLOW)}
  </g>
);
