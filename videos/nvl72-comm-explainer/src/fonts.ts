import { getRemotionEnvironment, staticFile } from 'remotion';

// Headless render uses the same families as installed system fonts, so it does not
// wait on FontFace. Waiting here aborts the render: one page keeps the delayRender
// timer alive while frames are already being captured.
// The workbench and studio load the files shipped in public/fonts.
const faces: Array<[string, string, string]> = [
  ['Noto Sans SC', staticFile('fonts/NotoSansSC-400.ttf'), '400'],
  ['Noto Sans SC', staticFile('fonts/NotoSansSC-500.ttf'), '500'],
  ['Noto Sans SC', staticFile('fonts/NotoSansSC-700.ttf'), '700'],
  ['Noto Sans SC', staticFile('fonts/NotoSansSC-900.ttf'), '900'],
  ['JetBrains Mono', staticFile('fonts/JetBrainsMono-Regular.ttf'), '400'],
  ['JetBrains Mono', staticFile('fonts/JetBrainsMono-Bold.ttf'), '700'],
];

if (typeof document !== 'undefined' && !getRemotionEnvironment().isRendering) {
  const style = document.createElement('style');
  style.textContent = faces
    .map(
      ([family, url, weight]) =>
        `@font-face{font-family:"${family}";src:url("${url}") format("truetype");font-weight:${weight};font-style:normal;font-display:swap;}`,
    )
    .join('\n');
  document.head.appendChild(style);
}
