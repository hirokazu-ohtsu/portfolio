---
title: UTMの命名ルールでGA4の「Unassigned」を防ぐ｜LINEとXの落とし穴つき
description: utm_medium の表記ゆれや定義外の値で、GA4のチャネル別の数字は簡単に崩れます。現場で使っている命名ルールと、LINE・Xで起きやすい分類ミスを、GA4の判定ルールに沿って解説します。
pubDate: 2026-10-25
updatedDate: 2026-10-26
---

広告やSNSのリンクにUTMを付けているのに、GA4のチャネル別レポートで「Unassigned（未割り当て）」が増えていく。原因をたどると、ほとんどがUTMの付け方の問題です。

この記事では、実務でよく見る崩れ方と、それを防ぐための命名ルールをまとめます。後半では、LINE公式アカウントとXで特に間違えやすいポイントを、GA4の判定ルールに沿って説明します。

[![UTMつきURLの構造。utm_sourceは流入元、utm_mediumは流入の種類、utm_campaignはキャンペーン名](/images/blog/utm-naming-rules-ga4/utm-anatomy.svg)](/images/blog/utm-naming-rules-ga4/utm-anatomy.svg)

UTMを作るときは、GA4でどのチャネルに分類されるかをその場で確認できる無料ツール [UTMビルダー](/tools/utm-builder/) も使ってみてください。

## よくある崩れ方：担当者ごとに medium がバラバラ

同じSNS投稿なのに、担当者によって `utm_medium` が `social`、`Social`、`sns` とバラバラになっているケースは本当によくあります。

GA4は、これらを別々の値として集計します。レポート上では同じ「SNSからの流入」が3行に分かれ、合計を見るには毎回手で足し合わせることになります。

さらに問題なのが `sns` です。GA4のデフォルト チャネル グループには `sns` を拾うルールがありません。参照元によっては、この流入が **Unassigned** に入ってしまいます。そうなると、チャネル別の成果を正しく比べられなくなります。

## GA4はUTMをどうチャネルに振り分けるか

GA4は、`utm_source`・`utm_medium`・`utm_campaign` の値を、あらかじめ決められたルールに当てはめてチャネルを決めます。主なルールは次のとおりです（[Google公式のチャネル定義](https://support.google.com/analytics/answer/9756891)より抜粋）。

| チャネル | 条件（主なもの） |
|---|---|
| Paid Search（有料検索） | source が検索サイトの一覧にあり、medium が `cpc`・`ppc`・`paid〜` など |
| Paid Social（有料ソーシャル） | source がソーシャルサイトの一覧にあり、medium が `cpc`・`paid〜` など |
| Display（ディスプレイ） | medium が `display`・`banner`・`cpm` など |
| Paid Other（その他の有料） | medium は有料を示すが、source がどの一覧にもない |
| Organic Social（オーガニック ソーシャル） | source がソーシャルサイトの一覧にある、または medium が `social`・`sm` など |
| Email（メール） | source または medium が `email`・`e-mail` など |
| Unassigned（未割り当て） | どのルールにも当てはまらない |

ポイントは2つあります。

1. **「一覧」はGoogleが決めている。** 検索サイトやソーシャルサイトの一覧は、Googleが公開している参照元カテゴリの表で決まっています。自分で「これはSNSだ」と思っていても、一覧に無ければソーシャルとして扱われません。
2. **上から順に判定し、最初に当てはまったものに決まる。** 表の上にあるチャネルほど優先されます。たとえば Organic Social は Email より先に判定されます。

この2つが、次に紹介するLINEとXの落とし穴につながります。

## 落とし穴1：LINE配信を medium=email にしてもメールにならない

LINE公式アカウントのメッセージ配信は、メルマガと同じ「配信施策」としてまとめて分析したいことが多いはずです。そこで `utm_medium=email` を付けるのは自然な考え方です。

ところが、`utm_source=line` のままだと、狙いどおりにはなりません。

- Googleの参照元カテゴリ一覧（2026年10月時点）では、`line` は**ソーシャル**に分類されています
- GA4は Organic Social を Email より先に判定します
- そのため `utm_source=line&utm_medium=email` は **Organic Social** になります

[![source=lineはOrganic Socialで確定しEmailの判定まで進まない。source=line_oaならEmailになる](/images/blog/utm-naming-rules-ga4/line-channel-order.svg)](/images/blog/utm-naming-rules-ga4/line-channel-order.svg)

メールチャネルで集計したい場合は、source を一覧に無い値にします。

```text
utm_source=line_oa&utm_medium=email&utm_campaign=202610_autumn_sale
```

これで「メール」チャネルに入り、メルマガと並べて配信施策の成果を比べられます。

反対に、LINEをSNSの一つとして管理したい場合は `utm_source=line&utm_medium=social` で問題ありません。どちらにするかを社内で決めて、全員がそろえることが大切です。

## 落とし穴2：「x」はソーシャルの一覧に入っていない

Twitter が X に名前を変えてから、`utm_source=x` を使う人が増えました。ところが、Googleの参照元カテゴリ一覧には `twitter` や `t.co` はあっても、**`x` はありません**（2026年10月時点）。

その結果、次のようになります。

| source | medium | 分類 |
|---|---|---|
| `x` | `social` | Organic Social（medium で判定されるのでOK） |
| `x` | `paid_social` | **Paid Other**（有料ソーシャルにならない） |
| `twitter` | `paid_social` | Paid Social |
| `x` | `sns` | **Unassigned** |

通常の投稿は `x` でも medium を `social` にしておけば問題ありません。一方、**X広告は `utm_source=twitter` にしないと「有料ソーシャル」に入りません**。Meta広告と並べて有料ソーシャル全体の成果を見たいときに、Xだけ抜け落ちる原因になります。

## 現場で使っている命名ルール

表記ゆれと定義外の値を防ぐには、ルールを決めて、そこから外れた値を使わないことに尽きます。私が現場で使っているルールは次のとおりです。

| パラメータ | ルール | 例 |
|---|---|---|
| utm_source | 媒体名。決めた値だけを使う | `google`、`instagram`、`twitter`、`line_oa`、`newsletter` |
| utm_medium | 流入の種類。GA4のルールにある値だけを使う | `social`、`paid_social`、`cpc`、`display`、`email` |
| utm_campaign | 「年月_施策名」 | `202610_autumn_sale` |
| 共通 | 英小文字・スネークケース。日本語と空白は使わない | |

キャンペーン名を「年月_施策名」にしておくと、GA4やBigQueryで並べ替えたときに時系列でそろい、施策の比較や月次の集計がしやすくなります。

## 運用で崩さないための3つのこと

1. **使ってよい値の表を共有する。** source と medium は、表にある値以外を使わないルールにします。新しい媒体を追加するときは、表を更新してから使います。
2. **URLは手で書かずにツールで作る。** 手入力は大文字・空白・タイプミスの元です。[UTMビルダー](/tools/utm-builder/)なら、小文字化や空白の置き換えを自動で行い、GA4での分類もその場で確認できます。
3. **Unassigned を定期的に確認する。** GA4の探索で「セッションのデフォルト チャネル グループ」が Unassigned の行を開き、「セッションの参照元 / メディア」を並べると、ルールから外れたUTMがすぐに見つかります。

UTMは一度付けたリンクが長く使われるので、後から直すのが難しい部分です。最初にルールを決めて、ツールでそろえる。それだけで、チャネル別の数字が信頼できるものになります。
