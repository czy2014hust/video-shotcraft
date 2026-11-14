import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BG, CN, COPPER, COPPER_HI, EASE, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';
import { V_CAPTIONS, V_SFX, V_SHOTS, V_TOTAL } from './timeline-vertical';

const COLORS = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a', '#9be38a', '#c39bf0', '#6fd3e8'];
const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const VerticalFilm: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    {V_SHOTS.map((s) => {
      const Scene = V_SCENES[s.id as keyof typeof V_SCENES];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.duration}>
          <Scene />
        </Sequence>
      );
    })}
    {V_CAPTIONS.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.duration}>
        <VCaption text={c.text} duration={c.duration} />
      </Sequence>
    ))}
    {V_SFX.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames}>
        <Audio src={staticFile(c.src)} volume={c.volume} />
      </Sequence>
    ))}
    <VProgress />
  </AbsoluteFill>
);

const V_SCENES = {
  'v-open': VOpen,
  'v-split': VSplit,
  'v-topo': VTopo,
  'v-collectives': VCollectives,
  'v-time': VTime,
  'v-outro': VOutro,
} as const;

/* ---------- shared vertical chrome ---------- */
const VStage: React.FC<{ chapter: string; name: string; children: React.ReactNode }> = ({ chapter, name, children }) => (
  <AbsoluteFill style={{ background: BG, fontFamily: CN, color: INK, overflow: 'hidden' }}>
    <AbsoluteFill style={{ backgroundImage: 'linear-gradient(rgba(220,230,240,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(220,230,240,0.045) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
    <div style={{ position: 'absolute', left: 56, top: 52, display: 'flex', gap: 16, alignItems: 'baseline' }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 38, color: COPPER }}>{chapter}</span>
      <span style={{ fontSize: 38, color: INK2 }}>{name}</span>
    </div>
    {children}
  </AbsoluteFill>
);

const VCaption: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: EASE });
  const exit = interpolate(frame, [Math.max(8, duration - 10), duration], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: enter * exit }}>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 360, background: 'linear-gradient(to top, rgba(6,8,10,0.95) 40%, transparent)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 64px 84px' }}>
        <div style={{ fontFamily: CN, fontSize: 58, fontWeight: 500, lineHeight: 1.3, textAlign: 'center', color: INK }}>
          {text.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const VProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const inset = 56, gap = 4;
  const usable = 1080 - inset * 2 - gap * (V_SHOTS.length - 1);
  let x = inset;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {V_SHOTS.map((s) => {
        const w = (s.duration / V_TOTAL) * usable;
        const left = x;
        x += w + gap;
        const seen = frame - s.from;
        const filled = seen <= 0 ? 0 : seen >= s.duration ? 1 : seen / s.duration;
        return (
          <div key={s.id} style={{ position: 'absolute', left, bottom: 28, width: w, height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.10)' }}>
            <div style={{ width: `${filled * 100}%`, height: '100%', background: COPPER, borderRadius: 2 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

function VOpen() {
  const frame = useCurrentFrame();
  const RX = 300, RY = 620, RW = 480, TH = 21, TG = 5;
  return (
    <VStage chapter="01" name="通信全景 · GB200 NVL72">
      <div style={{ position: 'absolute', left: 64, top: 150, opacity: fade(frame, 20, 24) }}>
        <div style={{ fontSize: 40, color: COPPER, letterSpacing: '0.1em' }}>大模型训练与推理</div>
        <div style={{ marginTop: 16, fontSize: 118, fontWeight: 900, lineHeight: 1.05 }}>
          <span style={{ fontFamily: MONO, color: COPPER_HI }}>72</span> 块 GPU
        </div>
        <div style={{ marginTop: 14, fontSize: 60, fontWeight: 800 }}>像一块 GPU 一样工作</div>
      </div>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <rect x={RX - 14} y={RY - 14} width={RW + 28} height={27 * TH + 26 * TG + 60} rx={18} fill="#0d1013" stroke="#2c343c" strokeWidth={2} />
        <line x1={RX - 34} y1={RY + 30} x2={RX - 34} y2={RY + 27 * TH + 26 * TG} stroke={COPPER} strokeWidth={3} opacity={0.55} />
        {Array.from({ length: 27 }, (_, i) => {
          const isSw = i % 3 === 2;
          const y = RY + 16 + i * (TH + TG);
          const t = rise(frame, 16 + i * 3, 14);
          return (
            <g key={i} opacity={t}>
              <rect x={RX} y={y} width={RW} height={TH} rx={4} fill={isSw ? '#0f201b' : '#1d140e'} stroke={isSw ? SIGNAL : COPPER} strokeWidth={isSw ? 1.6 : 1.1} />
              {isSw
                ? [0, 1].map((s) => <rect key={s} x={RX + 145 + s * 125} y={y + 5} width={82} height={TH - 10} rx={3} fill={SIGNAL} opacity={0.75} />)
                : [0, 1, 2, 3].map((s) => <rect key={s} x={RX + 185 + s * 70} y={y + 4} width={50} height={TH - 8} rx={3} fill={COPPER_HI} opacity={0.3 + 0.5 * rise(frame, 60 + i * 2 + s, 16)} />)}
            </g>
          );
        })}
        {[0, 1].map((k) => {
          const tt = ((frame * 0.006 + k * 0.5) % 1 + 1) % 1;
          return <circle key={k} cx={RX - 34} cy={RY + 30 + tt * 660} r={6} fill={SIGNAL} opacity={fade(frame, 110, 20)} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 64, top: 1420, fontSize: 38, lineHeight: 1.5, opacity: fade(frame, 100, 20) }}>
        <div><span style={{ color: COPPER_HI }}>■</span> 计算托盘 ×18（每托 4 GPU）</div>
        <div><span style={{ color: SIGNAL }}>■</span> 交换托盘 ×9（每托 2 颗 NVSwitch）</div>
        <div style={{ marginTop: 10, color: INK2 }}>柜内 5,000+ 根铜缆 · All-to-All 聚合 <span style={{ fontFamily: MONO, color: SIGNAL, fontWeight: 700 }}>130 TB/s</span></div>
      </div>
    </VStage>
  );
}

function VSplit() {
  const frame = useCurrentFrame();
  const spread = rise(frame, 90, 80);
  return (
    <VStage chapter="02" name="为什么要通信">
      <div style={{ position: 'absolute', left: 64, top: 170, opacity: fade(frame, 6, 20) }}>
        <div style={{ fontFamily: MONO, fontSize: 38, color: INK2 }}>405B · BF16</div>
        <div style={{ marginTop: 12, fontSize: 72, fontWeight: 700 }}>权重 <span style={{ fontFamily: MONO, color: COPPER_HI }}>810 GB</span></div>
        <div style={{ marginTop: 10, fontSize: 44, color: INK2 }}>单卡显存只有 <span style={{ fontFamily: MONO, color: INK }}>186 GB</span></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 520, height: 760 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const gx = 190 + col * 360, gy = row * 185;
          const x = gx * spread + 365 * (1 - spread);
          const y = gy * spread + 280 * (1 - spread);
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: 330, height: 160, borderRadius: 16, background: '#1d140e', border: `2px solid ${COPPER}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: fade(frame, 10 + i * 3, 14) }}>
              <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, color: COPPER_HI }}>GPU · W{i + 1}</div>
              <div style={{ marginTop: 6, fontSize: 36, color: INK2 }}>装自己那份权重</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 64, right: 64, top: 1360, opacity: fade(frame, 185, 20) }}>
        <div style={{ display: 'flex', height: 30, borderRadius: 9, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ width: '23%', background: COPPER_HI }} />
        </div>
        <div style={{ marginTop: 12, fontSize: 38, color: INK2 }}>810 ÷ 186 ≈ <span style={{ fontFamily: MONO, color: COPPER_HI, fontWeight: 700 }}>4.4</span> · 光权重至少 5 块卡</div>
      </div>
    </VStage>
  );
}

function VTopo() {
  const frame = useCurrentFrame();
  const phase = frame < 180 ? 0 : frame < 360 ? 1 : 2;
  const local = frame - phase * 180;
  const tabs = ['环', 'NVSwitch', '柜内 + 柜间'];
  return (
    <VStage chapter="03" name="怎么接 · 示意 8 卡">
      <div style={{ position: 'absolute', left: 56, right: 56, top: 140, display: 'flex', gap: 14 }}>
        {tabs.map((t, i) => (
          <div key={t} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 12, border: `1.5px solid ${i === phase ? COPPER_HI : '#2a3138'}`, background: i === phase ? '#24180f' : 'transparent', fontSize: 38, color: i === phase ? COPPER_HI : INK3 }}>{t}</div>
        ))}
      </div>
      {phase === 0 ? <RingV local={local} /> : phase === 1 ? <NvV local={local} /> : <SummaryV local={local} />}
    </VStage>
  );
}

const ringPos = (i: number) => ({ x: 540 + 300 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / 8), y: 760 + 290 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / 8) });
function RingV({ local }: { local: number }) {
  const travel = rise(local, 90, 45);
  const pts = [0, 1, 2, 3, 4].map(ringPos);
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let left = travel * total;
  let packet = pts[0];
  for (let i = 0; i < seg.length; i++) { if (left <= seg[i]) { const k = seg[i] ? left / seg[i] : 0; packet = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k }; break; } left -= seg[i]; packet = pts[i + 1]; }
  return (
    <>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 8 }, (_, i) => { const a = ringPos(i), b = ringPos((i + 1) % 8); return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={SIGNAL} strokeWidth={3} opacity={0.7 * rise(local, 20 + i * 4, 16)} />; })}
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={COPPER_HI} strokeWidth={6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - travel} />
        {Array.from({ length: 8 }, (_, i) => { const p = ringPos(i); return (<g key={i}><rect x={p.x - 72} y={p.y - 42} width={144} height={84} rx={14} fill="#1d140e" stroke={COPPER} strokeWidth={2} /><text x={p.x} y={p.y + 13} textAnchor="middle" fill={INK} fontFamily={MONO} fontWeight={700} fontSize={36}>GPU{i}</text></g>); })}
        <rect x={packet.x - 15} y={packet.y - 15} width={30} height={30} rx={7} fill={COPPER_HI} opacity={fade(local, 85, 8) * (1 - fade(local, 140, 12))} />
      </svg>
      <InfoCardV title="环" lines={[['每卡只连左右邻居', '线最省：8 卡只要 8 条'], ['最远中转', '3 次 · 72 卡时 35 次']]} local={local} />
    </>
  );
}

function NvV({ local }: { local: number }) {
  const gpus = Array.from({ length: 8 }, (_, i) => ({ x: 205 + (i % 4) * 225, y: 1080 + Math.floor(i / 4) * 190 }));
  const sws = [215, 430, 645, 860].map((x) => ({ x, y: 560 }));
  const travel = rise(local, 100, 35);
  const a = gpus[0], b = sws[0], c = gpus[7];
  const packet = travel < 0.5 ? { x: a.x + (b.x - a.x) * (travel * 2), y: a.y + (b.y - a.y) * (travel * 2) } : { x: b.x + (c.x - b.x) * (travel * 2 - 1), y: b.y + (c.y - b.y) * (travel * 2 - 1) };
  return (
    <>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        {sws.map((s, si) => gpus.map((g, gi) => <line key={`${si}-${gi}`} x1={s.x} y1={s.y} x2={g.x} y2={g.y} stroke={SIGNAL} strokeWidth={2} opacity={0.55 * rise(local, 24 + (si * 8 + gi) * 1.5, 14)} />))}
        <polyline points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} fill="none" stroke={COPPER_HI} strokeWidth={6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - travel} />
        {sws.map((s, i) => (<g key={i}><rect x={s.x - 88} y={s.y - 42} width={176} height={84} rx={14} fill="#0f201b" stroke={SIGNAL} strokeWidth={2} /><text x={s.x} y={s.y + 12} textAnchor="middle" fill={INK} fontSize={34}>交换芯片</text></g>))}
        {gpus.map((g, i) => (<g key={i}><rect x={g.x - 82} y={g.y - 44} width={164} height={88} rx={14} fill="#1d140e" stroke={COPPER} strokeWidth={2} /><text x={g.x} y={g.y + 13} textAnchor="middle" fill={INK} fontFamily={MONO} fontWeight={700} fontSize={36}>GPU{i}</text></g>))}
        <rect x={packet.x - 15} y={packet.y - 15} width={30} height={30} rx={7} fill={COPPER_HI} opacity={fade(local, 95, 8) * (1 - fade(local, 140, 12))} />
      </svg>
      <InfoCardV title="NVSwitch" lines={[['每卡连到每颗交换芯片', '真机每卡 18 条，连 18 颗'], ['最远中转', '1 次 · 卡再多也是一次']]} local={local} />
    </>
  );
}

const InfoCardV: React.FC<{ title: string; lines: Array<[string, string]>; local: number }> = ({ title, lines, local }) => (
  <div style={{ position: 'absolute', left: 56, right: 56, top: 1330, padding: '28px 32px', borderRadius: 18, border: '1.5px solid #2a3138', background: 'rgba(18,22,27,0.94)', opacity: fade(local, 130, 16) }}>
    <div style={{ fontSize: 48, fontWeight: 700, color: COPPER_HI }}>{title}</div>
    {lines.map(([a, b]) => (
      <div key={a} style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
        <span style={{ fontSize: 38, color: INK2 }}>{a}</span>
        <span style={{ fontSize: 38, fontWeight: 700, textAlign: 'right' }}>{b}</span>
      </div>
    ))}
  </div>
);

function SummaryV({ local }: { local: number }) {
  const rows = [
    ['环', '最远中转 35 次', '相邻传递'],
    ['胖树', '跨叶仍 3 次', '柜间 scale-out'],
    ['NVSwitch', '仍是 1 次', '柜内 scale-up'],
  ];
  return (
    <div style={{ position: 'absolute', left: 56, right: 56, top: 300 }}>
      {rows.map(([a, b, c], i) => {
        const hot = i === 2;
        const t = rise(local, 16 + i * 26, 20);
        return (
          <div key={a} style={{ padding: '30px 32px', marginBottom: 18, borderRadius: 16, background: hot ? '#24180f' : '#12161b', border: `1.5px solid ${hot ? COPPER_HI : '#242b33'}`, opacity: t, transform: `translateY(${(1 - t) * 12}px)` }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: hot ? COPPER_HI : INK }}>{a}</div>
            <div style={{ marginTop: 10, fontSize: 40, color: INK2 }}>{b}</div>
            <div style={{ marginTop: 6, fontSize: 40, color: hot ? COPPER_HI : SLOW }}>{c}</div>
          </div>
        );
      })}
    </div>
  );
}

function VCollectives() {
  const frame = useCurrentFrame();
  return (
    <VStage chapter="04" name="集合通信 · 示意 5 卡">
      <CollectPanelV y={230} title="AllGather 聚合" sub="每卡出一块，拼成完整一份" frame={frame} base={20} mode="gather" />
      <CollectPanelV y={830} title="All-to-All 全交换" sub="每卡给每卡不同的块" frame={frame} base={245} mode="a2a" />
    </VStage>
  );
}

const CollectPanelV: React.FC<{ y: number; title: string; sub: string; frame: number; base: number; mode: 'gather' | 'a2a' }> = ({ y, title, sub, frame, base, mode }) => {
  const local = frame - (mode === 'gather' ? 0 : 225);
  return (
    <div style={{ position: 'absolute', left: 56, right: 56, top: y, padding: '26px 28px', borderRadius: 18, border: `1.5px solid ${mode === 'gather' ? SIGNAL : '#e58aa8'}`, background: '#12161b', opacity: fade(frame, base - 20, 18) }}>
      <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: mode === 'gather' ? SIGNAL : '#e58aa8' }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 38, color: INK2 }}>{sub}</div>
      <svg width="916" height="300" style={{ marginTop: 10 }}>
        {Array.from({ length: 5 }, (_, s) =>
          Array.from({ length: 5 }, (_, d) => {
            if (d === s) return null;
            const t = rise(local, 24 + (s * 5 + d) * 2, 24);
            if (t <= 0 || t >= 1) return null;
            const x = 95 + s * 182 + (95 + d * 182 - (95 + s * 182)) * t;
            return <rect key={`${s}${d}`} x={x - 11} y={86 - Math.sin(t * Math.PI) * 30} width={22} height={22} rx={5} fill={COLORS[s]} />;
          }),
        )}
        {Array.from({ length: 5 }, (_, g) => (
          <g key={g}>
            <rect x={95 + g * 182 - 78} y={108} width={156} height={118} rx={14} fill="#1d140e" stroke={COPPER} strokeWidth={2} />
            {Array.from({ length: 5 }, (_, k) => {
              const filled = k === g || rise(local, 24 + (k * 5 + g) * 2, 24) > 0.92;
              return <rect key={k} x={95 + g * 182 - 56 + k * 23} y={126} width={19} height={28} rx={3} fill={filled ? COLORS[k] : '#2b1c12'} />;
            })}
            <text x={95 + g * 182} y={198} textAnchor="middle" fill={INK2} fontFamily={MONO} fontSize={30}>GPU{g}</text>
          </g>
        ))}
      </svg>
      <div style={{ fontSize: 38, color: INK2 }}>{mode === 'gather' ? '每卡收进 (N−1)/N × S，结束时人手完整一份' : '给每个人的都不一样，结束时按收件人分好'}</div>
    </div>
  );
};

function VTime() {
  const frame = useCurrentFrame();
  const beat = frame < 210 ? 0 : frame < 420 ? 1 : 2;
  const local = frame - beat * 210;
  return (
    <VStage chapter="05" name="通信需要多久 · 理想值">
      {beat === 0 ? (
        <div style={{ position: 'absolute', left: 64, right: 64, top: 260 }}>
          <div style={{ fontFamily: MONO, fontSize: 96, fontWeight: 700, opacity: fade(local, 4, 18) }}>T ≈ <span style={{ color: SLOW }}>α</span> + <span style={{ color: COPPER_HI }}>S/B</span></div>
          <div style={{ marginTop: 22, fontSize: 42, lineHeight: 1.5, color: INK2 }}>α 是发一次就付的固定延迟<br />S/B 是数据量除以带宽</div>
          <div style={{ marginTop: 50, display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: `${8 * rise(local, 70, 24)}%`, background: SLOW }} />
            <div style={{ width: `${92 * rise(local, 105, 70)}%`, background: COPPER_HI }} />
          </div>
          <div style={{ marginTop: 14, fontSize: 38, color: INK2 }}>消息小，看 α；数据大，看 S/B</div>
        </div>
      ) : beat === 1 ? (
        <div style={{ position: 'absolute', left: 64, right: 64, top: 230 }}>
          <div style={{ fontFamily: MONO, fontSize: 56, fontWeight: 700, color: COPPER_HI }}>AllGather · 10 GB</div>
          <div style={{ marginTop: 14, fontSize: 42, color: INK2, lineHeight: 1.5 }}>每卡收进 9.86 GB<br />busBW 对齐链路才算得出时间</div>
          <div style={{ marginTop: 46 }}>
            <VRace label="柜内 NVLink 900 GB/s" ms={11} max={197} color={COPPER_HI} t={rise(local, 60, 38)} />
            <VRace label="出域 400G · 50 GB/s" ms={197} max={197} color={SLOW} t={rise(local, 80, 120)} />
          </div>
          <div style={{ fontSize: 38, color: INK3 }}>差 18 倍，就是柜内和出域的差</div>
        </div>
      ) : (
        <div style={{ position: 'absolute', left: 56, right: 56, top: 240 }}>
          <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 700, color: '#e58aa8' }}>All-to-All · 同样 10 GB</div>
          <div style={{ marginTop: 14, fontSize: 42, color: INK2 }}>等量交换时同账：11 对 197 毫秒</div>
          {[
            ['AllGather', '11 ms', '197 ms', false],
            ['All-to-All', '11 ms', '197 ms', false],
            ['AllReduce', '22 ms', '400 ms', true],
          ].map(([n, a, b, hot], i) => {
            const t = rise(local, 50 + i * 26, 20);
            return (
              <div key={n as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 28px', marginTop: 18, borderRadius: 14, background: hot ? '#24180f' : '#12161b', border: `1.5px solid ${hot ? COPPER_HI : '#242b33'}`, opacity: t, fontSize: 42 }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, color: hot ? COPPER_HI : INK }}>{n}</span>
                <span style={{ fontFamily: MONO, color: SIGNAL }}>{a}</span>
                <span style={{ fontFamily: MONO, color: SLOW }}>{b}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 22, fontSize: 38, color: INK2, opacity: fade(local, 140, 16) }}>真实专家路由不均，整组等最忙的那张卡</div>
        </div>
      )}
    </VStage>
  );
}

const VRace: React.FC<{ label: string; ms: number; max: number; color: string; t: number }> = ({ label, ms, max, color, t }) => (
  <div style={{ marginBottom: 40 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 42 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color }}>{Math.round(ms * t)}<span style={{ fontSize: 36 }}> ms</span></span>
    </div>
    <div style={{ marginTop: 12, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ width: `${Math.max(2, (ms / max) * t * 100)}%`, height: '100%', borderRadius: 12, background: color }} />
    </div>
  </div>
);

function VOutro() {
  const frame = useCurrentFrame();
  const words: Array<[string, string]> = [
    ['带宽', '单向 900 GB/s · 出域只剩 50'],
    ['延迟', '小消息先付 α'],
    ['拓扑', '柜内一跳 · 柜间胖树'],
  ];
  return (
    <VStage chapter="06" name="收束">
      <div style={{ position: 'absolute', left: 64, right: 64, top: 330 }}>
        {words.map(([w, sub], i) => {
          const t = rise(frame, 24 + i * 44, 18);
          return (
            <div key={w} style={{ marginBottom: 44, opacity: t, transform: `translateY(${(1 - t) * 14}px)` }}>
              <div style={{ fontSize: 110, fontWeight: 900, color: i === 1 ? COPPER_HI : INK }}>{w}</div>
              <div style={{ marginTop: 8, fontSize: 42, color: INK2 }}>{sub}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 30, fontSize: 48, fontWeight: 600, opacity: fade(frame, 175, 20) }}>通信决定模型能扩到多大</div>
      </div>
    </VStage>
  );
}
