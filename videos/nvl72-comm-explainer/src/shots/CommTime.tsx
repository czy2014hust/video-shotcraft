import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { Stage, Num } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, INK3, MONO, SIGNAL, SLOW, fade, rise } from '../theme';

/**
 * Merged ch.09 (was AllGather/All-to-All + Cost): one question, "how long?".
 *  0–359   T ≈ α + S/B — the α segment and the S/B segment build as a timing bar;
 *          tiny message = α-bound, 10 GB message = S/B-bound.
 *  360–779 AllReduce worked example (the old styleframe ring) — 11 / 22 / 400 ms race bars.
 *  780–1199 AllGather spotlight: shards fly together, then 9.86 GB in, algBW vs busBW,
 *          then a two-lane race with live ms counters (≈11 vs ≈197).
 *  1200–1619 All-to-All spotlight: blocks re-sort by recipient, same ideal race,
 *          then the uneven-MoE caveat: the busiest card sets the time.
 *  1620–1919 Summary table for the three collectives.
 */
const COLORS = ['#f4b781', '#43e0b5', '#8fb4ff', '#e58aa8', '#d9c76a', '#9be38a', '#c39bf0', '#6fd3e8'];
const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

export const CommTimeShot: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage chapter="09" name="通信需要多久" tag="理想值 · 只算带宽项">
      {frame < 360 ? <Formula f={frame} /> : frame < 780 ? <AllReduceEx f={frame - 360} /> : frame < 1200 ? <GatherSpot f={frame - 780} /> : frame < 1620 ? <AllToAllSpot f={frame - 1200} /> : <Summary f={frame - 1620} />}
    </Stage>
  );
};

/* ---------- 1 · formula ---------- */
const Formula: React.FC<{ f: number }> = ({ f }) => {
  const alphaW = rise(f, 90, 26);
  const dataW = rise(f, 130, 90);
  return (
    <div style={{ position: 'absolute', left: 140, top: 190, width: 1640 }}>
      <div style={{ fontFamily: MONO, fontSize: 92, fontWeight: 700, opacity: fade(f, 6, 20) }}>
        T ≈ <span style={{ color: SLOW }}>α</span> <span style={{ color: INK2 }}>+</span> <span style={{ color: COPPER_HI }}>S / B</span>
      </div>
      <div style={{ marginTop: 14, fontSize: 36, color: INK2, opacity: fade(f, 30, 18) }}>
        <span style={{ fontFamily: MONO, color: INK }}>α</span> 固定延迟（发一次就要付，和大小无关） · <span style={{ fontFamily: MONO, color: INK }}>S</span> 要搬的字节 · <span style={{ fontFamily: MONO, color: INK }}>B</span> 链路带宽
      </div>
      {/* timing bar: grey α stub + copper S/B body */}
      <div style={{ marginTop: 54, display: 'flex', height: 44, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', opacity: fade(f, 80, 16) }}>
        <div style={{ width: `${7 * alphaW}%`, background: SLOW }} />
        <div style={{ width: `${93 * dataW}%`, background: `linear-gradient(90deg, ${COPPER}, ${COPPER_HI})` }} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', fontSize: 32, color: INK2, opacity: fade(f, 150, 16) }}>
        <div style={{ width: '7%' }}>α</div>
        <div>S / B：数据越大，这段越长</div>
      </div>
      <div style={{ marginTop: 46, display: 'flex', gap: 36 }}>
        <CaseCard hot={false} title="发 1 KB 小消息" body="S/B 小到可忽略，时间几乎全是 α。拼的是延迟，带宽再大也没用。" opacity={fade(f, 210, 18)} />
        <CaseCard hot title="搬 10 GB 大块" body="α 被摊没，时间 ≈ S/B。拼的是带宽，后面算的全是这种账。" opacity={fade(f, 240, 18)} />
      </div>
    </div>
  );
};

const CaseCard: React.FC<{ hot: boolean; title: string; body: string; opacity: number }> = ({ hot, title, body, opacity }) => (
  <div style={{ flex: 1, padding: '28px 32px', borderRadius: 18, border: `1.5px solid ${hot ? COPPER_HI : '#2a3138'}`, background: hot ? '#1d140e' : '#12161b', opacity }}>
    <div style={{ fontSize: 40, fontWeight: 700, color: hot ? COPPER_HI : INK }}>{title}</div>
    <div style={{ marginTop: 10, fontSize: 32, lineHeight: 1.45, color: INK2 }}>{body}</div>
  </div>
);

/* ---------- 2 · AllReduce worked example (ring, kept from the styleframe) ---------- */
const CX = 430, CY = 520, R = 180;
const AllReduceEx: React.FC<{ f: number }> = ({ f }) => (
  <>
    <div style={{ position: 'absolute', left: 130, top: 150, opacity: fade(f, 4, 18) }}>
      <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700 }}>先拿 AllReduce 算一笔</div>
      <div style={{ marginTop: 6, fontSize: 32, color: INK2 }}>10 GB 梯度 · 72 卡 · Ring 要走两遍（ReduceScatter + AllGather）</div>
    </div>
    <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: fade(f, 4, 18) }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={COPPER} strokeWidth={2} opacity={0.35} strokeDasharray="4 10" />
      {Array.from({ length: 8 }, (_, i) => {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / 8, a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / 8, pad = 0.22;
        const travel = rise(f, 30 + i * 10, 70);
        const am = a0 + pad + ((a0 + a1) / 2 - a0 - pad) * travel;
        return (
          <g key={i}>
            <path d={`M${CX + R * Math.cos(a0 + pad)} ${CY + R * Math.sin(a0 + pad)} A ${R} ${R} 0 0 1 ${CX + R * Math.cos(a1 - pad)} ${CY + R * Math.sin(a1 - pad)}`} fill="none" stroke={SIGNAL} strokeWidth={3} opacity={0.85} />
            <rect x={CX + R * Math.cos(am) - 13} y={CY + R * Math.sin(am) - 13} width={26} height={26} rx={5} fill={COLORS[i]} />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 8, x = CX + R * Math.cos(a), y = CY + R * Math.sin(a);
        return (
          <g key={i}>
            <rect x={x - 44} y={y - 44} width={88} height={88} rx={14} fill="#1d140e" stroke={COPPER_HI} strokeWidth={2.2} />
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x={x - 32 + (k % 4) * 17} y={y - 28 + Math.floor(k / 4) * 21} width={13} height={15} rx={2} fill={(k + 8 - i) % 8 < 3 ? COLORS[k] : '#2b1c12'} />
            ))}
            <text x={x} y={y + 32} textAnchor="middle" fill={INK2} fontFamily={MONO} fontSize={30}>GPU{i}</text>
          </g>
        );
      })}
    </svg>
    <div style={{ position: 'absolute', left: 130, top: 790, fontSize: 36, color: INK2, opacity: fade(f, 60, 18) }}>
      每卡收发 ≈ <span style={{ fontFamily: MONO, color: INK }}>2(N−1)/N × S</span> ≈ <Num size={40} color={COPPER_HI}>19.7 GB</Num>
    </div>
    <div style={{ position: 'absolute', left: 900, top: 260, width: 880 }}>
      <RaceRow label="交换机内归约 SHARP · 900 GB/s" ms={11} color={SIGNAL} t={rise(f, 150, 36)} msColor={SIGNAL} />
      <RaceRow label="Ring 两遍 · 900 GB/s" ms={22} color={COPPER_HI} t={rise(f, 180, 60)} />
      <RaceRow label="若全走 400G 网络 · 50 GB/s" ms={400} color={SLOW} t={rise(f, 210, 170)} striped />
      <div style={{ marginTop: 10, fontSize: 32, color: INK3, opacity: fade(f, 320, 18) }}>省掉第二遍，就是 SHARP 的 11 ms —— 和下面 AllGather 的 11 ms 不是一回事。</div>
    </div>
  </>
);

/* ---------- race row with live counter ---------- */
export const RaceRow: React.FC<{ label: string; ms: number; color: string; t: number; striped?: boolean; msColor?: string }> = ({ label, ms, color, t, striped, msColor }) => {
  const shown = Math.round(ms * t);
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 36 }}>{label}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: msColor ?? color }}>{shown} <span style={{ fontSize: 32 }}>ms</span></div>
      </div>
      <div style={{ marginTop: 10, height: 20, borderRadius: 10, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{ width: `${Math.max(1.5, (ms / 400) * t * 100)}%`, height: '100%', borderRadius: 10, background: striped ? `repeating-linear-gradient(90deg, ${SLOW} 0 14px, #3a4148 14px 20px)` : color }} />
        <div style={{ position: 'absolute', left: `calc(${Math.max(1.5, (ms / 400) * t * 100)}% - 13px)`, top: -3, width: 26, height: 26, borderRadius: 6, background: color, opacity: t > 0 && t < 1 ? 1 : 0 }} />
      </div>
    </div>
  );
};

/* ---------- 3 · AllGather spotlight ---------- */
const GatherSpot: React.FC<{ f: number }> = ({ f }) => {
  const acct = fade(f, 190, 20);
  return (
    <div style={{ position: 'absolute', left: 120, top: 165, width: 1680 }}>
      <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 700, color: COPPER_HI, opacity: fade(f, 4, 16) }}>重点一 · AllGather</div>
      {/* 8 GPUs: own shard flies to everyone, slots fill on arrival */}
      <svg width="1680" height="240" style={{ marginTop: 18 }}>
        {Array.from({ length: 8 }, (_, s) =>
          Array.from({ length: 8 }, (_, d) => {
            if (d === s) return null;
            const t = rise(f, 24 + (s * 8 + d) * 1.6, 24);
            if (t <= 0 || t >= 1) return null;
            const x = 105 + s * 196 + (105 + d * 196 - (105 + s * 196)) * t;
            const y = 70 - Math.sin(t * Math.PI) * 34;
            return <rect key={`${s}${d}`} x={x - 10} y={y} width={20} height={20} rx={4} fill={COLORS[s]} />;
          }),
        )}
        {Array.from({ length: 8 }, (_, g) => (
          <g key={g}>
            <rect x={105 + g * 196 - 82} y={92} width={164} height={104} rx={14} fill="#1d140e" stroke={COPPER} strokeWidth={2} />
            {Array.from({ length: 8 }, (_, k) => {
              const filled = k === g || rise(f, 24 + (k * 8 + g) * 1.6, 24) > 0.92;
              return <rect key={k} x={105 + g * 196 - 62 + k * 20} y={112} width={16} height={26} rx={3} fill={filled ? COLORS[k] : '#2b1c12'} />;
            })}
            <text x={105 + g * 196} y={172} textAnchor="middle" fill={INK2} fontFamily={MONO} fontSize={30}>GPU{g}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 36, opacity: acct }}>
        <div style={{ flex: 1.15 }}>
          <AcctLine k="每卡收进" v="(71/72) × 10 GB ≈ 9.86 GB" delay={0} f={f} />
          <AcctLine k="algBW = S / t" v="算法口径：完整 10 GB 除以耗时" delay={26} f={f} />
          <AcctLine k="busBW = algBW × 71/72" v="链路口径：真正压在 NVLink 上的速度" delay={52} f={f} hot />
        </div>
        <div style={{ flex: 1 }}>
          <RaceRow label="柜内 NVLink 900 GB/s" ms={11} color={COPPER_HI} t={rise(f, 250, 40)} />
          <RaceRow label="出域 400G · 50 GB/s" ms={197} color={SLOW} t={rise(f, 270, 130)} striped />
          <div style={{ fontSize: 32, color: INK3 }}>条长按 400 ms 对齐；柜内那条快到几乎看不见 —— 这就是 18 倍。</div>
        </div>
      </div>
    </div>
  );
};

const AcctLine: React.FC<{ k: string; v: string; delay: number; f: number; hot?: boolean }> = ({ k, v, delay, f, hot }) => (
  <div style={{ marginBottom: 22, opacity: fade(f, 190 + delay, 16) }}>
    <div style={{ fontFamily: MONO, fontSize: 38, fontWeight: 700, color: hot ? SIGNAL : COPPER_HI }}>{k}</div>
    <div style={{ marginTop: 4, fontSize: 32, color: INK2 }}>{v}</div>
  </div>
);

/* ---------- 4 · All-to-All spotlight ---------- */
const AllToAllSpot: React.FC<{ f: number }> = ({ f }) => {
  const uneven = fade(f, 300, 20);
  return (
    <div style={{ position: 'absolute', left: 120, top: 165, width: 1680 }}>
      <div style={{ fontFamily: MONO, fontSize: 52, fontWeight: 700, color: '#e58aa8', opacity: fade(f, 4, 16) }}>重点二 · All-to-All</div>
      <div style={{ marginTop: 8, fontSize: 36, color: INK2, opacity: fade(f, 4, 16) }}>每卡给每卡一块不同的 —— 飞行块按「收件人」重新分堆（颜色 = 发送方）</div>
      <svg width="1680" height="250" style={{ marginTop: 14 }}>
        {Array.from({ length: 5 }, (_, s) =>
          Array.from({ length: 5 }, (_, d) => {
            if (d === s) return null;
            const t = rise(f, 22 + (s * 5 + d) * 2.4, 26);
            if (t <= 0 || t >= 1) return null;
            const x = 190 + s * 320 + (190 + d * 320 - (190 + s * 320)) * t;
            return <rect key={`${s}${d}`} x={x - 12} y={66 - Math.sin(t * Math.PI) * 36} width={24} height={24} rx={5} fill={COLORS[s]} stroke="#0a0c0e" strokeWidth={2} />;
          }),
        )}
        {Array.from({ length: 5 }, (_, g) => (
          <g key={g}>
            <rect x={190 + g * 320 - 105} y={96} width={210} height={112} rx={14} fill="#1d140e" stroke={COPPER} strokeWidth={2} />
            {Array.from({ length: 5 }, (_, k) => {
              const filled = k === g || rise(f, 22 + (k * 5 + g) * 2.4, 26) > 0.92;
              return <rect key={k} x={190 + g * 320 - 72 + k * 30} y={116} width={24} height={30} rx={3} fill={filled ? COLORS[k] : '#2b1c12'} />;
            })}
            <text x={190 + g * 320} y={184} textAnchor="middle" fill={INK2} fontFamily={MONO} fontSize={30}>GPU{g}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 36 }}>
        <div style={{ flex: 1.15, opacity: fade(f, 170, 18) }}>
          <div style={{ fontSize: 36, lineHeight: 1.5, color: INK }}>
            等量交换时，账和 AllGather 一样：每卡收进 <Num size={40} color={COPPER_HI}>9.86 GB</Num>，理想耗时同样 <Num size={40} color={COPPER_HI}>11 ms</Num> 对 <Num size={40} color={SLOW}>197 ms</Num>。
          </div>
          <div style={{ marginTop: 14, fontSize: 32, color: INK2 }}>所以 MoE 的专家交换拼命想留在柜内。</div>
        </div>
        <div style={{ flex: 1, opacity: uneven }}>
          <div style={{ fontSize: 32, color: INK2, marginBottom: 14 }}>但真实路由不均：热门专家那张卡收得最多</div>
          {[0.45, 0.7, 1].map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div style={{ width: 120, fontFamily: MONO, fontSize: 32, color: INK2 }}>卡 {['A', 'B', 'C'][i]}</div>
              <div style={{ flex: 1, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ width: `${w * rise(f, 310 + i * 14, 40) * 100}%`, height: '100%', borderRadius: 8, background: i === 2 ? '#e58aa8' : SLOW }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 32, color: '#e58aa8' }}>整组等最忙的那张卡 —— algBW 会被它拉低</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- 5 · summary ---------- */
const ROWS = [
  { name: 'AllGather', move: '(N−1)/N × S', bus: '× (N−1)/N', inMs: '≈11 ms', outMs: '≈197 ms', hot: false },
  { name: 'All-to-All', move: '(N−1)/N × S（等量）', bus: '× (N−1)/N', inMs: '≈11 ms', outMs: '≈197 ms', hot: false },
  { name: 'AllReduce', move: '2(N−1)/N × S', bus: '× 2(N−1)/N', inMs: '≈22 ms（SHARP 11）', outMs: '≈400 ms', hot: true },
];
const Summary: React.FC<{ f: number }> = ({ f }) => {
  const cols = '1fr 1.35fr 1.1fr 1.25fr 1fr';
  return (
    <div style={{ position: 'absolute', left: 96, right: 96, top: 230 }}>
      <div style={{ fontSize: 44, fontWeight: 700, opacity: fade(f, 2, 16) }}>同样 10 GB、72 卡，先看系数，再看带宽</div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '26px 28px 14px', fontSize: 32, color: INK2, opacity: fade(f, 10, 14) }}>
        <div>集合通信</div><div>每卡搬运</div><div>busBW 系数</div><div>柜内耗时</div><div>出域耗时</div>
      </div>
      {ROWS.map((r, i) => {
        const t = rise(f, 24 + i * 30, 22);
        return (
          <div key={r.name} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '20px 28px', marginBottom: 12, borderRadius: 14, background: r.hot ? '#24180f' : '#12161b', border: `1.5px solid ${r.hot ? COPPER_HI : '#242b33'}`, opacity: t, transform: `translateY(${(1 - t) * 10}px)`, fontSize: 36 }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, color: r.hot ? COPPER_HI : INK }}>{r.name}</div>
            <div style={{ fontFamily: MONO, color: INK2 }}>{r.move}</div>
            <div style={{ fontFamily: MONO, color: INK2 }}>{r.bus}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, color: SIGNAL }}>{r.inMs}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, color: SLOW }}>{r.outMs}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 22, fontSize: 36, color: INK, opacity: fade(f, 130, 18) }}>
        记账顺序：<span style={{ color: COPPER_HI, fontWeight: 700 }}>系数决定每卡搬多少 → busBW 对齐链路 → S/B 出耗时</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 32, color: INK3, opacity: fade(f, 150, 18) }}>只算带宽项，不含 α 和软件栈；All-to-All 按等量交换，真实路由看最忙的卡。</div>
    </div>
  );
};

void interpolate;
