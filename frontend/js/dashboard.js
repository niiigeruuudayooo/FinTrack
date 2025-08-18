// ===== Auth Protection =====
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// ===== GLOBALS =====
let allTransactions = [];
let currentView = 'monthly';
let lastTotals = { income: 0, expense: 0, balance: 0 };

// ===== Fetch Transactions =====
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return [];
  }
}

// ===== Categories for Add Transaction =====
const incomeCategories = [
  "Salary", "Bonus", "Freelance", "Investments", "Other Income"
];
const expenseCategories = [
  "Groceries", "Rent", "Utilities", "Transportation", "Dining Out",
  "Entertainment", "Healthcare", "Education", "Travel", "Other Expense"
];

const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');

function populateCategoryOptions(categories) {
  categorySelect.innerHTML = '<option value="">Select</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

typeSelect?.addEventListener('change', () => {
  if (typeSelect.value === 'income') populateCategoryOptions(incomeCategories);
  else if (typeSelect.value === 'expense') populateCategoryOptions(expenseCategories);
  else categorySelect.innerHTML = '<option value="">Select</option>';
});

// ===== Grouping Helper =====
function groupByPeriod(transactions, period = 'monthly') {
  const groups = {};
  transactions.forEach(tx => {
    const date = new Date(tx.date || tx.createdAt);
    let key;
    if (period === 'daily') key = date.toISOString().slice(0, 10);
    else if (period === 'weekly') {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDays = (date - firstDayOfYear) / 86400000;
      const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${weekNumber}`;
    } else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groups[key]) groups[key] = { income: 0, expense: 0 };
    if (String(tx.type).toLowerCase() === 'income') groups[key].income += Number(tx.amount);
    else if (String(tx.type).toLowerCase() === 'expense') groups[key].expense += Number(tx.amount);
  });
  return groups;
}

// ===== Animation for Flash Cards =====
function animateValue(element, start, end, duration) {
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    element.textContent = `$${(start + (end - start) * progress).toFixed(2)}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ===== Update Totals =====
function updateTotalsView(transactions, period) {
  const grouped = groupByPeriod(transactions, period);
  const latestPeriodKey = Object.keys(grouped).sort().pop();
  const totals = grouped[latestPeriodKey] || { income: 0, expense: 0 };
  const balance = totals.income - totals.expense;

  animateValue(document.getElementById('totalIncome'), lastTotals.income, totals.income, 800);
  animateValue(document.getElementById('totalExpenses'), lastTotals.expense, totals.expense, 800);
  animateValue(document.getElementById('balance'), lastTotals.balance, balance, 800);

  lastTotals = { income: totals.income, expense: totals.expense, balance };
}

// ===== Render Transactions =====
function renderTransactionsTable(transactions) {
  const tbody = document.querySelector('#transactionsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  transactions.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tx.type}</td>
      <td>$${Number(tx.amount).toFixed(2)}</td>
      <td>${tx.category}</td>
      <td>${new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
      <td>${tx.paymentMethod || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== Render Expense Chart =====
function renderExpenseChart(transactions, period) {
  const ctx = document.getElementById('expenseChart')?.getContext('2d');
  if (!ctx) return;
  const grouped = groupByPeriod(transactions, period);
  const latestPeriodKey = Object.keys(grouped).sort().pop();

  const latestTx = transactions.filter(tx => {
    const txDate = new Date(tx.date || tx.createdAt);
    if (period === 'daily') return txDate.toISOString().slice(0, 10) === latestPeriodKey;
    else if (period === 'weekly') {
      const firstDay = new Date(txDate.getFullYear(), 0, 1);
      const days = (txDate - firstDay) / 86400000;
      const weekNumber = Math.ceil((days + firstDay.getDay() + 1) / 7);
      return latestPeriodKey === `${txDate.getFullYear()}-W${weekNumber}`;
    } else return latestPeriodKey === `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
  });

  const expenseData = latestTx.filter(tx => tx.type.toLowerCase() === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category || 'Other'] = (acc[tx.category || 'Other'] || 0) + Number(tx.amount);
      return acc;
    }, {});

  const labels = Object.keys(expenseData);
  const values = Object.values(expenseData);
  if (window.expenseChart) window.expenseChart.destroy();
  if (!labels.length) return;

  window.expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#4BC0C0', '#9966FF', '#FF9F40'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}

// ===== Budget Goals on Dashboard =====
async function fetchDashboardBudgets() {
  try {
    const res = await fetch('/api/budgets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch budget goals');
    renderDashboardBudgets(await res.json());
  } catch (err) {
    console.error('Error fetching budgets:', err);
  }
}

function renderDashboardBudgets(budgets) {
  const container = document.getElementById('dashboardBudgetGoalsContainer');
  if (!container) return;
  container.innerHTML = budgets.length
    ? budgets.map(goal => {
        const pct = Math.min((goal.current / goal.max) * 100, 100);
        return `
          <div class="budget-card dash-card">
            <h4 class="goal-title">${goal.name}</h4>
            <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
            <p class="goal-info">Spent: $${goal.current.toFixed(2)} / $${goal.max.toFixed(2)}</p>
          </div>`;
      }).join('')
    : '<p>No budget goals yet.</p>';
}

// ===== Main Loader =====
async function loadDashboardData() {
  allTransactions = await fetchTransactions();
  renderTransactionsTable(allTransactions);
  updateTotalsView(allTransactions, currentView);
  renderExpenseChart(allTransactions, currentView);
  await fetchDashboardBudgets();
}

// ===== View Switch Buttons =====
document.getElementById('viewDaily')?.addEventListener('click', () => { currentView = 'daily'; updateTotalsView(allTransactions, currentView); renderExpenseChart(allTransactions, currentView); });
document.getElementById('viewWeekly')?.addEventListener('click', () => { currentView = 'weekly'; updateTotalsView(allTransactions, currentView); renderExpenseChart(allTransactions, currentView); });
document.getElementById('viewMonthly')?.addEventListener('click', () => { currentView = 'monthly'; updateTotalsView(allTransactions, currentView); renderExpenseChart(allTransactions, currentView); });

// ===== Add Transaction Form =====
document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const type = typeSelect.value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = categorySelect.value;
  const paymentMethod = document.getElementById('paymentMethod').value;
  if (!type || isNaN(amount) || !category || !paymentMethod) { alert('Fill all fields'); return; }

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: type.toLowerCase(), amount, category, paymentMethod })
    });
    const data = await res.json();
    if (res.ok) { alert('Transaction added'); e.target.reset(); categorySelect.innerHTML = '<option value="">Select</option>'; loadDashboardData(); }
    else alert(data.message || 'Failed to add transaction');
  } catch (err) { console.error(err); alert('Error adding transaction'); }
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', loadDashboardData);

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', () => { localStorage.removeItem('token'); window.location.href = 'login.html'; });
