/* DeepPet V10.46: deterministic, shared 7/30-day chart presentation.
 * Values are never interpolated, smoothed, randomized or re-scored.
 * The 30-day series supplies BOTH 7-day and 30-day y-axis domains. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DeepPetTrendDisplay1046 = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  function normalize(input) {
    const byDate = new Map();
    for (const entry of input || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry?.date || '')) continue;
      const value = finite(entry.value) ? entry.value : null;
      byDate.set(entry.date, {date: entry.date, value});
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
  function domain(full, mode = 'adaptive') {
    if (mode === 'percent') return [0, 100];
    const vals = normalize(full).map(x => x.value).filter(finite);
    if (!vals.length) return [0, 100];
    const lo = Math.min(...vals), hi = Math.max(...vals);
    // Exact fixed domain calculated once from the full 30-day data, including
    // for the 7-day suffix. An almost-ceiling score is not forced to look flat.
    const spread = Math.max(4, hi - lo), pad = spread * .22;
    const bottom = Math.max(0, Math.floor((lo - pad) * 10) / 10);
    const top = Math.min(mode === 'score' ? 100 : Infinity,
      Math.ceil((hi + pad) * 10) / 10);
    return top > bottom ? [bottom, top] : [Math.max(0, lo - 2), lo + 2];
  }
  function shape(full, days, opts = {}) {
    const list = normalize(full);
    const selected = list.slice(-days);
    const bounds = domain(list, opts.mode || 'adaptive');
    const [min, max] = bounds, W = 350, H = 172, L = 43, R = 12, T = 15, B = 37;
    const x = i => L + (W - L - R) * i / Math.max(1, selected.length - 1);
    const y = val => T + (max - val) / Math.max(.001, max - min) * (H - T - B);
    let path = '', open = false;
    const points = selected.map((item, i) => {
      if (!finite(item.value)) {open = false; return {...item, i, x: x(i), y: null};}
      const px = x(i), py = y(item.value);
      path += (open ? ' L ' : ' M ') + px.toFixed(2) + ' ' + py.toFixed(2);
      open = true;
      return {...item, i, x: px, y: py};
    });
    return {points, path: path.trim(), bounds, width: W, height: H,
      left: L, right: R, top: T, bottom: B, valid: points.filter(p => finite(p.value)).length};
  }
  function chart(full, days, options = {}) {
    const normalized = normalize(full), d = shape(normalized, days, options);
    if (!d.valid) return '<div class="dp1046-trend-empty">N/A</div>';
    const color = options.color || '#4387dc';
    const title = options.title || '', unit = options.unit || '';
    const tickValue = v => (Math.abs(v) >= 100 || Number.isInteger(v)) ? String(Math.round(v)) : v.toFixed(1);
    const scale = [0, .5, 1].map(q => {
      const py = d.top + q * (d.height - d.top - d.bottom);
      const n = d.bounds[1] - q * (d.bounds[1] - d.bounds[0]);
      return `<line x1="${d.left}" x2="${d.width-d.right}" y1="${py}" y2="${py}" stroke="#dfe6f1"/><text x="${d.left-6}" y="${py+3}" text-anchor="end" fill="#657a91" font-size="10">${tickValue(n)}</text>`;
    }).join('');
    const plotted = d.points.filter(p => p.y !== null);
    const marks = plotted.map(p => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.2" fill="#fff" stroke="${color}" stroke-width="2"><title>${escape(p.date)} · ${tickValue(p.value)} ${escape(unit)}</title></circle>`).join('');
    const selected = d.points, last = selected.length - 1;
    const candidates = [...new Set([0, Math.floor(last/2), last])];
    const ticks = candidates.map(i => `<text x="${selected[i].x.toFixed(2)}" y="${d.height-11}" text-anchor="${i===0?'start':i===last?'end':'middle'}" font-size="10" fill="#667c94">${selected[i].date.slice(5).replace('-','/')}</text>`).join('');
    const misses = selected.filter(p => p.value === null).length;
    const gapNote = misses ? `<small class="dp1046-trend-gaps">${escape(options.missing || '缺測日期以 N/A 表示，不補算')}</small>` : '';
    return `<div class="dp1046-trend" data-chart-kind="${escape(options.kind||'')}" data-chart-days="${days}" data-chart-values="${escape(JSON.stringify(selected.map(p=>({date:p.date,value:p.value}))))}"><div class="dp1046-trend-title"><b>${escape(title)}</b><span>${escape(unit)}</span></div><svg viewBox="0 0 ${d.width} ${d.height}" role="img" aria-label="${escape(title)}" preserveAspectRatio="xMidYMid meet">${scale}<line x1="${d.left}" y1="${d.top}" x2="${d.left}" y2="${d.height-d.bottom}" stroke="#9babc0"/><line x1="${d.left}" y1="${d.height-d.bottom}" x2="${d.width-d.right}" y2="${d.height-d.bottom}" stroke="#9babc0"/><path d="${d.path}" stroke="${color}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>${marks}${ticks}</svg>${gapNote}</div>`;
  }
  return Object.freeze({normalize, domain, shape, chart});
});
