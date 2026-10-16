// 把 Google Fonts 下载到项目内自托管。
// 国内服务器无法访问 Google Fonts，next/font/google 在构建时会失败，所以字体文件随仓库提交。
// 用法：node scripts/fetch-fonts.mjs（只需在能访问 Google 的环境运行一次）
import fs from 'node:fs/promises';
import path from 'node:path';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const LOCAL_DIR = 'src/app/fonts';
const CJK_DIR = 'public/fonts/noto-serif-sc';
const CJK_CSS = 'src/app/fonts/noto-serif-sc.css';

async function css(query) {
  const res = await fetch(`https://fonts.googleapis.com/css2?${query}&display=swap`, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`CSS ${res.status}`);
  return res.text();
}

/** 解析 @font-face 块：{ subset, style, weight, url, range } */
function faces(text) {
  const out = [];
  const re = /(?:\/\*\s*([\w\-\[\]\d]+)\s*\*\/\s*)?@font-face\s*{([^}]*)}/g;
  let m;
  while ((m = re.exec(text))) {
    const body = m[2];
    out.push({
      subset: m[1] ?? '',
      style: body.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal',
      weight: body.match(/font-weight:\s*([\d ]+);/)?.[1].trim() ?? '400',
      url: body.match(/url\(([^)]+)\)/)?.[1],
      range: body.match(/unicode-range:\s*([^;]+);/)?.[1].trim(),
    });
  }
  return out;
}

async function download(url, file) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  // 拉丁字体：只取 latin 子集，交给 next/font/local
  const inter = faces(await css('family=Inter+Tight:wght@100..900')).find((f) => f.subset === 'latin');
  await download(inter.url, `${LOCAL_DIR}/InterTight-Latin.woff2`);
  const inst = faces(await css('family=Instrument+Serif:ital@0;1')).filter((f) => f.subset === 'latin');
  await download(inst.find((f) => f.style === 'normal').url, `${LOCAL_DIR}/InstrumentSerif-Latin.woff2`);
  await download(inst.find((f) => f.style === 'italic').url, `${LOCAL_DIR}/InstrumentSerif-Italic-Latin.woff2`);

  // 中文衬线：按 Google 的 unicode-range 分片自托管，浏览器只下载用到的分片
  const cjk = faces(await css('family=Noto+Serif+SC:wght@700'));
  await fs.rm(CJK_DIR, { recursive: true, force: true });
  const rules = [];
  for (const [i, f] of cjk.entries()) {
    const name = `${String(i).padStart(3, '0')}.woff2`;
    await download(f.url, `${CJK_DIR}/${name}`);
    rules.push(
      `@font-face {\n  font-family: "Noto Serif SC";\n  font-style: normal;\n  font-weight: 700;\n  font-display: swap;\n  src: url("/fonts/noto-serif-sc/${name}") format("woff2");\n  unicode-range: ${f.range};\n}`,
    );
  }
  await fs.writeFile(CJK_CSS, `/* 由 scripts/fetch-fonts.mjs 生成，请勿手动修改 */\n${rules.join('\n')}\n`);
  console.log(`✓ 拉丁字体 3 个，Noto Serif SC 分片 ${cjk.length} 个`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
