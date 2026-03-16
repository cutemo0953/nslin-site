#!/usr/bin/env node
/**
 * Generate an HTML email report from competitive intelligence proposals.
 * Visual style matches the family balance sheet weekly report (WeeklyReport.js).
 *
 * Usage:
 *   node scripts/generate-proposal-email.mjs
 *
 * Outputs: data/competitive-intel/proposal-email.html
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/competitive-intel');

// ── Style constants (matching WeeklyReport.js) ──

const S = {
  steel: '#2d5a8e',
  steelDark: '#1e3450',
  steelLight: '#f0f5fa',
  emerald: '#10b981',
  emeraldBg: '#ecfdf5',
  rose: '#f43f5e',
  roseBg: '#fff1f2',
  amber: '#f59e0b',
  amberBg: '#fffbeb',
  brass: '#b8964a',
  brassBg: '#faf8f0',
  slate700: '#334155',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  white: '#ffffff',
  radius: 'border-radius:12px;',
  cardShadow: 'box-shadow:0 1px 3px rgba(0,0,0,0.08);',
  font: "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
  tnum: 'font-variant-numeric:tabular-nums;letter-spacing:-0.01em;',
};

// ── Load data ──

const files = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith('proposals-') && f.endsWith('.json'));
if (files.length === 0) {
  console.log('No proposals found. No email generated.');
  process.exit(0);
}

files.sort();
const latestFile = files[files.length - 1];
const proposals = JSON.parse(fs.readFileSync(path.join(DATA_DIR, latestFile), 'utf-8'));

const entities = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'competitor-entities.json'), 'utf-8')).entities;
const entityMap = Object.fromEntries(entities.map((e) => [e.id, { name: `${e.brand} ${e.product}`, tier: e.tier }]));

const currentStates = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'competitor-current-state.json'), 'utf-8')).states;
const lastCollected = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'last-collected.json'), 'utf-8'));

// ── Helpers ──

function truncate(str, maxLen = 80) {
  if (!str) return '—';
  const s = typeof str === 'string' ? str : JSON.stringify(str);
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen) + '...';
}

// 來源等級 (Source Trust Level)
function sourceTrustBadge(sourceType) {
  const map = {
    official_site:  { level: 'S', label: '官網',   bg: S.emeraldBg, fg: S.emerald },
    press_release:  { level: 'A', label: '新聞稿', bg: S.emeraldBg, fg: S.emerald },
    patent:         { level: 'A', label: '專利',   bg: S.emeraldBg, fg: S.emerald },
    media_review:   { level: 'B', label: '媒體評測', bg: S.amberBg, fg: S.amber },
    retail:         { level: 'B', label: '零售平台', bg: S.amberBg, fg: S.amber },
    forum:          { level: 'C', label: '論壇',   bg: S.roseBg,    fg: S.rose },
    youtube:        { level: 'C', label: 'YouTube', bg: S.roseBg,   fg: S.rose },
  };
  const info = map[sourceType] || { level: '?', label: sourceType, bg: S.slate100, fg: S.slate400 };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${info.bg};color:${info.fg};">${info.level} ${info.label}</span>`;
}

// AI 把握度
function confidenceBadge(c) {
  const pct = Math.round(c * 100);
  let label, bg, fg;
  if (c >= 0.8)      { label = '高'; bg = S.emeraldBg; fg = S.emerald; }
  else if (c >= 0.6) { label = '中'; bg = S.amberBg;   fg = S.amber; }
  else               { label = '低'; bg = S.roseBg;     fg = S.rose; }
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${bg};color:${fg};">AI ${pct}% ${label}</span>`;
}

function changeTypeBadge(type) {
  const labels = {
    price_update: '價格',
    spec_update: '規格',
    new_product: '新品',
    discontinued: '停產',
    award: '獎項',
    patent: '專利',
    source_append: '來源',
  };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;background:${S.steelLight};color:${S.steel};">${labels[type] || type}</span>`;
}

// ── Staleness check ──

const today = new Date();
const staleEntities = [];
for (const state of currentStates) {
  if (!state.field_freshness) continue;
  const staleFields = [];
  for (const [field, dateStr] of Object.entries(state.field_freshness)) {
    const daysSince = Math.floor((today - new Date(dateStr)) / 86_400_000);
    if (daysSince > 30) {
      staleFields.push({ field, days: daysSince });
    }
  }
  if (staleFields.length > 0) {
    const info = entityMap[state.entity_id] || { name: state.entity_id };
    staleEntities.push({ name: info.name, fields: staleFields });
  }
}

// ── Group proposals by entity ──

const byEntity = {};
for (const p of proposals) {
  if (!byEntity[p.entity_id]) byEntity[p.entity_id] = [];
  byEntity[p.entity_id].push(p);
}

// ── Count by type ──

const priceChanges = proposals.filter((p) => p.change_type === 'price_update').length;
const specChanges = proposals.filter((p) => p.change_type === 'spec_update').length;
const otherChanges = proposals.length - priceChanges - specChanges;
const entitiesAffected = Object.keys(byEntity).length;

// ── Build HTML ──

let h = '';

// HTML document wrapper with UTF-8
h += `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#eef2f7;">`;

// Outer wrapper
h += `<div style="${S.font}max-width:640px;margin:0 auto;background:#eef2f7;padding:24px;">`;

// Header (matching weekly report style with N.S.-LIN brand colors)
h += `<div style="background:linear-gradient(135deg,${S.steelDark} 0%,${S.steel} 100%);color:white;padding:28px 24px;border-radius:16px 16px 0 0;text-align:center;">`;
h += `<div style="font-size:13px;opacity:0.6;letter-spacing:1px;text-transform:uppercase;">COMPETITIVE INTELLIGENCE</div>`;
h += `<h1 style="margin:8px 0 4px;font-size:24px;font-weight:700;">競品情報週報</h1>`;
h += `<div style="font-size:14px;opacity:0.7;">${lastCollected.date} | ${proposals.length} proposals</div>`;
h += `</div>`;

// Summary cards (3-column like balance sheet)
h += `<div style="background:${S.white};padding:20px 16px;border-bottom:1px solid #e2e8f0;">`;
h += `<table style="width:100%;border-collapse:separate;border-spacing:10px 0;"><tr>`;

// Total proposals
h += `<td style="width:33%;background:${S.steelLight};${S.radius}padding:16px 12px;text-align:center;border:1px solid #dae5f2;">`;
h += `<div style="font-size:11px;color:${S.slate400};font-weight:600;letter-spacing:0.5px;">提案總數</div>`;
h += `<div style="font-size:24px;font-weight:700;color:${S.steel};margin:6px 0;${S.tnum}">${proposals.length}</div>`;
h += `</td>`;

// Entities affected
h += `<td style="width:33%;background:${S.brassBg};${S.radius}padding:16px 12px;text-align:center;border:1px solid #e4d9ae;">`;
h += `<div style="font-size:11px;color:${S.slate400};font-weight:600;letter-spacing:0.5px;">涉及品牌</div>`;
h += `<div style="font-size:24px;font-weight:700;color:${S.brass};margin:6px 0;${S.tnum}">${entitiesAffected}</div>`;
h += `</td>`;

// Sources queried
h += `<td style="width:33%;background:${S.emeraldBg};${S.radius}padding:16px 12px;text-align:center;border:1px solid #a7f3d0;">`;
h += `<div style="font-size:11px;color:${S.slate400};font-weight:600;letter-spacing:0.5px;">來源查詢</div>`;
h += `<div style="font-size:24px;font-weight:700;color:${S.emerald};margin:6px 0;${S.tnum}">${lastCollected.sources_queried}</div>`;
h += `</td>`;

h += `</tr></table>`;

// Breakdown
h += `<div style="text-align:center;margin-top:10px;font-size:12px;color:${S.slate400};">`;
h += `價格 ${priceChanges} | 規格 ${specChanges} | 其他 ${otherChanges}`;
h += `</div></div>`;

// Material prices section
const mpFile = path.join(DATA_DIR, 'material-prices.json');
if (fs.existsSync(mpFile)) {
  const allSnapshots = JSON.parse(fs.readFileSync(mpFile, 'utf-8')).snapshots;
  if (allSnapshots.length > 0) {
    const latestDate = allSnapshots.map((s) => s.date).sort().pop();
    const latest = allSnapshots.filter((s) => s.date === latestDate);
    const prevDates = [...new Set(allSnapshots.map((s) => s.date))].filter((d) => d < latestDate).sort();
    const prevDate = prevDates.pop();
    const prev = prevDate ? allSnapshots.filter((s) => s.date === prevDate) : [];

    const directItems = latest.filter((s) => s.data_class === 'direct');
    const proxyItems = latest.filter((s) => s.data_class === 'proxy');

    h += `<div style="background:${S.white};padding:20px 16px;border-bottom:1px solid #e2e8f0;">`;
    h += `<div style="font-size:15px;font-weight:700;color:${S.slate700};margin-bottom:14px;">原材料行情</div>`;

    // Direct metals table
    if (directItems.length > 0) {
      h += `<div style="font-size:12px;font-weight:600;color:${S.slate500};margin-bottom:8px;">金屬（精確報價）</div>`;
      h += `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:12px;">`;
      h += `<tr>`;
      h += `<th style="padding:6px 10px;text-align:left;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">材料</th>`;
      h += `<th style="padding:6px 10px;text-align:right;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">台幣/公斤</th>`;
      h += `<th style="padding:6px 10px;text-align:right;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">週變化</th>`;
      h += `<th style="padding:6px 10px;text-align:center;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">來源</th>`;
      h += `</tr>`;

      for (const item of directItems) {
        const prevItem = prev.find((s) => s.material === item.material && s.data_class === 'direct');
        const changePct = prevItem
          ? ((item.price_twd_per_kg - prevItem.price_twd_per_kg) / prevItem.price_twd_per_kg) * 100
          : null;
        // 漲=紅（採購成本壓力）、跌=綠（利好）— N.S.-LIN 採購視角
        const changeStr = changePct !== null
          ? `<span style="color:${changePct > 0 ? S.rose : S.emerald};font-weight:600;">${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%</span>`
          : '—';

        h += `<tr>`;
        h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-weight:500;color:${S.slate700};">${item.material_zh}</td>`;
        h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;${S.tnum}color:${S.slate700};font-weight:600;">NT$ ${item.price_twd_per_kg.toFixed(1)}</td>`;
        h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:right;">${changeStr}</td>`;
        h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;text-align:center;"><a href="${item.source_url}" style="font-size:11px;color:${S.steel};text-decoration:none;">查看</a></td>`;
        h += `</tr>`;
      }
      h += `</table>`;
    }

    // Proxy materials card
    if (proxyItems.length > 0) {
      const oil = proxyItems[0];
      const prevOil = prev.find((s) => s.data_class === 'proxy');
      const oilChangePct = prevOil
        ? ((oil.proxy_price - prevOil.proxy_price) / prevOil.proxy_price) * 100
        : null;
      const oilChangeStr = oilChangePct !== null
        ? `<span style="color:${oilChangePct > 0 ? S.rose : S.emerald};font-weight:600;">${oilChangePct > 0 ? '▲' : '▼'} ${oilChangePct > 0 ? '+' : ''}${oilChangePct.toFixed(1)}%</span>`
        : '';
      const materialNames = proxyItems.map((s) => s.material_zh).join(' / ');

      h += `<div style="font-size:12px;font-weight:600;color:${S.slate500};margin-bottom:8px;">石化衍生材料（共享上游指標）</div>`;
      h += `<div style="background:${S.slate50};${S.radius}padding:14px 16px;border:1px solid #e2e8f0;">`;
      h += `<div style="font-size:12px;color:${S.slate500};margin-bottom:6px;">影響材料：${materialNames}</div>`;
      h += `<div style="font-size:16px;font-weight:700;color:${S.slate700};${S.tnum}">`;
      h += `WTI 原油：$${oil.proxy_price.toFixed(2)}/barrel ${oilChangeStr}`;
      h += `</div>`;
      h += `<div style="margin-top:4px;"><a href="${oil.source_url}" style="font-size:11px;color:${S.steel};text-decoration:none;">查看行情</a></div>`;
      h += `</div>`;
    }

    h += `<div style="font-size:10px;color:${S.slate400};margin-top:8px;font-style:italic;">`;
    h += `方向性上游指標。期貨價非採購成本，不含運輸、關稅、合金成分差異與加工損耗。黃銅≠純銅，鋁合金≠純鋁。`;
    h += `</div>`;

    // Link to report page
    h += `<div style="margin-top:8px;text-align:right;">`;
    h += `<a href="https://nslin-site.tom-e31.workers.dev/zh-TW/reports/competitive-landscape#material-prices"`;
    h += ` style="font-size:11px;color:${S.steel};text-decoration:none;">`;
    h += `查看完整報告 →</a>`;
    h += `</div>`;

    h += `</div>`;
  }
}

// Staleness alerts
if (staleEntities.length > 0) {
  h += `<div style="background:${S.amberBg};padding:16px 20px;border-left:4px solid ${S.amber};border-bottom:1px solid #fde68a;">`;
  h += `<div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:8px;">Staleness Alert</div>`;
  for (const { name, fields } of staleEntities) {
    h += `<div style="font-size:13px;color:${S.slate700};padding:2px 0;">`;
    h += `<span style="color:${S.amber};margin-right:6px;">&#9679;</span>`;
    h += `<strong>${name}</strong>: ${fields.map((f) => `${f.field} (${f.days}d)`).join(', ')}`;
    h += `</div>`;
  }
  h += `</div>`;
}

// Change details per entity
h += `<div style="background:${S.white};padding:20px;border-bottom:1px solid #e2e8f0;">`;
h += `<div style="font-size:15px;font-weight:700;color:${S.slate700};margin-bottom:14px;">變更明細</div>`;

for (const [entityId, entityProposals] of Object.entries(byEntity)) {
  const info = entityMap[entityId] || { name: entityId, tier: '?' };
  const tierLabel = ['REF', 'T1', 'T2', 'T3', 'T4'][info.tier] || '?';

  h += `<div style="margin-bottom:16px;border:1px solid #e2e8f0;${S.radius}overflow:hidden;">`;

  // Entity header
  h += `<div style="background:${S.slate50};padding:10px 14px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">`;
  h += `<span style="font-weight:600;color:${S.slate700};font-size:14px;">${info.name}</span>`;
  h += `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;background:${S.steelLight};color:${S.steel};">${tierLabel}</span>`;
  h += `</div>`;

  // Proposals table
  h += `<table style="width:100%;border-collapse:collapse;font-size:13px;">`;
  h += `<tr>`;
  h += `<th style="padding:8px 14px;text-align:left;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">欄位</th>`;
  h += `<th style="padding:8px 10px;text-align:left;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">舊值</th>`;
  h += `<th style="padding:8px 10px;text-align:left;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">新值</th>`;
  h += `<th style="padding:8px 14px;text-align:center;font-size:11px;color:${S.slate400};font-weight:600;border-bottom:1px solid #f1f5f9;">來源 / AI 把握度</th>`;
  h += `</tr>`;

  for (const p of entityProposals) {
    const oldDisplay = truncate(p.old_value, 80);
    const newDisplay = truncate(p.new_value, 80);

    h += `<tr>`;
    h += `<td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">`;
    h += `${changeTypeBadge(p.change_type)}`;
    h += `<div style="margin-top:4px;font-weight:500;color:${S.slate700};">${p.field}</div>`;
    h += `</td>`;
    h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;color:${S.slate500};${S.tnum}vertical-align:top;word-break:break-word;overflow-wrap:break-word;">${oldDisplay}</td>`;
    h += `<td style="padding:8px 10px;border-bottom:1px solid #f1f5f9;font-weight:600;color:${S.slate700};${S.tnum}vertical-align:top;word-break:break-word;overflow-wrap:break-word;">${newDisplay}</td>`;
    h += `<td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;text-align:center;vertical-align:top;">${sourceTrustBadge(p.evidence.source_type)}<br style="margin:4px 0;">${confidenceBadge(p.confidence)}</td>`;
    h += `</tr>`;

    // Source link row — four-branch rendering based on url_status
    const sourceLabels = { official_site: '官網', press_release: '新聞稿', patent: '專利', media_review: '媒體評測', retail: '零售平台', forum: '論壇', youtube: 'YouTube' };
    const srcLabel = sourceLabels[p.evidence.source_type] || p.evidence.source_type;
    const fullUrl = p.evidence.source_url;
    const urlStatus = p.evidence.url_status || 'unchecked';

    h += `<tr><td colspan="4" style="padding:0 14px 10px;border-bottom:1px solid #e2e8f0;">`;
    if (urlStatus === 'dead') {
      h += `<span style="font-size:11px;color:${S.slate400};text-decoration:line-through;word-break:break-all;" title="${fullUrl}">`;
      h += `${srcLabel} → ${truncate(fullUrl, 60)}</span>`;
      h += ` <span style="font-size:10px;color:${S.rose};font-weight:600;">[失效]</span>`;
    } else if (urlStatus === 'blocked') {
      h += `<a href="${fullUrl}" style="font-size:11px;color:${S.amber};text-decoration:none;word-break:break-all;" title="${fullUrl}">`;
      h += `${srcLabel} → ${truncate(fullUrl, 60)}</a>`;
      h += ` <span style="font-size:10px;color:${S.amber};font-weight:600;">[受限]</span>`;
    } else if (urlStatus === 'unreachable') {
      h += `<span style="font-size:11px;color:${S.slate400};word-break:break-all;" title="${fullUrl}">`;
      h += `${srcLabel} → ${truncate(fullUrl, 60)}</span>`;
      h += ` <span style="font-size:10px;color:${S.slate400};font-weight:600;">[離線]</span>`;
    } else {
      h += `<a href="${fullUrl}" style="font-size:11px;color:${S.steel};text-decoration:none;word-break:break-all;" title="${fullUrl}">`;
      h += `${srcLabel} → ${truncate(fullUrl, 60)}</a>`;
    }
    h += `</td></tr>`;
  }

  h += `</table></div>`;
}

h += `</div>`;

// Footer
h += `<div style="background:${S.slate50};padding:20px;border-radius:0 0 16px 16px;text-align:center;">`;
h += `<div style="font-size:13px;color:${S.slate500};margin-bottom:12px;">`;
h += `如需接受或拒絕提案，請回覆此信或通知 Tom。<br>`;
h += `下次自動收集：每週一 06:00`;
h += `</div>`;
h += `<a href="https://nslin-site.tom-e31.workers.dev/zh-TW/reports/competitive-landscape" style="display:inline-block;padding:10px 24px;background:${S.steel};color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">`;
h += `查看完整報告`;
h += `</a>`;
h += `</div>`;

// Close outer wrapper
h += `</div>`;
h += `</body></html>`;

// Write HTML
const outFile = path.join(DATA_DIR, 'proposal-email.html');
fs.writeFileSync(outFile, h, 'utf-8');
console.log(`Generated ${outFile} (${proposals.length} proposals)`);
