// サイト全体の設定。名前やリンクはここだけ直せば全ページに反映される。
export const SITE = {
  name: 'Marketing Lab',
  description: 'Webマーケティングとデータ計測（GTM・GA4・BigQuery）の実務ノウハウと、現場で使える無料ツール。',
  x: 'hirocho_free',
  note: 'https://note.com/',
  // GA4の測定ID。下の本番ホストで表示されたときだけ計測する（プレビュー・ローカルは計測しない）
  ga4Id: 'G-E22JKV7R4T',
  // 独自ドメインを付けたらここに追加する
  analyticsHosts: ['portfolio.kazucchi1016.workers.dev'],
};
