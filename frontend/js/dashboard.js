// ===== Auth Protection =====
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// ===== Smart Category Filter =====
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
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

typeSelect?.addEventListener('change', () => {
  if (typeSelect.value === 'income') {
    populateCategoryOptions(incomeCategories);
  } else if (typeSelect.value === 'expense') {
    populateCategoryOptions(expenseCategories);
  } else {
    categorySelect.innerHTML = '<option value="">Select</option>';
  }
});

// ===== Add Transaction =====
document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const type = typeSelect.value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = categorySelect.value;
  const paymentMethod = document.getElementById('paymentMethod').value;

  if (!type || !amount || !category || !paymentMethod) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ type, amount, category, paymentMethod })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Transaction added successfully!');
      e.target.reset();
      loadDashboardData();
    } else {
      alert(data.message || 'Failed to add transaction');
    }
  } catch (err) {
    console.error('Error adding transaction:', err);
    alert('Error adding transaction');
  }
});

// ===== Fetch Transactions =====
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ===== Render Transactions Table =====
function renderTransactionsTable(transactions) {
  const tbody = document.querySelector('#transactionsTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  transactions.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tx.type}</td>
      <td>$${tx.amount.toFixed(2)}</td>
      <td>${tx.category}</td>
      <td>${new Date(tx.date || tx.createdAt).toLocaleDateString()}</td>
      <td>${tx.paymentMethod || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== Render Expense Chart =====
function renderExpenseChart(transactions) {
    const ctx = document.getElementById('expenseChart')?.getContext('2d');
    if (!ctx) return;
  
    const expenseData = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {});
  
    const labels = Object.keys(expenseData);
    const values = Object.values(expenseData);
  
    // Destroy previous chart if exists
    if (window.expenseChart) window.expenseChart.destroy();
  
    window.expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: { // ✅ Added "data:"
        labels: labels,
        datasets: [{
          data: values, // ✅ Changed "values" to "data"
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56',
            '#4BC0C0', '#9966FF', '#FF9F40',
            '#C9CBCF', '#8A8A8A', '#B5E48C', '#FF8C42'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 20,
              padding: 10
            }
          }
        }
      }
    });
  }
  

// ===== Calculate and Update Totals =====
function updateTotals(transactions) {
  const totalIncomeValue = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpensesValue = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balanceValue = totalIncomeValue - totalExpensesValue;

  document.getElementById('totalIncome').textContent = `$${totalIncomeValue.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${totalExpensesValue.toFixed(2)}`;
  document.getElementById('balance').textContent = `$${balanceValue.toFixed(2)}`;
}

// ===== Load Dashboard Data =====
async function loadDashboardData() {
  const transactions = await fetchTransactions();
  renderTransactionsTable(transactions);
  renderExpenseChart(transactions);
  updateTotals(transactions);
}

document.addEventListener('DOMContentLoaded', loadDashboardData);

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
