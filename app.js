const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const today        = new Date();
const CURRENT_MONTH = MONTHS[today.getMonth()];
const CURRENT_YEAR  = today.getFullYear();
const MONTH_KEY     = `${CURRENT_MONTH}-${CURRENT_YEAR}`;
const MONTH_DISPLAY = `${CURRENT_MONTH} ${CURRENT_YEAR}`;

document.querySelectorAll(
  '#incomeMonthHero, #expenseMonthHero, #budgetMonthHero, #advisorMonthHero'
).forEach(el => el.textContent = MONTH_DISPLAY);

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');

  if (pageId === 'page-main')    refreshDashboard();
  if (pageId === 'page-report')  renderReport();
  if (pageId === 'page-budget')  checkBudgetStatus();
}

function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active',  tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('formLogin').classList.toggle('active',  tab === 'login');
  document.getElementById('formSignup').classList.toggle('active', tab === 'signup');
}

function setMsg(id, text, ok) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'form-msg ' + (ok ? 'msg-ok' : 'msg-err');
}

function doSignup() {
  const user = document.getElementById('signupUser').value.trim();
  const pass = document.getElementById('signupPass').value.trim();
  if (!user || !pass) { setMsg('signupMsg', 'Fill all fields!', false); return; }

  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.username === user)) {
    setMsg('signupMsg', 'Username already taken!', false); return;
  }
  users.push({ username: user, password: pass });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', user);
  setMsg('signupMsg', 'Account created! Redirecting…', true);
  setTimeout(() => enterDashboard(), 1000);
}

function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.username === user && u.password === pass)) {
    localStorage.setItem('currentUser', user);
    setMsg('loginMsg', 'Welcome back! Loading…', true);
    setTimeout(() => enterDashboard(), 900);
  } else {
    setMsg('loginMsg', 'Invalid credentials.', false);
  }
}

function doLogout() {
  localStorage.removeItem('currentUser');
  showPage('page-login');
}

function enterDashboard() {
  refreshDashboard();
  showPage('page-main');
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('currentUser')) enterDashboard();
});

function currentUser() {
  return localStorage.getItem('currentUser') || 'defaultUser';
}

function calcIncome() {
  const data    = JSON.parse(localStorage.getItem('income')) || {};
  const entries = data[currentUser()]?.[MONTH_KEY];
  let total = 0;
  if (entries) {
    if (Array.isArray(entries)) entries.forEach(e => total += e.amount);
    else total = entries.amount;
  }
  return total;
}

function calcExpense() {
  const data    = JSON.parse(localStorage.getItem('expenses')) || {};
  const entries = data[currentUser()]?.[MONTH_KEY];
  let total = 0;
  if (entries) {
    if (Array.isArray(entries)) entries.forEach(e => total += e.amount);
    else total = entries.amount;
  }
  return total;
}

function fmt(n) { return '₹' + n.toLocaleString('en-IN'); }

/* Returns a flat array of entries: [{mode, amount, date}] for the given type ('income'|'expenses') */
function getEntries(type) {
  const data    = JSON.parse(localStorage.getItem(type)) || {};
  const entries = data[currentUser()]?.[MONTH_KEY];
  if (!entries) return [];
  return Array.isArray(entries) ? entries : [entries];
}

/* Groups entries by their `mode` (type/category) and returns sorted totals */
function groupByCategory(entries) {
  const groups = {};
  entries.forEach(e => {
    const key = e.mode || 'Other';
    groups[key] = (groups[key] || 0) + e.amount;
  });
  return Object.entries(groups)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

const CATEGORY_COLORS = ['#10b981','#3b82f6','#f59e0b','#7c3aed','#ef4444','#ec4899','#06b6d4','#84cc16'];

function categoryColor(index) { return CATEGORY_COLORS[index % CATEGORY_COLORS.length]; }

function refreshDashboard() {
  const u = currentUser();
  document.getElementById('userNameMain').textContent    = u;
  document.getElementById('userAvatarMain').textContent  = u[0].toUpperCase();
  document.getElementById('greetingName').textContent    = u;

  const hr = today.getHours();
  document.getElementById('timeGreeting').textContent =
    hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
  document.getElementById('dashMonth').textContent =
    `Here's your financial snapshot for ${MONTH_DISPLAY}`;

  const inc = calcIncome();
  const exp = calcExpense();
  const sav = Math.max(0, inc - exp);

  document.getElementById('dashIncome').textContent  = fmt(inc);
  document.getElementById('dashExpense').textContent = fmt(exp);
  document.getElementById('dashSavings').textContent = fmt(sav);
}

function saveIncome() {
  const date   = document.getElementById('incomeDate').value;
  const mode   = document.getElementById('incomeMode').value;
  const amount = document.getElementById('incomeAmount').value;
  const msg    = document.getElementById('incomeMsg');

  if (!date || !mode || !amount) {
    msg.textContent = 'Please fill all fields!';
    msg.className = 'form-msg msg-err'; return;
  }

  let all = JSON.parse(localStorage.getItem('income')) || {};
  const u = currentUser();
  if (!all[u]) all[u] = {};
  if (!all[u][MONTH_KEY] || !Array.isArray(all[u][MONTH_KEY])) {
    all[u][MONTH_KEY] = all[u][MONTH_KEY] ? [all[u][MONTH_KEY]] : [];
  }
  all[u][MONTH_KEY].push({ mode, amount: parseFloat(amount), date });
  localStorage.setItem('income', JSON.stringify(all));

  msg.textContent = '✓ Income saved!';
  msg.className = 'form-msg msg-ok';

  document.getElementById('incomeDate').value   = '';
  document.getElementById('incomeMode').value   = '';
  document.getElementById('incomeAmount').value = '';

  setTimeout(() => showPage('page-main'), 1000);
}

function saveExpense() {
  const date   = document.getElementById('expenseDate').value;
  const mode   = document.getElementById('expenseMode').value;
  const amount = document.getElementById('expenseAmount').value;
  const msg    = document.getElementById('expenseMsg');

  if (!date || !mode || !amount) {
    msg.textContent = 'Please fill all fields!';
    msg.className = 'form-msg msg-err'; return;
  }

  let all = JSON.parse(localStorage.getItem('expenses')) || {};
  const u = currentUser();
  if (!all[u]) all[u] = {};
  if (!all[u][MONTH_KEY] || !Array.isArray(all[u][MONTH_KEY])) {
    all[u][MONTH_KEY] = all[u][MONTH_KEY] ? [all[u][MONTH_KEY]] : [];
  }
  all[u][MONTH_KEY].push({ mode, amount: parseFloat(amount), date });
  localStorage.setItem('expenses', JSON.stringify(all));

  msg.textContent = '✓ Expense saved!';
  msg.className = 'form-msg msg-ok';

  document.getElementById('expenseDate').value   = '';
  document.getElementById('expenseMode').value   = '';
  document.getElementById('expenseAmount').value = '';

  setTimeout(() => showPage('page-main'), 1000);
}

function saveBudget() {
  const amount = document.getElementById('budgetAmount').value;
  const msg    = document.getElementById('budgetMsg');

  if (!amount || parseFloat(amount) <= 0) {
    msg.textContent = 'Enter a valid budget!';
    msg.className = 'form-msg msg-err'; return;
  }

  let all = JSON.parse(localStorage.getItem('budgets')) || {};
  const u = currentUser();
  if (!all[u]) all[u] = {};
  const existed = !!all[u][MONTH_KEY];
  all[u][MONTH_KEY] = parseFloat(amount);
  localStorage.setItem('budgets', JSON.stringify(all));

  msg.textContent = existed ? '✓ Budget updated!' : '✓ Budget saved!';
  msg.className = 'form-msg msg-ok';
  checkBudgetStatus();
  setTimeout(() => showPage('page-main'), 1500);
}

function checkBudgetStatus() {
  const all    = JSON.parse(localStorage.getItem('budgets')) || {};
  const budget = all[currentUser()]?.[MONTH_KEY];
  const statusEl = document.getElementById('budgetStatus');

  if (!budget) { statusEl.style.display = 'none'; return; }

  document.getElementById('budgetAmount').value = budget;
  const expense = calcExpense();
  const pct = Math.min(100, Math.round((expense / budget) * 100));

  statusEl.style.display = 'block';
  document.getElementById('budgetStatusText').textContent =
    `Spent ${fmt(expense)} of ${fmt(budget)} budget (${pct}%)`;

  const bar = document.getElementById('budgetBar');
  bar.style.width      = pct + '%';
  bar.style.background = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--gold)' : 'var(--green)';
}

async function analyzeAdvisor() {
  const income    = calcIncome();
  const expense   = calcExpense();
  const savings   = Math.max(0, income - expense);
  const overspent = expense > income ? expense - income : 0;
  const resultEl  = document.getElementById('advisorResult');
  const btn       = document.getElementById('advisorBtn');
  const msg       = document.getElementById('advisorMsg');

  msg.textContent = '';
  msg.className = 'form-msg';

  if (income === 0) {
    resultEl.classList.add('visible');
    document.getElementById('ar-advice').innerHTML =
      '<h4>⚠️ No Data</h4><p>No income data found for this month. Add income first.</p>';
    return;
  }

  if (typeof window.GEMINI_API_KEY !== 'string' || !window.GEMINI_API_KEY) {
    resultEl.classList.remove('visible');
    msg.textContent = '⚠️ Gemini API key not configured. Add it to config.js (see config.example.js).';
    msg.className = 'form-msg msg-err';
    return;
  }

  const pct = (expense / income) * 100;

  btn.disabled = true;
  btn.textContent = '🤖 Analysing…';

  const incomeBreakdown  = groupByCategory(getEntries('income'));
  const expenseBreakdown = groupByCategory(getEntries('expenses'));

  const prompt = `You are a friendly Indian personal finance advisor inside a budgeting app. Analyse this user's month and respond with ONLY a JSON object (no markdown fences, no preamble) in this exact shape:
{
  "statusLabel": "short 2-4 word status e.g. 'Overspending' or 'Excellent'",
  "statusTier": "one of: excellent | balanced | high | over",
  "adviceTitle": "short title with one emoji, e.g. '🚀 Wealth Building Plan'",
  "adviceHtml": "2-4 sentences of specific, actionable investment/savings advice for this exact data, formatted with <br> for line breaks, amounts in ₹ INR"
}

User's financial data for ${MONTH_DISPLAY}:
- Total Income: ₹${income.toLocaleString('en-IN')}
- Total Expense: ₹${expense.toLocaleString('en-IN')}
- Net Savings: ₹${savings.toLocaleString('en-IN')}
- Spend Rate: ${Math.round(pct)}%
- Income by source: ${JSON.stringify(incomeBreakdown)}
- Expense by category: ${JSON.stringify(expenseBreakdown)}
${overspent > 0 ? `- Overspent by: ₹${overspent.toLocaleString('en-IN')}` : ''}

Tailor the advice to the actual categories above (e.g. call out if one expense category dominates). Keep it concise and practical for an Indian retail investor (mention SIPs, mutual funds, FDs, index funds where relevant).`;

  // Model name set in config.js as GEMINI_MODEL (defaults below).
  // Google updates free-tier model names/quotas over time — if this
  // stops working, test other model names and update GEMINI_MODEL
  // in your config.js to whichever one returns real results for you.
  const model = window.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': window.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No text content in API response.');

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const result  = JSON.parse(cleaned);

    document.getElementById('ar-income').textContent  = fmt(income);
    document.getElementById('ar-expense').textContent = fmt(expense);
    document.getElementById('ar-savings').textContent = fmt(savings);
    document.getElementById('ar-rate').textContent    = `${Math.round(pct)}%`;
    document.getElementById('ar-status').innerHTML    =
      `<span class="status-pill ${result.statusTier}">${result.statusLabel}</span>`;
    document.getElementById('ar-advice').innerHTML    =
      `<h4>${result.adviceTitle}</h4><p>${result.adviceHtml}${
        overspent > 0
          ? `<br><br><strong style="color:var(--red)">⚠️ Overspent by ${fmt(overspent)}</strong>`
          : ''
      }</p>`;

    resultEl.classList.add('visible');
  } catch (err) {
    console.error('Gemini Advisor error:', err);
    msg.textContent = '⚠️ Could not reach Gemini. Check your API key, model name, and connection.';
    msg.className = 'form-msg msg-err';
    resultEl.classList.remove('visible');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 Analyse Now';
  }
}

let barChart, pieChart;

function renderBreakdown(containerId, entries, total) {
  const container = document.getElementById(containerId);
  if (!entries.length) {
    container.innerHTML = '<p class="breakdown-empty">No entries recorded this month.</p>';
    return;
  }
  const grouped = groupByCategory(entries);
  container.innerHTML = grouped.map((g, i) => {
    const pct = total > 0 ? Math.round((g.amount / total) * 100) : 0;
    const color = categoryColor(i);
    return `
      <div class="breakdown-row">
        <div class="breakdown-row-main">
          <span class="breakdown-dot" style="background:${color}"></span>
          <span class="breakdown-name">${g.name}</span>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>
        <span class="breakdown-pct">${pct}%</span>
        <span class="breakdown-amount">${fmt(g.amount)}</span>
      </div>`;
  }).join('');
}

function renderTransactionTable(incomeEntries, expenseEntries) {
  const tbody = document.getElementById('txnTableBody');
  const rows = [
    ...incomeEntries.map(e => ({ ...e, type: 'income' })),
    ...expenseEntries.map(e => ({ ...e, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="breakdown-empty">No transactions yet.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.date || '—'}</td>
      <td><span class="txn-pill ${r.type}">${r.type === 'income' ? 'Income' : 'Expense'}</span></td>
      <td>${r.mode || 'Other'}</td>
      <td class="txn-amount ${r.type}">${r.type === 'income' ? '+' : '−'}${fmt(r.amount)}</td>
    </tr>`).join('');
}

function renderReport() {
  const incomeEntries  = getEntries('income');
  const expenseEntries = getEntries('expenses');
  const income  = calcIncome();
  const expense = calcExpense();
  const savings = Math.max(0, income - expense);

  document.getElementById('reportMonthLabel').textContent = MONTH_DISPLAY;
  document.getElementById('rpt-income').textContent  = fmt(income);
  document.getElementById('rpt-expense').textContent = fmt(expense);
  document.getElementById('rpt-savings').textContent = fmt(savings);

  renderBreakdown('rptIncomeBreakdown', incomeEntries, income);
  renderBreakdown('rptExpenseBreakdown', expenseEntries, expense);
  renderTransactionTable(incomeEntries, expenseEntries);

  /* Destroy old charts before re-render */
  if (barChart) { barChart.destroy(); barChart = null; }
  if (pieChart) { pieChart.destroy(); pieChart = null; }

  const COLORS      = ['#10b981', '#ef4444', '#3b82f6'];
  const GRID_COLOR  = 'rgba(255,255,255,.06)';
  const TICK_COLOR  = '#6b5f8a';
  const LEGEND_COLOR = '#b8aed8';

  barChart = new Chart(document.getElementById('rptBar'), {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense', 'Savings'],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: COLORS,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          grid:  { color: GRID_COLOR },
          ticks: { color: TICK_COLOR, callback: v => '₹' + v.toLocaleString('en-IN') }
        },
        x: {
          grid:  { display: false },
          ticks: { color: TICK_COLOR }
        }
      }
    }
  });

  pieChart = new Chart(document.getElementById('rptPie'), {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense', 'Savings'],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: COLORS,
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: LEGEND_COLOR, padding: 16 }
        }
      }
    }
  });
}
