// ----------------------
// Protect the dashboard
// ----------------------
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// ----------------------
// Global chart instance
// ----------------------
let expenseChartInstance = null;

// ----------------------
// Fetch transactions
// ----------------------
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return [];
  }
}

// ----------------------
// Render transaction table
// ----------------------
function renderTransactionTable(transactions) {
  const tbody = document.querySelector('#transactionsTable tbody');
  tbody.innerHTML = '';

  // Show latest 10 transactions
  transactions.slice(0, 10).forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.type}</td>
      <td>$${t.amount.toFixed(2)}</td>
      <td>${t.category}</td>
      <td>${new Date(t.date).toLocaleDateString()}</td>
      <td>${t.paymentMethod || ''}</td>
    `;
    tbody.appendChild(row);
  });
}

// ----------------------
// Render / Update Chart.js smoothly
// ----------------------
function renderExpenseChart(transactions) {
    const categoryTotals = {};
  
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });
  
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
  
    if (expenseChartInstance) {
      // Update existing chart
      expenseChartInstance.data.labels = labels;
      expenseChartInstance.data.datasets[0].data = data;
      expenseChartInstance.update();
    } else {
      // Create chart for the first time
      const ctx = document.getElementById('expenseChart').getContext('2d');
      expenseChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { // ✅ Fixed: Added 'data' property key
          labels: labels,
          datasets: [{
            label: 'Expenses by Category',
            data: data, // ✅ Also fixed missing colon (optional, but clearer)
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

// ----------------------
// Add New Transaction
// ----------------------
document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const type = document.getElementById('type').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const paymentMethod = document.getElementById('paymentMethod').value;

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

      // Re-fetch and update table & chart
      const transactions = await fetchTransactions();
      renderTransactionTable(transactions);
      renderExpenseChart(transactions);
    } else {
      alert(data.message || 'Failed to add transaction');
    }
  } catch (err) {
    console.error('Error adding transaction:', err);
    alert('Error adding transaction');
  }
});

// ----------------------
// Logout handler
// ----------------------
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// ----------------------
// Initial page load
// ----------------------
(async () => {
  const transactions = await fetchTransactions();
  renderTransactionTable(transactions);
  renderExpenseChart(transactions);
})();
