import { describe, expect, it } from 'vitest';
import {
  CONDITIONS, DEFAULT_YAHOO, EVENTS, generateChecklist, isApplicable, ITEMS, PLATFORMS, sanitizeSelection, SOURCES, STAGES, toMarkdown, yahooFlags,
  type Selection,
} from '../src/lib/gtm-checklist';

const ids = (sel: Selection) => generateChecklist(sel).flatMap((s) => s.items.map((i) => i.id));
const base: Selection = { platforms: ['ga4'], events: ['page_view'], conditions: [] };

describe('データの整合性', () => {
  it('項目IDが重複していない', () => {
    const all = ITEMS.map((i) => i.id);
    expect(new Set(all).size).toBe(all.length);
  });
  it('出典IDがすべて SOURCES にある', () => {
    const known = new Set(SOURCES.map((s) => s.id));
    for (const i of ITEMS) for (const s of i.sources ?? []) expect(known.has(s), `${i.id} → ${s}`).toBe(true);
  });
  it('条件に使う値がすべて定義済み', () => {
    const p = new Set(PLATFORMS.map((x) => x.id));
    const e = new Set(EVENTS.map((x) => x.id));
    const c = new Set(CONDITIONS.map((x) => x.id));
    for (const i of ITEMS) {
      i.when?.platforms?.forEach((x) => expect(p.has(x)).toBe(true));
      i.when?.events?.forEach((x) => expect(e.has(x)).toBe(true));
      i.when?.conditions?.forEach((x) => expect(c.has(x)).toBe(true));
      i.when?.unless?.forEach((x) => expect(c.has(x)).toBe(true));
    }
  });
  it('すべての項目に確認方法とNG例がある', () => {
    for (const i of ITEMS) {
      expect(i.how.length, i.id).toBeGreaterThan(0);
      expect(i.ng.length, i.id).toBeGreaterThan(0);
    }
  });
  it('全部選ぶと4段階すべてが出る', () => {
    const all: Selection = {
      platforms: PLATFORMS.map((p) => p.id), events: EVENTS.map((e) => e.id), conditions: CONDITIONS.map((c) => c.id),
    };
    expect(generateChecklist(all).map((s) => s.stage)).toEqual(STAGES.map((s) => s.id));
  });
});

describe('generateChecklist', () => {
  it('媒体かイベントが未選択なら空', () => {
    expect(generateChecklist({ platforms: [], events: ['purchase'], conditions: [] })).toEqual([]);
    expect(generateChecklist({ platforms: ['ga4'], events: [], conditions: [] })).toEqual([]);
  });

  it('共通項目（公開・重複・発火回数）は常に出る', () => {
    expect(ids(base)).toEqual(expect.arrayContaining(['publish', 'check-duplicates', 'preview-fire-count', 'find-hardcoded-tags']));
  });

  it('選んでいない媒体の項目は出ない', () => {
    const r = ids(base);
    expect(r).toContain('id-ga4');
    expect(r).not.toContain('id-google-ads');
    expect(r).not.toContain('receive-meta');
  });

  it('購入を選ぶと value・currency・transaction_id の項目が出る', () => {
    const r = ids({ platforms: ['ga4', 'google_ads'], events: ['purchase'], conditions: [] });
    expect(r).toEqual(expect.arrayContaining([
      'purchase-params-design', 'value-number', 'currency-set', 'ga4-transaction-id', 'gads-transaction-id', 'ga4-value-type', 'reload-thanks',
    ]));
  });

  it('媒体とイベントの両方に当てはまるときだけ出る', () => {
    expect(ids({ platforms: ['google_ads'], events: ['lead'], conditions: [] })).not.toContain('gads-transaction-id');
    expect(ids({ platforms: ['meta'], events: ['purchase'], conditions: [] })).not.toContain('gads-transaction-id');
  });

  it('フォームを選ぶと送信成功トリガーの項目が出る', () => {
    expect(ids({ platforms: ['ga4'], events: ['lead'], conditions: [] })).toContain('form-success-trigger');
    expect(ids(base)).not.toContain('form-success-trigger');
  });

  it('Meta の event_id 項目は Conversions API 併用時だけ', () => {
    const sel: Selection = { platforms: ['meta'], events: ['purchase'], conditions: [] };
    expect(ids(sel)).not.toContain('meta-event-id');
    expect(ids({ ...sel, conditions: ['metaCapi'] })).toEqual(expect.arrayContaining(['meta-event-id', 'meta-dedup-test']));
    // Meta を選んでいなければ CAPI にチェックしても出ない
    expect(ids({ platforms: ['ga4'], events: ['purchase'], conditions: ['metaCapi'] })).not.toContain('meta-event-id');
  });

  it('CMPの有無で同意の項目が切り替わる', () => {
    expect(ids(base)).toContain('consent-need');
    expect(ids(base)).not.toContain('consent-settings');
    const withCmp = ids({ ...base, conditions: ['cmp'] });
    expect(withCmp).not.toContain('consent-need');
    expect(withCmp).toEqual(expect.arrayContaining(['consent-plan', 'consent-settings', 'consent-denied-test']));
  });

  it('SPAを選ぶとSPAの項目が出る', () => {
    expect(ids(base)).not.toContain('spa-trigger');
    expect(ids({ ...base, conditions: ['spa'] })).toEqual(expect.arrayContaining(['spa-plan', 'spa-trigger', 'spa-preview']));
  });

  it('段階の順番は 設定前→設定中→公開前→公開後', () => {
    const order = generateChecklist({ platforms: ['ga4'], events: ['purchase'], conditions: [] }).map((s) => s.stage);
    expect(order).toEqual(['before', 'during', 'prepublish', 'after']);
  });
});

describe('isApplicable', () => {
  it('when がなければ常に true', () => {
    expect(isApplicable({ id: 'x', stage: 'before', title: '', how: '', ng: '' }, { platforms: [], events: [], conditions: [] })).toBe(true);
  });
});

describe('toMarkdown', () => {
  it('選択内容とチェック状態を出力する', () => {
    const sel: Selection = { platforms: ['ga4'], events: ['purchase'], conditions: ['spa'] };
    const md = toMarkdown(sel, generateChecklist(sel), new Set(['publish']));
    expect(md).toContain('- 媒体: GA4');
    expect(md).toContain('- イベント: 購入');
    expect(md).toContain('- 条件: SPA');
    expect(md).toContain('## 設定前');
    expect(md).toContain('- [x] GTMのコンテナを公開する');
    expect(md).toContain('- [ ] 1回の操作でタグが1回だけ発火するか確認する');
    expect(md).toContain('  - NG例: ');
  });
});

describe('sanitizeSelection', () => {
  it('未知の値や壊れたデータを取り除く', () => {
    expect(sanitizeSelection({ platforms: ['ga4', 'tiktok'], events: 'purchase', conditions: ['spa'] }))
      .toEqual({ platforms: ['ga4'], events: [], conditions: ['spa'], yahoo: DEFAULT_YAHOO });
    expect(sanitizeSelection(null)).toEqual({ platforms: [], events: [], conditions: [], yahoo: DEFAULT_YAHOO });
    expect(sanitizeSelection({ yahoo: { search: false, display: 'x', displayTag: 'legacy' } }).yahoo)
      .toEqual({ search: false, display: true, displayTag: 'legacy' });
  });
});

describe('Yahoo!広告', () => {
  const y = (search: boolean, display: boolean, displayTag: 'new' | 'legacy'): Selection =>
    ({ platforms: ['yahoo'], events: ['lead'], conditions: [], yahoo: { search, display, displayTag } });

  it('yahooFlags: 検索広告は常に従来の構成', () => {
    expect(yahooFlags({ search: true, display: false, displayTag: 'new' }).sort()).toEqual(['legacy', 'search']);
    expect(yahooFlags({ search: false, display: true, displayTag: 'new' }).sort()).toEqual(['display', 'newTag']);
    expect(yahooFlags({ search: true, display: true, displayTag: 'new' }).sort()).toEqual(['display', 'legacy', 'newTag', 'search']);
  });

  it('検索×従来：サイトジェネラルタグと自動タグ設定が出て、計測タグの項目は出ない', () => {
    const r = ids(y(true, false, 'new'));
    expect(r).toEqual(expect.arrayContaining(['yahoo-plan', 'yahoo-autotag', 'yahoo-legacy-tags', 'yahoo-received', 'yahoo-cv-recorded']));
    expect(r).not.toContain('yahoo-new-tags');
  });

  it('ディスプレイ×計測タグ：スニペットと新旧併用の項目が出て、従来の項目は出ない', () => {
    const r = ids(y(false, true, 'new'));
    expect(r).toEqual(expect.arrayContaining(['yahoo-new-tags', 'yahoo-no-mix']));
    expect(r).not.toContain('yahoo-legacy-tags');
    expect(r).not.toContain('yahoo-autotag');
  });

  it('ディスプレイ×従来：従来の項目だけ', () => {
    const r = ids(y(false, true, 'legacy'));
    expect(r).toContain('yahoo-legacy-tags');
    expect(r).not.toContain('yahoo-new-tags');
  });

  it('タグ受信と成果の計上は別項目', () => {
    expect(ids(y(true, true, 'new'))).toEqual(expect.arrayContaining(['yahoo-received', 'yahoo-cv-recorded']));
  });

  it('取引IDは購入を選んだときだけ', () => {
    expect(ids(y(true, false, 'new'))).not.toContain('yahoo-transaction-id');
    expect(ids({ ...y(true, false, 'new'), events: ['purchase'] })).toContain('yahoo-transaction-id');
  });

  it('Yahoo!を選んでいなければYahoo!の項目は出ない', () => {
    expect(ids({ ...y(true, true, 'new'), platforms: ['ga4'] }).some((i) => i.startsWith('yahoo'))).toBe(false);
  });

  it('Markdownに広告の種類とタグの構成を書く', () => {
    const sel = y(true, true, 'new');
    const md = toMarkdown(sel, generateChecklist(sel));
    expect(md).toContain('- Yahoo!広告: 検索広告（従来の構成）、ディスプレイ広告（計測タグ）');
    expect(md).toContain('- [ ] 【Yahoo!広告】タグの受信を管理画面で確認する');
  });
});
