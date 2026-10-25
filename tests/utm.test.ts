import { describe, expect, it } from 'vitest';
import { buildUrl, checkIssues, normalizeParams, normalizeValue, predictChannel, PRESETS } from '../src/lib/utm';

describe('normalizeValue', () => {
  it('全角を半角にし、小文字化し、空白を置き換える', () => {
    expect(normalizeValue('　Spring Sale　２０２６ ')).toBe('spring_sale_2026');
  });
  it('オプションで置き換えを止められる', () => {
    expect(normalizeValue('Spring Sale', { lowercase: false, spaceReplacement: null })).toBe('Spring Sale');
    expect(normalizeValue('Spring Sale', { lowercase: true, spaceReplacement: '-' })).toBe('spring-sale');
  });
});

describe('buildUrl', () => {
  const p = { utm_source: 'x', utm_medium: 'social', utm_campaign: 'launch' };

  it('基本形', () => {
    const r = buildUrl('https://example.com/lp', p);
    expect(r).toEqual({ ok: true, url: 'https://example.com/lp?utm_source=x&utm_medium=social&utm_campaign=launch' });
  });
  it('既存クエリを残し、#の前に付ける', () => {
    const r = buildUrl('https://example.com/lp?ref=a#form', p);
    expect(r.ok && r.url).toBe('https://example.com/lp?ref=a&utm_source=x&utm_medium=social&utm_campaign=launch#form');
  });
  it('既存のUTMは上書きする', () => {
    const r = buildUrl('https://example.com/?utm_source=old', p);
    expect(r.ok && r.url).toBe('https://example.com/?utm_source=x&utm_medium=social&utm_campaign=launch');
  });
  it('スキーム省略時は https を補う', () => {
    const r = buildUrl('example.com', p);
    expect(r.ok && r.url).toBe('https://example.com/?utm_source=x&utm_medium=social&utm_campaign=launch');
  });
  it('日本語や空白はエンコードする（空白は%20）', () => {
    const r = buildUrl('https://example.com', { utm_source: 'x', utm_medium: 'social', utm_campaign: '春 セール' });
    expect(r.ok && r.url).toBe('https://example.com/?utm_source=x&utm_medium=social&utm_campaign=%E6%98%A5%20%E3%82%BB%E3%83%BC%E3%83%AB');
  });
  it('不正なURLや http(s) 以外はエラー', () => {
    expect(buildUrl('', p).ok).toBe(false);
    expect(buildUrl('ht tp://bad url', p).ok).toBe(false);
    expect(buildUrl('ftp://example.com', p).ok).toBe(false);
    expect(buildUrl('javascript:alert(1)', p).ok).toBe(false);
  });
});

describe('predictChannel', () => {
  const cases: [Record<string, string>, string][] = [
    [{ utm_source: 'google', utm_medium: 'cpc' }, 'Paid Search'],
    [{ utm_source: 'yahoo', utm_medium: 'cpc' }, 'Paid Search'],
    [{ utm_source: 'facebook', utm_medium: 'paid_social' }, 'Paid Social'],
    [{ utm_source: 'x', utm_medium: 'social' }, 'Organic Social'],
    [{ utm_source: 'line', utm_medium: 'social' }, 'Organic Social'],
    [{ utm_source: 'newsletter', utm_medium: 'email' }, 'Email'],
    [{ utm_source: 'yahoo', utm_medium: 'display' }, 'Display'],
    [{ utm_source: 'youtube', utm_medium: 'cpv' }, 'Paid Video'],
    [{ utm_source: 'partner', utm_medium: 'affiliate' }, 'Affiliates'],
    [{ utm_source: 'blog', utm_medium: 'referral' }, 'Referral'],
    [{ utm_source: 'flyer', utm_medium: 'qr' }, 'Unassigned'],
    [{ utm_source: 'x', utm_medium: 'sns' }, 'Unassigned'], // x も sns も一覧・ルールにない
    [{ utm_source: 'mybrand', utm_medium: 'sns' }, 'Unassigned'],
    [{ utm_source: 'criteo', utm_medium: 'retargeting' }, 'Paid Other'],
    [{ utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'pmax_cross-network' }, 'Cross-network'],
    [{ utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'shopping_brand' }, 'Paid Shopping'],
    // Googleの一覧で line はソーシャル。オーガニック ソーシャルがメールより先に評価される
    [{ utm_source: 'line', utm_medium: 'email' }, 'Organic Social'],
    [{ utm_source: 'line_oa', utm_medium: 'email' }, 'Email'],
    // x は一覧にない。twitter はある
    [{ utm_source: 'x', utm_medium: 'paid_social' }, 'Paid Other'],
    [{ utm_source: 'twitter', utm_medium: 'paid_social' }, 'Paid Social'],
    [{ utm_source: 'note', utm_medium: 'social' }, 'Organic Social'],
  ];
  it.each(cases)('%o → %s', (params, expected) => {
    expect(predictChannel(params)).toBe(expected);
  });
});

describe('checkIssues', () => {
  const run = (base: string, raw: Record<string, string>) => checkIssues(base, raw, normalizeParams(raw));

  it('必須が空ならエラー', () => {
    const issues = run('https://example.com', { utm_source: 'x' });
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(2);
  });
  it('medium=sns を警告', () => {
    const issues = run('https://example.com', { utm_source: 'x', utm_medium: 'SNS', utm_campaign: 'a' });
    expect(issues.some((i) => i.message.includes('utm_medium=sns'))).toBe(true);
  });
  it('medium=mail を警告', () => {
    const issues = run('https://example.com', { utm_source: 'n', utm_medium: 'mail', utm_campaign: 'a' });
    expect(issues.some((i) => i.message.includes('email を使いましょう'))).toBe(true);
  });
  it('gclid 混入を警告', () => {
    const issues = run('https://example.com/?gclid=abc', { utm_source: 'x', utm_medium: 'social', utm_campaign: 'a' });
    expect(issues.some((i) => i.message.includes('gclid'))).toBe(true);
  });
  it('line＋email はソーシャルになると警告', () => {
    const issues = run('https://example.com', { utm_source: 'line', utm_medium: 'email', utm_campaign: 'a' });
    expect(issues.some((i) => i.message.includes('line_oa'))).toBe(true);
  });
  it('x＋paid_social は twitter を勧める', () => {
    const issues = run('https://example.com', { utm_source: 'x', utm_medium: 'paid_social', utm_campaign: 'a' });
    expect(issues.some((i) => i.message.includes('twitter'))).toBe(true);
  });
  it('プリセットはすべて警告なしで意図したチャネルになる', () => {
    const expected: Record<string, string> = {
      'x-organic': 'Organic Social', 'x-ads': 'Paid Social', 'meta-ads': 'Paid Social', instagram: 'Organic Social',
      line: 'Email', note: 'Organic Social', email: 'Email', 'yahoo-display': 'Display', 'yahoo-search': 'Paid Search', qr: 'Unassigned',
    };
    for (const p of PRESETS) {
      const params = { ...p.params, utm_campaign: 'test' };
      expect(predictChannel(params), p.id).toBe(expected[p.id]);
      const warns = run('https://example.com', params).filter((i) => i.severity !== 'info');
      expect(warns, p.id).toEqual([]);
    }
  });
  it('正しい入力なら何も出ない', () => {
    expect(run('https://example.com', { utm_source: 'x', utm_medium: 'social', utm_campaign: 'launch' })).toEqual([]);
  });
});
