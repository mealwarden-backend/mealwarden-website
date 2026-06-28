export function buildReportHTML(
  periodLabel: string,
  s: any, nut: any, wat: any, ins: any, wt: any,
  journey: any,
): string {
  const jRows = (journey?.entries || [])
    .map((e: any) => [
      '<tr>',
      '<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;">' + (e.week || e.label || '') + '</td>',
      '<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">' + (e.avgCalories ?? '–') + '</td>',
      '<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">' + (e.adherencePct != null ? e.adherencePct + '%' : '–') + '</td>',
      '<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">' + (e.weight ?? '–') + '</td>',
      '</tr>',
    ].join(''))
    .join('')

  const weightSection = wt?.hasData ? [
    '<div class="section">',
    '<h2>⚖️ Weight</h2>',
    '<div class="grid">',
    '<div class="stat"><div class="stat-val">' + wt.currentWeight + ' kg</div><div class="stat-lbl">Current</div></div>',
    '<div class="stat"><div class="stat-val">' + (wt.totalChange > 0 ? '+' : '') + wt.totalChange + ' kg</div><div class="stat-lbl">Change</div></div>',
    wt.bmi != null ? '<div class="stat"><div class="stat-val">' + wt.bmi + '</div><div class="stat-lbl">BMI</div></div>' : '',
    wt.bmiCategory ? '<div class="stat"><div class="stat-val" style="font-size:14px;">' + wt.bmiCategory + '</div><div class="stat-lbl">Category</div></div>' : '',
    '</div></div>',
  ].join('') : ''

  const waterSection = wat.daysTracked > 0 ? [
    '<div class="section">',
    '<h2>💧 Hydration</h2>',
    '<p style="font-size:14px;color:#374151;">Avg <strong>' + (wat.avgGlasses ?? 0) + '</strong> glasses/day &middot; Goal <strong>' + (wat.goalGlasses ?? 8) + '</strong> &middot; <strong>' + wat.daysTracked + '</strong> days tracked</p>',
    '</div>',
  ].join('') : ''

  const journeySection = jRows ? [
    '<div class="section">',
    '<h2>📈 Journey Summary</h2>',
    '<table><thead><tr><th>Period</th><th>Avg Calories</th><th>Adherence</th><th>Weight</th></tr></thead>',
    '<tbody>' + jRows + '</tbody></table>',
    '</div>',
  ].join('') : ''

  const insightRows = [
    ins.wins     ? '<div class="insight"><strong>🏆 Wins:</strong> '     + (Array.isArray(ins.wins)     ? ins.wins.join(' · ')     : ins.wins)     + '</div>' : '',
    ins.focus    ? '<div class="insight"><strong>🎯 Focus:</strong> '    + (Array.isArray(ins.focus)    ? ins.focus.join(' · ')    : ins.focus)    + '</div>' : '',
    ins.keepGoing? '<div class="insight"><strong>💪 Keep going:</strong> '+ (Array.isArray(ins.keepGoing)? ins.keepGoing.join(' · '): ins.keepGoing) + '</div>' : '',
  ].join('')

  const insightsSection = (ins.wins || ins.focus || ins.keepGoing) ? [
    '<div class="section">',
    '<h2>🌟 Guardian Insights</h2>',
    insightRows,
    '</div>',
  ].join('') : ''

  return [
    '<!DOCTYPE html><html><head><meta charset="UTF-8">',
    '<title>MealWarden Progress Report</title>',
    '<style>',
    'body{font-family:\'Segoe UI\',Arial,sans-serif;color:#052e16;margin:40px;max-width:800px;}',
    'h1{font-size:28px;font-weight:900;color:#052e16;margin-bottom:4px;}',
    '.sub{font-size:14px;color:#6b7280;margin-bottom:32px;}',
    '.badge{display:inline-block;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;border-radius:100px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:24px;}',
    '.section{margin-bottom:28px;}',
    '.section h2{font-size:16px;font-weight:800;color:#052e16;border-bottom:2px solid #f0fdf4;padding-bottom:8px;margin-bottom:14px;}',
    '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}',
    '.stat{background:#f9fafb;border-radius:10px;padding:14px;text-align:center;}',
    '.stat-val{font-size:22px;font-weight:900;color:#16a34a;}',
    '.stat-lbl{font-size:11px;color:#9ca3af;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;}',
    'table{width:100%;border-collapse:collapse;font-size:13px;}',
    'th{background:#052e16;color:#fff;padding:8px 12px;text-align:left;font-size:12px;}',
    'tr:nth-child(even) td{background:#f9fafb;}',
    '.insight{background:#f0fdf4;border-left:3px solid #16a34a;padding:10px 14px;margin-bottom:10px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.6;}',
    '.footer{margin-top:48px;font-size:11px;color:#9ca3af;text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;}',
    '</style></head><body>',
    '<h1>MealWarden Progress Report</h1>',
    '<div class="sub">Generated on ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) + ' &middot; Period: ' + periodLabel + '</div>',
    '<div class="badge">🛡️ Your meals have a guardian now.</div>',
    '<div class="section"><h2>📊 Summary</h2><div class="grid">',
    '<div class="stat"><div class="stat-val">' + (s.adherencePct != null ? s.adherencePct + '%' : '–') + '</div><div class="stat-lbl">Adherence</div></div>',
    '<div class="stat"><div class="stat-val">' + (s.streak != null ? s.streak + ' days' : '–') + '</div><div class="stat-lbl">Streak</div></div>',
    '<div class="stat"><div class="stat-val">' + (s.avgDailyCalories ? s.avgDailyCalories + ' kcal' : '–') + '</div><div class="stat-lbl">Avg Calories/day</div></div>',
    '<div class="stat"><div class="stat-val">' + (s.loggedDays ?? '–') + '</div><div class="stat-lbl">Days Logged</div></div>',
    '</div></div>',
    '<div class="section"><h2>💪 Avg Daily Macros</h2><div class="grid">',
    '<div class="stat"><div class="stat-val">' + (nut.proteinG ?? 0) + 'g</div><div class="stat-lbl">Protein</div></div>',
    '<div class="stat"><div class="stat-val">' + (nut.carbsG ?? 0) + 'g</div><div class="stat-lbl">Carbs</div></div>',
    '<div class="stat"><div class="stat-val">' + (nut.fatG ?? 0) + 'g</div><div class="stat-lbl">Fat</div></div>',
    '<div class="stat"><div class="stat-val">' + (nut.fiberG ?? 0) + 'g</div><div class="stat-lbl">Fiber</div></div>',
    '</div></div>',
    weightSection,
    waterSection,
    journeySection,
    insightsSection,
    '<div class="footer">MealWarden &middot; mealwarden.com &middot; Exported ' + new Date().toISOString().slice(0, 10) + '</div>',
    '</body></html>',
  ].join('')
}
