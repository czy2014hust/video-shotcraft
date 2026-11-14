import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Stage } from '../gfx';
import { COPPER, COPPER_HI, INK, INK2, SIGNAL, fade, rise } from '../theme';

export const InferShot: React.FC = () => {
  const frame = useCurrentFrame();
  const left = fade(frame, 10, 22);
  const right = fade(frame, 90, 22);
  const fly = rise(frame, 120, 80);
  const note = fade(frame, 180, 20);

  return (
    <Stage chapter="12" name="推理看延迟" tag="decode / KV">
      <Card x={96} y={180} opacity={left} kicker="DECODE" title="逐 token 解码" body={'每生成一个 token，张量并行都要做一次很小的 AllReduce。\n数据不大，时间几乎全是固定延迟。'} accent={SIGNAL} />
      <Card x={1000} y={180} opacity={right} kicker="PREFILL → DECODE" title="KV Cache 要搬走" body={'预填充和解码拆开时，缓存要跨卡搬一次。\n这一下看的是带宽，不是延迟。'} accent={COPPER_HI} />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={872} y1={360} x2={984} y2={360} stroke={COPPER} strokeWidth={2} opacity={right} />
        <rect x={878 + fly * 70} y={346} width={26} height={26} rx={5} fill={COPPER_HI} opacity={right} />
      </svg>
      <div style={{ position: 'absolute', left: 96, right: 96, top: 700, fontSize: 40, fontWeight: 500, opacity: note }}>
        MoE 的专家交换就是前面算过的 All-to-All。账看 busBW，留在柜内。
      </div>
    </Stage>
  );
};

const Card: React.FC<{
  x: number;
  y: number;
  opacity: number;
  kicker: string;
  title: string;
  body: string;
  accent: string;
}> = ({ x, y, opacity, kicker, title, body, accent }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 760,
      minHeight: 280,
      padding: '32px 36px',
      borderRadius: 18,
      background: '#12161b',
      border: `1.5px solid ${accent}`,
      opacity,
    }}
  >
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: accent, letterSpacing: '0.08em' }}>{kicker}</div>
    <div style={{ marginTop: 12, fontSize: 48, fontWeight: 700, color: INK }}>{title}</div>
    <div style={{ marginTop: 16, fontSize: 32, lineHeight: 1.45, color: INK2, whiteSpace: 'pre-line' }}>{body}</div>
  </div>
);
