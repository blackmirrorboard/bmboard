# Designer

**Role:** 1bit 美学の実装・ハイコントラストの維持・走査線とフィルムグレインの表現
**Doc version:** v1.0 (2026-04-16)

---

## v1.0 — 3-mode color system

Black Mirror は v1.0 で単色主義から **3モードのテーマシステム** に進化した。
色を増やしたのではなく、「1bit の美学 × 3 種の光源」として成立させている。

| Mode | Ground | Ink | 意図 |
|------|--------|-----|------|
| light | `#FAFAF8` 紙色 | `#0c0c0c` 墨 | デフォルト・冷白を避けた紙の暖かさ |
| dark  | `#000000` 純黒 | `#F0EDE6` リン光 | 完全な夜。映写機の残像。 |
| gray  | `#DCDBD5` 小石色 | `#1600A2` コバルト | Studio 環境。唯一の有彩色で集中を導く |

gray モードの cobalt `#1600A2` は、**モノクロ美学を崩さないための「許可された一色」**。
ライトでもダークでもなく、Kinoshita Studio の最も日常的な作業空間として設計された。

---

## ビジュアル原則

### 1. The 1-bit Principle
色は使わない。グレーも最小限。全ての情報は白/黒の二値で伝える。

| 要素 | カラー | 理由 |
|------|--------|------|
| Canvas 背景 | `#FAFAF8` | 冷白は使わない。紙の温かさ |
| Terminal 背景 | `#080808` | 完全な黒は重すぎる |
| Terminal テキスト | `#F5F2EC` | 純白は目に刺さる。リン光の残像 |
| Dim テキスト | `#707070` | ノイズと信号の区別 |
| Snap ring | `#3af` | 唯一の有彩色。完了直前のシグナル |
| LINE off icon | `#e03` (diagonal) | 禁止・除去の国際的記号 |

### 2. Scanline Texture
走査線は CRT モニターへの参照。デジタルに「物理性」を与える。

```css
background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(255,255,255,0.014) 3px,
    rgba(255,255,255,0.014) 4px
);
```

不透明度は `0.01〜0.02` が適正。それ以上は「汚い」、それ以下は「意味がない」。

### 3. Film Grain
フィルムグレインは SVG `<feTurbulence>` フィルターで実装。Canvas への直接適用は GPU コストが高いため CSS 疑似要素で代替。

### 4. Grid Overlay
Canvas にはサブピクセルグリッドを配置。デザイナーが「設計図を描いている」感覚を補強する。

```css
background-image:
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
background-size: 32px 32px;
```

---

## タイポグラフィ

- **メイン**: `Courier New` — 機能的・クラシック・端末の文脈
- **フォールバック**: `monospace`
- **サイズ**: 11〜13px — 情報密度を保ちながら可読性を確保
- **Letter-spacing**: ヘッダーは `0.15〜0.22em`。本文は default

---

## グリッチ演出

```css
@keyframes glitch {
    0%, 96% { transform: translateX(0); }
    97%      { transform: translateX(-3px); }
    98%      { transform: translateX(3px); }
    99%      { transform: translateX(-1px); }
    100%     { transform: translateX(0); }
}
```

周期は `8〜12s` に 1 回。常時動くと「飽き」が生まれる。  
レアイベントにすることで「見た人だけが気づく」演出になる。

---

## v0.9 追加コンポーネントの設計

### ロゴボタン（`#logoBtn`）
- `logo.png` を `24px` 高さで表示。画像読み込み失敗時はテキストフォールバック
- `cursor: pointer` のみ。ホバーエフェクトは最小限（opacity 0.8）
- Feedback モーダルのトリガー。ブランドの玄関口として機能する

### Feedback モーダル
- オーバーレイ: `rgba(8,8,8,0.85)` — ターミナル背景色の延長
- モーダル本体: `border: 1px solid #242424` — UI クロムと同一のライン規則
- メールボタン: `background: #F2EFE8; color: #080808` — 唯一のインバート要素。アクションの重さを示す
- Instagram リンク: モーダル下部に小さく配置。SVG アイコン + `@tkinoshita99`

### LINE セクション（ポップオーバー内）
```
□  アウトラインあり   ← 通常の矩形アイコン
□  アウトラインなし   ← 同じ矩形 + 赤斜線（#e03, stroke-width: 2, linecap: round）
```
赤斜線は `<line x1="2" y1="10" x2="10" y2="2">` — 右上から左下へ。「禁止」の視覚文法。

### Pen スナップリング
- Canvas 上に描画。色: `rgba(51,170,255,0.7)`, 線幅: `1.5px`
- 半径: 約 `snapPx × 0.6` — スナップ閾値より少し小さく、「もうすぐ」の感覚
- 表示は `S.penSnapClose === true` の間のみ。瞬間的な出現・消滅

### パネルリサイズハンドル（モバイル）
- デスクトップ: 縦線、水平ドラッグ
- モバイル: 横線、垂直ドラッグ
- アクティブ時: `background: rgba(242,239,232,0.15)` でハイライト
- アイコン: `⠿`（ブライユ点字の6点）— ドラッグ可能さを示す普遍的記号

---

## 形状ラベルのマイクロインタラクション

形状認識後: `opacity: 1` → `transition 1.5s` → `opacity: 0` でフェードアウト。  
存在を主張しすぎない。確認のためのサインであり、主役ではない。

---

## v0.9 で解決済みの懸念点

| 懸念 | 状態 |
|------|------|
| モバイルでの Canvas サイズがターミナルと競合する | 縦積みレイアウト + ドラッグリサイズで解決 |
| YouTube ASCII アートは等幅フォントでないと崩れる | Courier New で固定済み |
| グレインフィルターのパフォーマンスコスト | 静的疑似要素で代替済み |

---

## 次のアクション

- [ ] ダークキャンバスモードの検討（インバート：背景 `#080808`、線 `#F2EFE8`）
- [ ] ターミナル文字色の A/B（温白 `#F5F2EC` vs リン光グリーン `#00FF41`）
- [ ] グリッドサイズのバリエーション検討（16px / 32px / 48px）
- [ ] Export PNG 時のウォーターマーク設計（`kinoshita` ロゴの透かし、オプション）

---

*Draw to Build. — kinoshita studio / 2026*
