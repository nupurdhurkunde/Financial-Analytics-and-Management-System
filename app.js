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

function analyzeAdvisor() {
  const income   = calcIncome();
  const expense  = calcExpense();
  const savings  = Math.max(0, income - expense);
  const overspent = expense > income ? expense - income : 0;
  const resultEl = document.getElementById('advisorResult');

  if (income === 0) {
    resultEl.classList.add('visible');
    document.getElementById('ar-advice').innerHTML =
      '<h4>⚠️ No Data</h4><p>No income data found for this month. Add income first.</p>';
    return;
  }

  const pct = (expense / income) * 100;
  let statusHtml, adviceTitle, adviceText, pillClass;

  if (pct > 90) {
    pillClass   = 'over';
    statusHtml  = `<span class="status-pill ${pillClass}">⚠️ Overspending</span>`;
    adviceTitle = '🚨 Emergency Plan';
    adviceText  = 'You are spending more than you earn. Stop all non-essential purchases immediately.';
  } else if (pct > 70) {
    pillClass   = 'high';
    statusHtml  = `<span class="status-pill ${pillClass}">⚠️ High Expenses</span>`;
    adviceTitle = '💡 Investment Plan';
    adviceText  = 'Your expenses are high. Start with small SIP investments of ₹500–2000/month in index funds or Fixed Deposits.';
  } else if (pct > 50) {
    pillClass   = 'balanced';
    statusHtml  = `<span class="status-pill ${pillClass}">⚖️ Balanced</span>`;
    adviceTitle = '📈 Growth Plan';
    adviceText  = 'Good balance!<br>Invest 30% of savings in Mutual Funds (equity)<br>20% in debt funds<br>Keep 10% as emergency fund.';
  } else {
    pillClass   = 'excellent';
    statusHtml  = `<span class="status-pill ${pillClass}">✅ Excellent</span>`;
    adviceTitle = '🚀 Wealth Building Plan';
    adviceText  = 'Outstanding!<br>40% in Index Funds<br>20% in Direct Stocks<br>20% in Gold<br>10% in Crypto (only if risk-tolerant)<br>10% in FD for liquidity.';
  }

  document.getElementById('ar-income').textContent  = fmt(income);
  document.getElementById('ar-expense').textContent = fmt(expense);
  document.getElementById('ar-savings').textContent = fmt(savings);
  document.getElementById('ar-rate').textContent    = `${Math.round(pct)}%`;
  document.getElementById('ar-status').innerHTML    = statusHtml;
  document.getElementById('ar-advice').innerHTML    =
    `<h4>${adviceTitle}</h4><p>${adviceText}${
      overspent > 0
        ? `<br><br><strong style="color:var(--red)">⚠️ Overspent by ${fmt(overspent)}</strong>`
        : ''
    }</p>`;

  resultEl.classList.add('visible');
}

let barChart, pieChart;

function renderReport() {
  const income  = calcIncome();
  const expense = calcExpense();
  const savings = Math.max(0, income - expense);

  document.getElementById('reportMonthLabel').textContent = MONTH_DISPLAY;
  document.getElementById('rpt-income').textContent  = fmt(income);
  document.getElementById('rpt-expense').textContent = fmt(expense);
  document.getElementById('rpt-savings').textContent = fmt(savings);

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