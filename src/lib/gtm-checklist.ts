// GTMタグ設定チェックリストの中身と生成ロジック。DOMに依存しないので単体テストできる。
// 仕様の裏取りに使った公式ドキュメントは SOURCES（取得日つき）にまとめている。

export type Platform = 'ga4' | 'google_ads' | 'meta' | 'yahoo' | 'line';
export type EventKind = 'page_view' | 'purchase' | 'lead' | 'sign_up' | 'add_to_cart' | 'contact_click';
export type Condition = 'spa' | 'cmp' | 'metaCapi';
export type Stage = 'before' | 'during' | 'prepublish' | 'after';

export const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'ga4', label: 'GA4' },
  { id: 'google_ads', label: 'Google広告' },
  { id: 'meta', label: 'Meta広告' },
  { id: 'yahoo', label: 'Yahoo!広告' },
  { id: 'line', label: 'LINE広告' },
];

export const EVENTS: { id: EventKind; label: string; hint: string }[] = [
  { id: 'page_view', label: 'ページビュー', hint: '全ページの閲覧' },
  { id: 'purchase', label: '購入', hint: '金額・通貨・取引IDまで確認' },
  { id: 'lead', label: 'フォーム送信完了', hint: '問い合わせ・資料請求の送信成功' },
  { id: 'sign_up', label: '会員登録', hint: '登録完了' },
  { id: 'add_to_cart', label: 'カート追加', hint: 'ECの購入前行動' },
  { id: 'contact_click', label: '電話・LINEクリック', hint: 'tel: リンクや友だち追加リンク' },
];

export const CONDITIONS: { id: Condition; label: string; hint: string }[] = [
  { id: 'spa', label: 'SPA（画面遷移でページを再読み込みしないサイト）', hint: 'React・Vue・Next.js など' },
  { id: 'cmp', label: '同意管理ツール（CMP）を使う', hint: 'Cookieバナーで同意を取る' },
  { id: 'metaCapi', label: 'Meta Conversions API を併用する', hint: 'サーバーからもイベントを送る' },
];

export const STAGES: { id: Stage; label: string; summary: string }[] = [
  { id: 'before', label: '設定前', summary: '計測の設計とIDの確認' },
  { id: 'during', label: '設定中', summary: 'GTMでタグ・トリガー・変数を作る' },
  { id: 'prepublish', label: '公開前', summary: 'プレビューと各ツールで動作確認' },
  { id: 'after', label: '公開後', summary: '公開と媒体側の受信確認' },
];

export interface ChecklistItem {
  id: string;
  stage: Stage;
  title: string;
  /** 確認方法 */
  how: string;
  /** よくあるNG例 */
  ng: string;
  /** 表示する条件。各配列は「どれか1つ」に当てはまれば表示。指定がない軸は条件なし */
  when?: {
    platforms?: Platform[];
    events?: EventKind[];
    /** すべて満たすときだけ表示 */
    conditions?: Condition[];
    /** どれか1つでも満たすと表示しない */
    unless?: Condition[];
  };
  /** 裏取りに使った出典（SOURCES の id） */
  sources?: string[];
}

export interface Source {
  id: string;
  title: string;
  url: string;
}

/** 取得日（公式ドキュメントを確認した日） */
export const SOURCES_CHECKED_ON = '2026-10-26';

export const SOURCES: Source[] = [
  { id: 'ga4-events', title: 'GA4 推奨イベントのリファレンス（Google for Developers）', url: 'https://developers.google.com/gtagjs/reference/ga4-events' },
  { id: 'ga4-ecommerce', title: 'GA4 購入イベントの設定とDebugView（Google for Developers）', url: 'https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce' },
  { id: 'ga4-spa-gtm', title: 'GTMでシングルページアプリケーションを計測する（Google for Developers）', url: 'https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm' },
  { id: 'ga4-internal', title: '[GA4] 内部トラフィックを除外する（アナリティクス ヘルプ）', url: 'https://support.google.com/analytics/answer/10104470' },
  { id: 'gads-txid', title: '取引IDで重複したコンバージョンを防ぐ（Google 広告 ヘルプ）', url: 'https://support.google.com/google-ads/answer/6386790' },
  { id: 'gads-tag-assistant', title: 'Tag Assistant で未確認・無効のコンバージョンアクションを調べる（Google 広告 ヘルプ）', url: 'https://support.google.com/google-ads/answer/10989978' },
  { id: 'gtm-consent', title: '同意モードとタグの同意設定（タグ マネージャー ヘルプ）', url: 'https://support.google.com/tagmanager/answer/10718549' },
  { id: 'gtm-publish', title: '公開とバージョン（タグ マネージャー ヘルプ）', url: 'https://support.google.com/tagmanager/answer/2699097' },
  { id: 'meta-dedup', title: 'Meta Pixel と Conversions API の重複イベントの処理（Meta for Developers）', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events' },
  { id: 'yahoo-cv-tags', title: 'コンバージョン測定で設置が必要なタグについて（LINEヤフー広告 ヘルプ）', url: 'https://ads-help.yahoo-net.jp/s/article/H000044505?language=ja' },
  { id: 'yahoo-new-tag', title: 'ディスプレイ広告で計測タグと新しいコンバージョンAPIの提供開始（LINEヤフー for Business、2025年6月）', url: 'https://www.lycbiz.com/jp/news/yahoo-ads/20250623' },
  { id: 'line-tag', title: 'LINE Tagの概要と設置の確認（LINEヤフー for Business マニュアル）', url: 'https://www.lycbiz.com/jp/manual/line-ads/tracking_001/' },
];

const CONVERSION_EVENTS: EventKind[] = ['purchase', 'lead', 'sign_up', 'add_to_cart', 'contact_click'];
const FORM_EVENTS: EventKind[] = ['lead', 'sign_up'];
const VALUE_EVENTS: EventKind[] = ['purchase', 'add_to_cart'];
const DATALAYER_EVENTS: EventKind[] = ['purchase', 'add_to_cart', 'lead', 'sign_up'];
const AD_PLATFORMS: Platform[] = ['google_ads', 'meta', 'yahoo', 'line'];

export const ITEMS: ChecklistItem[] = [
  // ───────── 設定前 ─────────
  {
    id: 'define-conversions',
    stage: 'before',
    title: '成果の定義を「完了」にそろえる',
    how: '計測するイベントごとに「何が起きたら成果か」を一覧にする。フォームは送信成功（完了画面の表示や送信成功の通知）を成果にする。',
    ng: '問い合わせボタンのクリックを成果にしていて、入力エラーで送信できなかった人まで成果に入る。',
    when: { events: CONVERSION_EVENTS },
  },
  {
    id: 'find-hardcoded-tags',
    stage: 'before',
    title: 'サイトに直接埋め込まれたタグを洗い出す',
    how: 'ページのソースやTag Assistantで、GTM以外から同じタグ（gtag.js・Meta Pixel・LINE Tagなど）が読み込まれていないか確認する。',
    ng: 'サイトに直書きのタグが残ったまま、GTMでも同じタグを入れてページビューや成果が2倍になる。',
  },
  {
    id: 'id-ga4',
    stage: 'before',
    title: 'GA4の測定IDを対象プロパティから控える',
    how: 'GA4の管理画面で、計測したいプロパティの「データストリーム」を開き、測定ID（G-から始まる）を確認する。',
    ng: 'テスト用や旧サイトなど、別プロパティの測定IDを設定してしまう。',
    when: { platforms: ['ga4'] },
  },
  {
    id: 'id-google-ads',
    stage: 'before',
    title: 'Google広告のコンバージョンIDとラベルをアクションごとに控える',
    how: 'Google広告のコンバージョンアクションごとに、コンバージョンIDとコンバージョンラベルの組み合わせを一覧にする。',
    ng: '購入用と問い合わせ用のラベルを取り違え、別のアクションに成果が計上される。',
    when: { platforms: ['google_ads'] },
  },
  {
    id: 'id-meta',
    stage: 'before',
    title: 'MetaのピクセルIDを控える',
    how: 'イベントマネージャで、広告アカウントにつながっているピクセル（データセット）のIDを確認する。',
    ng: '別のビジネスや以前の担当者が作ったピクセルIDを使い、広告の最適化に成果が使われない。',
    when: { platforms: ['meta'] },
  },
  {
    id: 'id-yahoo',
    stage: 'before',
    title: 'Yahoo!広告で使うタグの種類と設定値を確認する',
    how: '検索広告とディスプレイ広告のどちらで計測するか、従来のタグ（サイトジェネラルタグ＋コンバージョン測定タグ）と新しい計測タグのどちらを使うかを決め、管理画面から設定値を控える。',
    ng: '検索広告とディスプレイ広告の設定値を取り違え、片方の成果が計測されない。',
    when: { platforms: ['yahoo'] },
    sources: ['yahoo-cv-tags', 'yahoo-new-tag'],
  },
  {
    id: 'id-line',
    stage: 'before',
    title: 'LINE TagのベースコードとコンバージョンコードをLINE広告の管理画面から取得する',
    how: 'LINE広告マネージャーの「トラッキング（LINE Tag）」から、使う広告アカウントのコードを確認する。',
    ng: '別の広告アカウントのLINE Tagを設置してしまう。',
    when: { platforms: ['line'] },
    sources: ['line-tag'],
  },
  {
    id: 'datalayer-spec',
    stage: 'before',
    title: 'dataLayerの仕様（イベント名・キー名）を開発側と文書で決める',
    how: 'dataLayer.push するイベント名と、value・currency・transaction_id などのキー名、値の型を一覧にして開発側と合意する。',
    ng: 'サイトは transactionId で送り、GTMは transaction_id を読みにいって値が undefined になる。',
    when: { events: DATALAYER_EVENTS },
    sources: ['gads-txid'],
  },
  {
    id: 'purchase-params-design',
    stage: 'before',
    title: '購入イベントで value・currency・transaction_id を送る設計にする',
    how: 'value は数値、currency は JPY などの3文字の通貨コード、transaction_id は注文ごとに一意の値にする。GA4では value を送るときは currency も必須。',
    ng: 'value だけ送って currency がない、または transaction_id を送っていない。',
    when: { events: ['purchase'] },
    sources: ['ga4-events'],
  },
  {
    id: 'consent-plan',
    stage: 'before',
    title: '同意の種類ごとに、どのタグを止めるかを決める',
    how: 'ad_storage・analytics_storage・ad_user_data・ad_personalization のどれが拒否されたら、どのタグを止めるか（または動作を変えるか）を一覧にする。',
    ng: '同意を取る前から広告タグが発火している。',
    when: { conditions: ['cmp'] },
    sources: ['gtm-consent'],
  },
  {
    id: 'consent-need',
    stage: 'before',
    title: '同意管理が必要かを確認する',
    how: '対象地域（EEA向けの配信など）や社内・クライアントのプライバシーポリシーから、同意を取ってからタグを動かす必要があるかを確認する。',
    ng: '必要なのに同意管理を入れず、後から全タグの設定をやり直す。',
    when: { unless: ['cmp'] },
    sources: ['gtm-consent'],
  },
  {
    id: 'exclude-test-plan',
    stage: 'before',
    title: 'テスト購入と社内アクセスの除外方法を決める',
    how: 'GA4の内部トラフィック（IPアドレス）の定義、テスト購入の扱い（テスト用の決済、テスト後の取り消し）を決めておく。',
    ng: '社内のテスト購入や関係者のアクセスが、本番の売上や成果に混ざる。',
    when: { events: CONVERSION_EVENTS },
    sources: ['ga4-internal'],
  },
  {
    id: 'spa-plan',
    stage: 'before',
    title: 'SPAの画面遷移をどの方法で計測するか決める',
    how: '画面遷移でURLが変わる（History APIを使う）かを確認し、GA4の拡張計測「ブラウザの履歴イベントに基づくページの変更」と、GTMの履歴変更トリガーのどちらで計測するかを1つに決める。',
    ng: '最初の1ページしかページビューが取れない。または両方で計測して2重になる。',
    when: { conditions: ['spa'] },
    sources: ['ga4-spa-gtm'],
  },

  // ───────── 設定中 ─────────
  {
    id: 'narrow-triggers',
    stage: 'during',
    title: '成果タグのトリガーを対象ページ・対象操作に絞る',
    how: '「All Pages」ではなく、完了ページのURLやカスタムイベント名で条件を付ける。',
    ng: '成果タグのトリガーが「All Pages」のままで、全ページで成果が発火する。',
    when: { events: CONVERSION_EVENTS },
  },
  {
    id: 'form-success-trigger',
    stage: 'during',
    title: 'フォームは送信成功で発火させる',
    how: '送信成功時に dataLayer.push されるカスタムイベント、または完了ページのURLをトリガーにする。',
    ng: 'ボタンのクリックトリガーで計測し、送信エラーの場合も成果に入る。',
    when: { events: FORM_EVENTS },
  },
  {
    id: 'contact-click-trigger',
    stage: 'during',
    title: '電話・LINEのクリックはリンク先で条件を絞る',
    how: 'リンクのみのクリックトリガーで、Click URL が tel: や LINEの友だち追加URL（line.me・lin.ee など）で始まるときだけ発火させる。組み込み変数の Click URL を有効にしておく。',
    ng: 'ページ内のすべてのリンククリックで成果が発火する。Click URL 変数が無効で条件が効かない。',
    when: { events: ['contact_click'] },
  },
  {
    id: 'datalayer-variable-names',
    stage: 'during',
    title: 'データレイヤー変数の名前を dataLayer のキーと一致させる',
    how: 'データレイヤー変数の「データレイヤーの変数名」が、push されるキーと一字一句同じか確認する。入れ子のキーは ecommerce.value のようにドットでつなぐ。',
    ng: 'ecommerce.value を value で参照して undefined になる。',
    when: { events: DATALAYER_EVENTS },
    sources: ['gads-txid'],
  },
  {
    id: 'value-number',
    stage: 'during',
    title: '金額（value）は数値で渡す',
    how: 'dataLayer に入る値が数値か確認し、カンマや円記号を含む文字列なら開発側で数値にしてもらう。',
    ng: 'value が "5000" や "5,000円" のような文字列で送られる。',
    when: { events: VALUE_EVENTS },
    sources: ['ga4-events'],
  },
  {
    id: 'currency-set',
    stage: 'during',
    title: 'value を送るタグには currency も設定する',
    how: 'GA4のイベントタグや広告タグの通貨欄に JPY などを設定する。',
    ng: 'value だけ送り、GA4で収益が正しく計算されない。',
    when: { events: VALUE_EVENTS },
    sources: ['ga4-events'],
  },
  {
    id: 'ga4-transaction-id',
    stage: 'during',
    title: 'GA4の購入イベントに transaction_id を設定する',
    how: 'GA4イベントタグの purchase に transaction_id を変数で設定する。GA4は同じ transaction_id の購入を重複として扱う。',
    ng: 'transaction_id がなく、完了ページの再表示で購入が重複して計上される。',
    when: { platforms: ['ga4'], events: ['purchase'] },
    sources: ['ga4-events', 'ga4-ecommerce'],
  },
  {
    id: 'gads-transaction-id',
    stage: 'during',
    title: 'Google広告のコンバージョンタグに取引IDを変数で設定する',
    how: '「取引ID」欄にデータレイヤー変数（例：{{DLV - transaction_id}}）を入れる。固定の文字列は入れない。',
    ng: '取引IDに固定値を入れ、2件目以降がすべて重複とみなされ成果が減る。',
    when: { platforms: ['google_ads'], events: ['purchase'] },
    sources: ['gads-txid'],
  },
  {
    id: 'gads-conversion-linker',
    stage: 'during',
    title: 'Google広告のコンバージョンリンカーを全ページで発火させる',
    how: 'コンバージョンリンカーのタグがあり、トリガーが全ページ（All Pages）になっているか確認する。',
    ng: 'コンバージョンタグだけ作り、リンカーがないか成果ページでしか発火していない。',
    when: { platforms: ['google_ads'] },
    sources: ['gads-tag-assistant'],
  },
  {
    id: 'meta-event-id',
    stage: 'during',
    title: 'Meta Pixel と Conversions API でイベントIDとイベント名をそろえる',
    how: 'Pixel の eventID と Conversions API の event_id、Pixel の event と Conversions API の event_name が同じ値になるようにする（注文番号などを両方に渡す）。',
    ng: 'Pixel と サーバーで別々のIDを使い、同じ購入が2件として計上される。',
    when: { platforms: ['meta'], conditions: ['metaCapi'] },
    sources: ['meta-dedup'],
  },
  {
    id: 'yahoo-tags',
    stage: 'during',
    title: 'Yahoo!広告のタグを決めた構成どおりに設置する',
    how: '従来のタグを使う場合は、サイトジェネラルタグを全ページに、コンバージョン測定タグを成果ページ（または成果イベント）に設置する。',
    ng: 'コンバージョン測定タグだけ入れて、全ページ用のタグが入っていない。',
    when: { platforms: ['yahoo'] },
    sources: ['yahoo-cv-tags'],
  },
  {
    id: 'line-tags',
    stage: 'during',
    title: 'LINE Tagのベースコードを全ページに、コンバージョンコードを成果時に設置する',
    how: 'ベースコードは計測したいすべてのページ、コンバージョンコードは成果ページ（または成果イベント）で、ベースコードとセットで発火させる。',
    ng: 'コンバージョンコードだけ入れてベースコードがなく、LINE Tagが動かない。',
    when: { platforms: ['line'] },
    sources: ['line-tag'],
  },
  {
    id: 'consent-settings',
    stage: 'during',
    title: 'CMPのタグを同意の初期化トリガーで動かし、各タグの同意設定を入れる',
    how: 'CMPのタグは「同意の初期化 - All Pages」トリガーにする。Google以外のタグは「追加の同意チェック」で必要な同意の種類を指定する。コンテナ設定で「同意の概要」を有効にすると一覧で確認できる。',
    ng: 'CMPのタグが通常の All Pages で動き、広告タグが同意の反映より先に発火する。',
    when: { conditions: ['cmp'] },
    sources: ['gtm-consent'],
  },
  {
    id: 'spa-trigger',
    stage: 'during',
    title: 'SPAの画面遷移で page_view を送る設定をする',
    how: 'GTMで計測する場合は、GA4の拡張計測の「ブラウザの履歴イベントに基づくページの変更」をオフにし、履歴の変更トリガーで page_view を送る。',
    ng: '拡張計測をオンのままGTMでも送り、画面遷移ごとに page_view が2回送られる。',
    when: { platforms: ['ga4'], conditions: ['spa'] },
    sources: ['ga4-spa-gtm'],
  },
  {
    id: 'spa-ad-tags',
    stage: 'during',
    title: 'SPAで広告タグのページビュー・成果が画面遷移でも動くか確認する',
    how: '広告タグのページビューや成果のトリガーが、ページ読み込みだけでなく履歴の変更やカスタムイベントでも発火するようにする。',
    ng: '完了画面がSPAの画面遷移で表示され、ページ読み込みトリガーの成果タグが発火しない。',
    when: { platforms: AD_PLATFORMS, conditions: ['spa'] },
  },

  // ───────── 公開前 ─────────
  {
    id: 'preview-fire-count',
    stage: 'prepublish',
    title: '1回の操作でタグが1回だけ発火するか確認する',
    how: 'GTMのプレビューモードで成果の操作を1回行い、対象のタグが1回だけ発火しているか確認する。',
    ng: '1回の送信でタグが2回発火する。',
  },
  {
    id: 'preview-negative',
    stage: 'prepublish',
    title: '対象外のページ・操作でタグが発火しないか確認する',
    how: '対象ページと対象外ページの両方をプレビューで開き、成果タグが対象でだけ発火するか確認する。',
    ng: 'トップページを開いただけで成果タグが発火する。',
    when: { events: CONVERSION_EVENTS },
  },
  {
    id: 'check-duplicates',
    stage: 'prepublish',
    title: '同じタグが直書きとGTMで重複していないか確認する',
    how: 'Tag Assistantでページを開き、同じ測定IDやピクセルIDのタグが2つ検出されていないか確認する。',
    ng: 'GA4の page_view が1回の表示で2回送られている。',
  },
  {
    id: 'ga4-debugview',
    stage: 'prepublish',
    title: 'GA4のDebugViewでイベントとパラメータを確認する',
    how: 'プレビュー中の操作がDebugViewに届き、イベント名とパラメータが想定どおりか確認する。',
    ng: 'GTMでは発火しているのに、別プロパティに送っていてDebugViewに出てこない。',
    when: { platforms: ['ga4'] },
    sources: ['ga4-ecommerce'],
  },
  {
    id: 'ga4-value-type',
    stage: 'prepublish',
    title: 'DebugViewで value・currency・transaction_id の値と型を確認する',
    how: 'DebugViewで購入イベントを開き、value が数値、currency が JPY など、transaction_id が注文ごとに違う値になっているか確認する。',
    ng: 'value が "5000"（文字列）、または transaction_id が毎回同じ値。',
    when: { platforms: ['ga4'], events: VALUE_EVENTS },
    sources: ['ga4-events', 'ga4-ecommerce'],
  },
  {
    id: 'reload-thanks',
    stage: 'prepublish',
    title: '完了ページを再読み込みしても成果が再送されないか確認する',
    how: '完了ページで再読み込みやブラウザの「戻る→進む」をして、成果タグが再び発火しないか確認する。発火する場合は、開発側で1回だけ push する仕組みにするか transaction_id で重複を除く。',
    ng: '完了ページを再読み込みするたびに購入イベントが送られる。',
    when: { events: ['purchase', 'lead', 'sign_up'] },
    sources: ['ga4-events', 'gads-txid'],
  },
  {
    id: 'consent-denied-test',
    stage: 'prepublish',
    title: '同意を拒否した状態でタグが止まるか確認する',
    how: 'CMPで拒否を選んでからプレビューし、拒否した種類に対応するタグが発火しない（または同意に応じた動作になる）か確認する。',
    ng: '拒否しても広告タグが通常どおり発火する。',
    when: { conditions: ['cmp'] },
    sources: ['gtm-consent'],
  },
  {
    id: 'spa-preview',
    stage: 'prepublish',
    title: 'SPAの画面遷移ごとに page_view が1回送られるか確認する',
    how: 'プレビューとDebugViewで画面を何回か移動し、遷移ごとに page_view が1回、page_location が正しいURLになっているか確認する。',
    ng: '画面を移動しても page_view が増えない。または2回ずつ送られる。',
    when: { conditions: ['spa'] },
    sources: ['ga4-spa-gtm'],
  },
  {
    id: 'gads-tag-assistant',
    stage: 'prepublish',
    title: 'Google広告のコンバージョンアクションをTag Assistantで確認する',
    how: 'Google広告の「目標」の概要から対象アクションの「トラブルシューティング」でTag Assistantを開き、成果の操作をしてから「完了」を押す。',
    ng: 'GTMのプレビューで発火を見ただけで、正しいコンバージョンアクションに届いているか確認していない。',
    when: { platforms: ['google_ads'] },
    sources: ['gads-tag-assistant'],
  },
  {
    id: 'meta-test-events',
    stage: 'prepublish',
    title: 'Metaのイベントマネージャの「イベントをテスト」で受信を確認する',
    how: 'イベントマネージャの「イベントをテスト」でサイトを開いて操作し、イベント名とパラメータ（value・currency など）が届いているか確認する。',
    ng: 'Pixel Helperで発火を見ただけで、イベントマネージャ側の受信を確認していない。',
    when: { platforms: ['meta'] },
  },
  {
    id: 'meta-dedup-test',
    stage: 'prepublish',
    title: 'Pixel と Conversions API の両方が届き、重複が除かれているか確認する',
    how: 'テスト用の購入などで、ブラウザとサーバーの両方からイベントが届き、同じ event_id で1件として扱われているか確認する。重複の除外は48時間以内に届いたイベントが対象。',
    ng: 'ブラウザとサーバーの両方が届いているのに、event_id が一致せず2件になる。',
    when: { platforms: ['meta'], conditions: ['metaCapi'] },
    sources: ['meta-dedup'],
  },
  {
    id: 'contact-click-device',
    stage: 'prepublish',
    title: 'スマートフォンの実機で電話・LINEリンクをタップして確認する',
    how: '実機でリンクをタップし、成果タグが1回発火するか、プレビューまたは各媒体のテスト機能で確認する。',
    ng: 'PCでしか確認しておらず、スマホ用のボタンに別のURLが入っていて計測されない。',
    when: { events: ['contact_click'] },
  },

  // ───────── 公開後 ─────────
  {
    id: 'publish',
    stage: 'after',
    title: 'GTMのコンテナを公開する',
    how: '「公開」から公開し、バージョン一覧で今回の変更を含むバージョンが公開中になっているか確認する。',
    ng: 'プレビューで動いたことに満足して、公開していない。',
    sources: ['gtm-publish'],
  },
  {
    id: 'receive-ga4',
    stage: 'after',
    title: 'GA4で本番のデータを受信しているか確認する',
    how: 'リアルタイムレポートで対象のイベントを確認する。標準レポートへの反映は24時間ほどかかる。',
    ng: 'GTMでの発火だけを見て、GA4のレポートを確認していない。',
    when: { platforms: ['ga4'] },
    sources: ['ga4-ecommerce'],
  },
  {
    id: 'receive-google-ads',
    stage: 'after',
    title: 'Google広告でコンバージョンアクションのステータスを確認する',
    how: '確認できたアクションは「最近のコンバージョンなし」になり、成果を受け取ると「記録中」に変わる。「未確認」のままなら設定を見直す。',
    ng: 'ステータスが「未確認」のまま配信を続けている。',
    when: { platforms: ['google_ads'] },
    sources: ['gads-tag-assistant'],
  },
  {
    id: 'receive-meta',
    stage: 'after',
    title: 'Metaのイベントマネージャで本番のイベントを確認する',
    how: 'イベントマネージャの概要で、対象イベントが受信されているか、エラーや警告が出ていないか確認する。',
    ng: 'GTMでは成功しているのに、Meta側では受信されていない。',
    when: { platforms: ['meta'] },
  },
  {
    id: 'receive-yahoo',
    stage: 'after',
    title: 'Yahoo!広告の管理画面で計測状況を確認する',
    how: '管理画面のコンバージョン測定の一覧で、タグの状態や成果の計上を確認する。',
    ng: 'GTMでは成功しているのに、Yahoo!広告側では成果がゼロのまま。',
    when: { platforms: ['yahoo'] },
  },
  {
    id: 'receive-line',
    stage: 'after',
    title: 'LINE広告でLINE Tagのステータスを確認する',
    how: '広告マネージャーの「トラッキング（LINE Tag）」で、ステータスが「利用可能」か、最終受信日時が新しいか確認する。7日間動作がないと「停止中」になる。',
    ng: 'GTMでは成功しているのに、LINE Tagのステータスが「停止中」のまま。',
    when: { platforms: ['line'] },
    sources: ['line-tag'],
  },
  {
    id: 'ga4-internal-filter',
    stage: 'after',
    title: 'GA4の内部トラフィックのフィルタを「テスト」で確かめてから有効にする',
    how: 'データフィルタを「テスト」状態にして、除外される範囲を探索レポートで確認してから「有効」にする。有効にすると除外したデータは元に戻せない。',
    ng: '社内アクセスが成果に混ざったまま。または確認せずに有効にして必要なデータまで除外する。',
    when: { platforms: ['ga4'] },
    sources: ['ga4-internal'],
  },
  {
    id: 'exclude-test-purchases',
    stage: 'after',
    title: 'テスト購入やテスト送信を本番の数字から外す',
    how: 'テストで発生した注文番号や送信を記録し、注文の取り消しや、分析時の除外ができるようにしておく。',
    ng: 'テスト購入が初日の売上・成果としてレポートに残る。',
    when: { events: CONVERSION_EVENTS },
  },
  {
    id: 'reconcile',
    stage: 'after',
    title: '数日後に、実際の件数と計測の件数を突き合わせる',
    how: '注文管理やフォームの管理画面の件数と、GA4・広告媒体の成果数を同じ期間で比べる。広告媒体は計上の考え方が違うので、大きなずれがないかを見る。',
    ng: 'GA4の購入数が実際の注文数の2倍になっているのに気づかない。',
    when: { events: CONVERSION_EVENTS },
  },
  {
    id: 'recheck-after-changes',
    stage: 'after',
    title: 'サイトの改修後にもう一度確認する',
    how: '完了ページのURL、フォーム、ボタンの文言やクラス名が変わったら、このチェックリストで再確認する。',
    ng: 'サイトのリニューアルで完了ページのURLが変わり、成果の計測が止まっている。',
  },
];

export interface Selection {
  platforms: Platform[];
  events: EventKind[];
  conditions: Condition[];
}

export interface ChecklistSection {
  stage: Stage;
  label: string;
  summary: string;
  items: ChecklistItem[];
}

const anyOf = <T>(required: T[] | undefined, selected: T[]) => !required || required.some((r) => selected.includes(r));

export function isApplicable(item: ChecklistItem, sel: Selection): boolean {
  const w = item.when;
  if (!w) return true;
  if (!anyOf(w.platforms, sel.platforms)) return false;
  if (!anyOf(w.events, sel.events)) return false;
  if (w.conditions && !w.conditions.every((c) => sel.conditions.includes(c))) return false;
  if (w.unless && w.unless.some((c) => sel.conditions.includes(c))) return false;
  return true;
}

/** 選んだ媒体・イベント・条件に関係する項目だけを、4段階に分けて返す。媒体もイベントも未選択なら空。 */
export function generateChecklist(sel: Selection): ChecklistSection[] {
  if (!sel.platforms.length || !sel.events.length) return [];
  return STAGES.map((s) => ({
    stage: s.id,
    label: s.label,
    summary: s.summary,
    items: ITEMS.filter((i) => i.stage === s.id && isApplicable(i, sel)),
  })).filter((s) => s.items.length > 0);
}

const labelOf = <T extends string>(list: { id: T; label: string }[], ids: T[]) =>
  list.filter((x) => ids.includes(x.id)).map((x) => x.label);

/** チェックリストをMarkdownにする。checked に入っている項目は [x] になる。 */
export function toMarkdown(sel: Selection, sections: ChecklistSection[], checked: ReadonlySet<string> = new Set()): string {
  const lines: string[] = ['# GTMタグ設定チェックリスト', ''];
  lines.push(`- 媒体: ${labelOf(PLATFORMS, sel.platforms).join('、') || 'なし'}`);
  lines.push(`- イベント: ${labelOf(EVENTS, sel.events).join('、') || 'なし'}`);
  const conds = labelOf(CONDITIONS, sel.conditions);
  if (conds.length) lines.push(`- 条件: ${conds.join('、')}`);
  for (const s of sections) {
    lines.push('', `## ${s.label}（${s.summary}）`, '');
    for (const i of s.items) {
      lines.push(`- [${checked.has(i.id) ? 'x' : ' '}] ${i.title}`);
      lines.push(`  - 確認方法: ${i.how}`);
      lines.push(`  - NG例: ${i.ng}`);
    }
  }
  return lines.join('\n') + '\n';
}

/** 未知の値を取り除いて Selection を復元する（保存データやURLから読むとき用） */
export function sanitizeSelection(raw: unknown): Selection {
  const pick = <T extends string>(v: unknown, allowed: { id: T }[]): T[] =>
    Array.isArray(v) ? allowed.map((a) => a.id).filter((id) => v.includes(id)) : [];
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    platforms: pick(o.platforms, PLATFORMS),
    events: pick(o.events, EVENTS),
    conditions: pick(o.conditions, CONDITIONS),
  };
}
