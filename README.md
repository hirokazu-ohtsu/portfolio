# portfolio

Webマーケ×データ計測のポートフォリオサイトと、実務で使える無料ツール集。
Astro + Tailwind CSS で作り、Cloudflare Pages で公開する。

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `npm install` | 依存パッケージを入れる |
| `npm run dev` | 開発サーバー（http://localhost:4321） |
| `npm test` | ツールのロジックのテスト（Vitest） |
| `npm run build` | 本番ビルド（`dist/` に出力） |

## 構成

```
src/
  site.ts              サイト名・SNSリンクなどの共通設定
  tools.ts             無料ツールの一覧（ホームと /tools/ に表示）
  layouts/BaseLayout.astro  共通ヘッダー・フッター・メタタグ
  lib/utm.ts           UTMビルダーのロジック（DOMに依存しない）
  pages/
    index.astro        ホーム
    tools/index.astro  ツール一覧
    tools/utm-builder.astro  UTMビルダー
tests/                 Vitest のテスト
```

## Cloudflare Pages の設定

- フレームワーク: Astro
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- 環境変数: `NODE_VERSION=22`（`.node-version` でも指定済み）
