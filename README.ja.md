# LyricEx · 歌词鉴赏

[![CI](https://github.com/Rinkio-Lab/LyricEx/actions/workflows/ci.yml/badge.svg)](https://github.com/Rinkio-Lab/LyricEx/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ランタイム依存ゼロ](https://img.shields.io/badge/runtime%20deps-0-brightgreen.svg)](package.json)

[English](README.md) · [中文](README.zh-CN.md)

日本語の歌詞を学ぶための純フロントエンドツール。歌詞パック（`.zip` / `.lrc`）をアップロードすると、**歌詞 / 学習 / ミックス / 編集** の 4 つのビューで、カラオケのワードタイミング、漢字のふりがな、単語ごとの解析、タイムライン編集、書き出しができます。**ランタイム依存ゼロ**（フォント / Font Awesome / JSZip は `vendor/` に同梱）— `index.html` をダブルクリックするだけで動きます。

**方法 1：Python**

```bash
python -m http.server 8090
```

**方法 2：npx**

```bash
npx serve .
```

**方法 3：Node（依存なし・クロスプラットフォーム）**

```bash
node scripts/serve.mjs
```

## スクリーンショット

| 歌詞ビュー | 学習ビュー（単語ごとの解析） |
|---|---|
| ![歌詞ビュー](assets/images/shots/lyrics.png) | ![学習ビュー](assets/images/shots/study.png) |

| ミックスビュー（歌詞+学習） | エディター / パック作成ワークスペース |
|---|---|
| ![ミックスビュー](assets/images/shots/mixed.png) | ![編集ワークスペース](assets/images/shots/build.png) |

## 機能

- **4 つのビュー** — 歌詞（追いかけ歌い）、学習（単語テーブル：ローマ字 / ひらがな / 漢字 / 品詞 / 意味）、ミックス（両方同時）、編集（タイムライン + 書き出し）。
- **単語ごとのカラオケ** — パックに含まれる単語タイミングに合わせてハイライト（エディターで拡張 `.lrc` `<mm:ss.xx>` / ASS `\k` をインポート可）。
- **AI 単語解析** — パック作成時にプロンプトを任意の LLM にコピーし、JSON を貼り付けて戻すだけ。厳密なバリデーションで歌詞行にマッチ。API キー不要・完全静的。
- **パック作成ワークスペース**（v2.6.0）— ボーカル音声は必須・カラオケ音源は任意。LRC を貼り付け / アップロード（日中の交互 LRC は自動で原文+訳に分割）；网易云 JSON にも対応。v2.1 パックを書き出し。
- **シネマ / ミニモード**、ループ / AB リピート、速度と移調、スペクトラム、共有カード、設定バックアップ（JSON インポート / エクスポート）。
- **PWA** — http(s) で配信するとインストール＆オフライン利用可能。

## クイックスタート

1. リポジトリをクローンまたはダウンロードし、`index.html` を開く（`file://` で可）。
2. PWA インストールには HTTP 配信：`python -m http.server 8090` → `http://localhost:8090` を開く。
3. `.zip` パックまたは `.lrc` を左パネルにドロップ、またはメニューからアップロード。

パック作成（v2.6.0+）：**編集**ビュー → **パック作成** tab → 音声を追加（ボーカル必須・カラオケ任意）→ LRC を貼り付け / アップロード → 任意で AI 解析 → **パックを書き出し**。書き出された `.lxp.zip` は標準の LyricEx v2 パック（v2.0 互換）。

## 開発

```bash
npm test                # 全量セルフチェック：lib + utils + 起動スモーク + i18n + 言語切替
npm run lint            # ESLint 9（flat config、安全ルールのみ）
npm run test:cov        # c8 カバレッジ
npm run e2e             # Playwright 実ブラウザスモーク + axe アクセシビリティ（初回は npm run e2e:install）
npm run release-check   # CACHE/changelog 整合 + サイズレポート + 全テスト
```

プロジェクト構成（要約）：

```text
LyricEx/
├── assets/
│   ├── images/shots/     # README スクリーンショット（scripts/readme-shots.mjs で再生成）
│   ├── locales/          # i18n 辞書（zh/ja/en は AI 管理；ユーザー言語は en→zh へフォールバック）
│   ├── scripts/
│   │   ├── app.js        # コア状態 + 起動
│   │   ├── lib.js        # 純関数（LRC 解析、設定、パック形式）
│   │   ├── ui/           # ビューモジュール（editor、workspace、settings…）
│   │   ├── utils/        # 純関数（netease、ai-import、lyric-package…）
│   │   └── modules/      # オーディオグラフ、動画書き出し、最近開いた…
│   └── styles/
├── examples/             # デモ歌詞パック（自由に追加/削除可）
├── scripts/              # 開発ツール（serve、release-check、readme-shots）
├── tests/                # Node セルフチェック + Playwright e2e
└── vendor/               # 同梱サードパーティ（フォント、Font Awesome、JSZip）— CDN 不使用
```

パック形式は [FORMAT.md](FORMAT.md)、リリースノートは [CHANGELOG.md](CHANGELOG.md) を参照。

## ライセンス

MIT — [LICENSE](LICENSE) を参照。本ツールはローカルで提供された音声のみを再生し、メディアを保存・ホストしません。
