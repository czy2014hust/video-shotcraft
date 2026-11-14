import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BG, CN, COPPER, COPPER_HI, EASE, INK, INK2, INK3, MONO } from './theme';

const GRID = 'rgba(220, 230, 240, 0.045)';

export const Stage: React.FC<{
  chapter: string;
  name: string;
  tag?: string;
  children: React.ReactNode;
}> = ({ chapter, name, tag, children }) => (
  <AbsoluteFill style={{ background: BG, fontFamily: CN, color: INK, overflow: 'hidden' }}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${GRID} 1px, transparent 1px), linear-gradient(90deg, ${GRID} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, #000 42%, transparent 96%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, #000 42%, transparent 96%)',
      }}
    />
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.58) 100%)',
        pointerEvents: 'none',
      }}
    />
    <AbsoluteFill>{children}</AbsoluteFill>
    <div
      style={{
        position: 'absolute',
        left: 80,
        top: 48,
        display: 'flex',
        alignItems: 'baseline',
        gap: 16,
      }}
    >
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: COPPER }}>{chapter}</span>
      <span style={{ fontSize: 32, fontWeight: 500, color: INK2, letterSpacing: '0.04em' }}>{name}</span>
    </div>
    {tag ? (
      <div
        style={{
          position: 'absolute',
          right: 80,
          top: 54,
          fontFamily: MONO,
          fontSize: 32,
          letterSpacing: '0.08em',
          color: INK3,
        }}
      >
        {tag}
      </div>
    ) : null}
  </AbsoluteFill>
);

export const CAPTION_DEFAULTS = {
  text: '',
  fontSize: 56,
};

/** Bottom narration line. `**word**` is copper; newlines are honored. */
export const Caption: React.FC<{ text?: string; duration: number; fontSize?: number }> = ({
  text = CAPTION_DEFAULTS.text,
  duration,
  fontSize = CAPTION_DEFAULTS.fontSize,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  const exit = interpolate(frame, [Math.max(8, duration - 10), duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lines = text.split('\n');
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: enter * exit }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 210,
          background: 'linear-gradient(to top, rgba(6,8,10,0.94) 32%, transparent)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 100px 52px',
        }}
      >
        <div
          style={{
            fontFamily: CN,
            fontSize,
            fontWeight: 500,
            lineHeight: 1.28,
            textAlign: 'center',
            color: INK,
          }}
        >
          {lines.map((line, index) => (
            <div key={index}>
              <Rich text={line} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Rich: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('**') ? (
          <span key={index} style={{ color: COPPER_HI, fontWeight: 700 }}>
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

export const Num: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color = INK,
  size = 48,
}) => (
  <span style={{ fontFamily: MONO, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color, fontSize: size }}>
    {children}
  </span>
);
