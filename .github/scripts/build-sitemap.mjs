#!/usr/bin/env node
/**
 * sitemap.xml と robots.txt を作る。
 *
 * ⚠️これまで BMBoard には sitemap も robots も無かった（llms.txt だけ）。
 *   ページが増えても検索側に伝わらないし、preview/ の実験ページを拾われる恐れもある。
 *
 * ⭐載せる頁はここの表が正。増やす時は1行足す。
 * ⚠️preview/ と app_backup_broken.html は載せない（実験・退避用）。
 * 最終更新日は git の最終コミット日を使う（手で日付を書かない＝嘘が入らない）。
 *
 * 使い方:
 *   node .github/scripts/build-sitemap.mjs          # 生成
 *   node .github/scripts/build-sitemap.mjs --check  # ズレていたら落とす（CI用）
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const CHECK = process.argv.includes('--check');
const SITE = 'https://bmboard.studio';

/* [パス, 重要度, 更新頻度] — ⚠️重要度は「サイト内での相対的な重さ」であって順位ではない */
const PAGES = [
  ['/',                  '1.0', 'weekly'],
  ['/app.html',          '0.9', 'weekly'],
  ['/usage.html',        '0.8', 'weekly'],
  ['/commands.html',     '0.8', 'weekly'],
  ['/store.html',        '0.8', 'weekly'],
  ['/spell-spec.html',   '0.7', 'monthly'],
  ['/story.html',        '0.6', 'monthly'],
  ['/dev-log.html',      '0.6', 'weekly'],
  ['/overview.html',     '0.4', 'monthly'],
  ['/browser/',          '0.5', 'monthly'],
];

/* ファイルの最終コミット日（無ければ今日ではなくファイルの更新日を使う） */
const lastmod = (urlPath) => {
  const file = urlPath === '/' ? 'index.html'
    : urlPath.endsWith('/') ? urlPath.slice(1) + 'index.html'
    : urlPath.slice(1);
  try {
    const d = execSync(`git log -1 --format=%cs -- "${file}"`, { cwd: ROOT }).toString().trim();
    if (d) return d;
  } catch (_) {}
  try { return new Date(fs.statSync(path.join(ROOT, file)).mtime).toISOString().slice(0, 10); }
  catch (_) { return null; }
};

const body = PAGES.map(([p, pri, freq]) => {
  const lm = lastmod(p);
  return `  <url>
    <loc>${SITE}${p}</loc>${lm ? `
    <lastmod>${lm}</lastmod>` : ''}
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- ⚠️自動生成（.github/scripts/build-sitemap.mjs）。手で書き換えないこと。
     ⚠️preview/ と app_backup_broken.html は意図的に載せていない（実験・退避用）。 -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const robots = `# ⚠️自動生成（.github/scripts/build-sitemap.mjs）
User-agent: *
Allow: /

# 実験用の頁は拾わせない（中身が本番と違うため）
Disallow: /preview/
Disallow: /app_backup_broken.html

Sitemap: ${SITE}/sitemap.xml
`;

const files = [['sitemap.xml', sitemap], ['robots.txt', robots]];

if (CHECK) {
  let bad = false;
  for (const [name, want] of files) {
    const cur = fs.existsSync(path.join(ROOT, name)) ? fs.readFileSync(path.join(ROOT, name), 'utf8') : '';
    if (cur !== want) { console.error(`${name} が生成物とズレています。`); bad = true; }
  }
  if (bad) { console.error('→ node .github/scripts/build-sitemap.mjs を実行してコミットしてください。'); process.exit(1); }
  console.log(`sitemap.xml / robots.txt OK（${PAGES.length}ページ）`);
} else {
  for (const [name, body2] of files) fs.writeFileSync(path.join(ROOT, name), body2);
  console.log(`sitemap.xml と robots.txt を生成しました（${PAGES.length}ページ）`);
}
