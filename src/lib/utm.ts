// UTMビルダーの中核ロジック。DOMに依存しないので単体テストできる。

export type UtmKey =
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'utm_id'
  | 'utm_term'
  | 'utm_content'
  | 'utm_source_platform'
  | 'utm_creative_format'
  | 'utm_marketing_tactic';

export const UTM_KEYS: UtmKey[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_id',
  'utm_term',
  'utm_content',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
];

export const REQUIRED_KEYS: UtmKey[] = ['utm_source', 'utm_medium', 'utm_campaign'];

export type UtmParams = Partial<Record<UtmKey, string>>;

export interface NormalizeOptions {
  lowercase: boolean;
  /** 空白を置き換える文字。null なら置き換えない */
  spaceReplacement: '_' | '-' | null;
}

export const DEFAULT_OPTIONS: NormalizeOptions = { lowercase: true, spaceReplacement: '_' };

export function normalizeValue(value: string, opts: NormalizeOptions = DEFAULT_OPTIONS): string {
  // 全角英数・記号を半角に、全角スペースを半角スペースにそろえる
  let v = value.normalize('NFKC').trim();
  if (opts.spaceReplacement) v = v.replace(/\s+/g, opts.spaceReplacement);
  if (opts.lowercase) v = v.toLowerCase();
  return v;
}

export function normalizeParams(params: UtmParams, opts: NormalizeOptions = DEFAULT_OPTIONS): UtmParams {
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const raw = params[key];
    if (raw === undefined) continue;
    const v = normalizeValue(raw, opts);
    if (v !== '') out[key] = v;
  }
  return out;
}

export type BuildResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * 元URLにUTMパラメータを付ける。
 * - 既存のクエリは残し、同名のUTMは上書きする
 * - #フラグメントの前に付ける（後ろに付くとGA4が読めない）
 */
export function buildUrl(baseUrl: string, params: UtmParams): BuildResult {
  const trimmed = baseUrl.trim();
  if (!trimmed) return { ok: false, error: 'URLを入力してください' };

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return { ok: false, error: 'URLの形式が正しくありません' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'http:// か https:// で始まるURLを入力してください' };
  }

  for (const key of UTM_KEYS) {
    const v = params[key];
    if (v) url.searchParams.set(key, v);
  }
  // URLSearchParams は空白を + にするが、%20 の方が環境を問わず安全
  url.search = url.search.replace(/\+/g, '%20');
  return { ok: true, url: url.toString() };
}

// ---------------------------------------------------------------
// GA4 デフォルト チャネル グループの判定（目安）
// 公式ルール https://support.google.com/analytics/answer/9756891 を簡略化。
// 参照元カテゴリ（検索サイト・SNSなど）の一覧はGoogleの完全なリストではなく、
// 日本でよく使う代表的なものだけを入れている。
// ---------------------------------------------------------------

const SEARCH_SOURCES = [
  'google', 'yahoo', 'bing', 'baidu', 'duckduckgo', 'naver', 'yandex', 'ecosia',
  'search.yahoo.co.jp', 'yahoo.co.jp', 'google.com', 'google.co.jp', 'bing.com',
];
const SOCIAL_SOURCES = [
  'facebook', 'fb', 'instagram', 'ig', 'twitter', 'x', 't.co', 'x.com', 'line',
  'linkedin', 'pinterest', 'threads', 'tiktok', 'note', 'note.com', 'reddit',
  'facebook.com', 'm.facebook.com', 'l.facebook.com', 'instagram.com', 'linkedin.com',
  'lnkd.in', 'pinterest.com', 'threads.net', 'tiktok.com', 'twitter.com', 'hatena',
  'b.hatena.ne.jp', 'mixi', 'qiita', 'zenn',
];
const VIDEO_SOURCES = ['youtube', 'youtube.com', 'm.youtube.com', 'vimeo', 'vimeo.com', 'nicovideo', 'nicovideo.jp'];
const SHOPPING_SOURCES = [
  'google shopping', 'shopping', 'amazon', 'amazon.co.jp', 'rakuten', 'rakuten.co.jp',
  'shopify', 'yahoo shopping', 'shopping.yahoo.co.jp', 'mercari', 'etsy', 'ebay',
];

const PAID_MEDIUM = /^(.*cp.*|ppc|retargeting|paid.*)$/;
const SHOP_CAMPAIGN = /^(.*(([^a-df-z]|^)shop|shopping).*)$/;
const SOCIAL_MEDIUMS = ['social', 'social-network', 'social-media', 'sm', 'social network', 'social media'];
const EMAIL_VALUES = ['email', 'e-mail', 'e_mail', 'e mail'];
const DISPLAY_MEDIUMS = ['display', 'banner', 'expandable', 'interstitial', 'cpm'];

export type Channel =
  | 'Cross-network'
  | 'Paid Shopping'
  | 'Paid Search'
  | 'Paid Social'
  | 'Paid Video'
  | 'Display'
  | 'Paid Other'
  | 'Organic Shopping'
  | 'Organic Social'
  | 'Organic Video'
  | 'Organic Search'
  | 'Referral'
  | 'Email'
  | 'Affiliates'
  | 'Audio'
  | 'SMS'
  | 'Mobile Push Notifications'
  | 'Unassigned';

export const CHANNEL_LABELS_JA: Record<Channel, string> = {
  'Cross-network': 'クロスネットワーク',
  'Paid Shopping': '有料ショッピング',
  'Paid Search': '有料検索',
  'Paid Social': '有料ソーシャル',
  'Paid Video': '有料動画',
  'Display': 'ディスプレイ',
  'Paid Other': 'その他の有料',
  'Organic Shopping': 'オーガニック ショッピング',
  'Organic Social': 'オーガニック ソーシャル',
  'Organic Video': 'オーガニック動画',
  'Organic Search': 'オーガニック検索',
  'Referral': '参照',
  'Email': 'メール',
  'Affiliates': 'アフィリエイト',
  'Audio': '音声',
  'SMS': 'SMS',
  'Mobile Push Notifications': 'モバイルのプッシュ通知',
  'Unassigned': '未割り当て (Unassigned)',
};

export function predictChannel(params: UtmParams): Channel {
  const source = (params.utm_source ?? '').toLowerCase();
  const medium = (params.utm_medium ?? '').toLowerCase();
  const campaign = (params.utm_campaign ?? '').toLowerCase();

  const isSearch = SEARCH_SOURCES.includes(source);
  const isSocial = SOCIAL_SOURCES.includes(source);
  const isVideo = VIDEO_SOURCES.includes(source);
  const isShopping = SHOPPING_SOURCES.includes(source) || SHOP_CAMPAIGN.test(campaign);
  const isPaid = PAID_MEDIUM.test(medium);

  if (campaign.includes('cross-network')) return 'Cross-network';
  if (isShopping && isPaid) return 'Paid Shopping';
  if (isSearch && isPaid) return 'Paid Search';
  if (isSocial && isPaid) return 'Paid Social';
  if (isVideo && isPaid) return 'Paid Video';
  if (DISPLAY_MEDIUMS.includes(medium)) return 'Display';
  if (isPaid) return 'Paid Other';
  if (isShopping) return 'Organic Shopping';
  if (isSocial || SOCIAL_MEDIUMS.includes(medium)) return 'Organic Social';
  if (isVideo || /^(.*video.*)$/.test(medium)) return 'Organic Video';
  if (isSearch || medium === 'organic') return 'Organic Search';
  if (['referral', 'app', 'link'].includes(medium)) return 'Referral';
  if (EMAIL_VALUES.includes(source) || EMAIL_VALUES.includes(medium)) return 'Email';
  if (medium === 'affiliate') return 'Affiliates';
  if (medium === 'audio') return 'Audio';
  if (source === 'sms' || medium === 'sms') return 'SMS';
  if (medium.endsWith('push') || medium.includes('mobile') || medium.includes('notification') || source === 'firebase') {
    return 'Mobile Push Notifications';
  }
  return 'Unassigned';
}

// ---------------------------------------------------------------
// 入力チェック（実務でよくあるミスを警告する）
// ---------------------------------------------------------------

export type Severity = 'error' | 'warn' | 'info';
export interface Issue {
  severity: Severity;
  message: string;
}

export function checkIssues(baseUrl: string, raw: UtmParams, normalized: UtmParams): Issue[] {
  const issues: Issue[] = [];

  for (const key of REQUIRED_KEYS) {
    if (!normalized[key]) issues.push({ severity: 'error', message: `${key} は必須です` });
  }

  const base = baseUrl.trim();
  if (/[?&]utm_[a-z_]+=/i.test(base)) {
    issues.push({ severity: 'warn', message: '元のURLにすでにUTMが含まれています。同じ名前のものは上書きされます' });
  }
  if (/[?&]gclid=|[?&]fbclid=/i.test(base)) {
    issues.push({ severity: 'warn', message: '元のURLに gclid / fbclid が含まれています。クリックIDは広告側で自動で付くので、手で残さないでください' });
  }

  const source = (normalized.utm_source ?? '').toLowerCase();
  const medium = (normalized.utm_medium ?? '').toLowerCase();

  if (source === 'google' && PAID_MEDIUM.test(medium)) {
    issues.push({
      severity: 'info',
      message: 'Google広告は自動タグ設定（gclid）が基本です。手動UTMと併用すると、自動タグ設定の値が優先されます',
    });
  }
  if (medium && ['sns', 'twitter', 'facebook', 'instagram', 'line', 'x'].includes(medium)) {
    issues.push({
      severity: 'warn',
      message: `utm_medium=${medium} はGA4のチャネル判定ルールにない値です。オーガニック投稿なら social、広告なら paid_social にそろえましょう`,
    });
  }
  if (medium === 'mail' || medium === 'newsletter' || medium === 'mailmagazine' || medium === 'mailmaga') {
    issues.push({ severity: 'warn', message: `utm_medium=${medium} は「メール」チャネルになりません。email を使いましょう` });
  }
  if (medium === 'qr' || medium === 'qrcode' || medium === 'offline' || medium === 'print') {
    issues.push({
      severity: 'info',
      message: `utm_medium=${medium} はGA4では未割り当て(Unassigned)になります。チャネルグループをカスタマイズして拾う前提なら問題ありません`,
    });
  }

  for (const key of UTM_KEYS) {
    const r = raw[key];
    const n = normalized[key];
    if (!r || !n) continue;
    if (/[^\x00-\x7F]/.test(n)) {
      issues.push({
        severity: 'info',
        message: `${key} に日本語が含まれています。動作はしますが、URLが長くなり、集計時の表記ゆれも起きやすくなります`,
      });
    }
    if (/[A-Z]/.test(n)) {
      issues.push({
        severity: 'warn',
        message: `${key} に大文字があります。GA4は大文字と小文字を別の値として集計します`,
      });
    }
    if (/\s/.test(n)) {
      issues.push({ severity: 'warn', message: `${key} に空白があります。_ か - にそろえるのがおすすめです` });
    }
  }

  return issues;
}

// ---------------------------------------------------------------
// よく使う組み合わせ（プリセット）
// ---------------------------------------------------------------

export interface Preset {
  id: string;
  label: string;
  params: UtmParams;
  note?: string;
}

export const PRESETS: Preset[] = [
  { id: 'x-organic', label: 'X（通常投稿）', params: { utm_source: 'x', utm_medium: 'social' } },
  { id: 'x-ads', label: 'X広告', params: { utm_source: 'x', utm_medium: 'paid_social' } },
  { id: 'meta-ads', label: 'Meta広告（Facebook/Instagram）', params: { utm_source: 'facebook', utm_medium: 'paid_social' }, note: 'Instagram配信を分けたい場合は utm_source=instagram に' },
  { id: 'instagram', label: 'Instagram（通常投稿・プロフィール）', params: { utm_source: 'instagram', utm_medium: 'social' } },
  { id: 'line', label: 'LINE公式アカウント', params: { utm_source: 'line', utm_medium: 'social' }, note: '配信をメール同様に扱いたい場合は utm_medium=email でも可。社内でどちらかに統一を' },
  { id: 'note', label: 'note記事内リンク', params: { utm_source: 'note', utm_medium: 'social' } },
  { id: 'email', label: 'メルマガ', params: { utm_source: 'newsletter', utm_medium: 'email' } },
  { id: 'yahoo-display', label: 'Yahoo!広告 ディスプレイ', params: { utm_source: 'yahoo', utm_medium: 'display' } },
  { id: 'yahoo-search', label: 'Yahoo!広告 検索', params: { utm_source: 'yahoo', utm_medium: 'cpc' } },
  { id: 'qr', label: 'QRコード（チラシ・名刺）', params: { utm_source: 'flyer', utm_medium: 'qr' }, note: 'GA4標準のチャネルでは未割り当てになります' },
];
