// ==================
// Transactions Page
// ==================

// Redirect to login if no token
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Data store
let allTransactions = [];

// DOM Elements
const tableBody = document.querySelector('#transactionsTable tbody');
const searchInput = document.getElementById('searchTransactions');
const sortSelect = document.getElementById('sortTransactions');

// Fetch transactions from API
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const data = await res.json();
    allTransactions = data;
    renderTransactions(allTransactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    tableBody.innerHTML = `<tr class="txh-empty"><td colspan="5">Error loading transactions.</td></tr>`;
  }
}

// Render table rows
function renderTransactions(transactions) {
  tableBody.innerHTML = '';

  if (!transactions.length) {
    tableBody.innerHTML = `<tr class="txh-empty"><td colspan="5">No transactions found.</td></tr>`;
    return;
  }

  transactions.forEach(tx => {
    const row = document.createElement('tr');
    row.classList.add('row', tx.type);

    const date = new Date(tx.date).toLocaleDateString();
    const amountClass = tx.type === 'income' ? 'amt pos' : 'amt neg';

    row.innerHTML = `
      <td>${date}</td>
      <td>${tx.category}</td>
      <td>${tx.paymentMethod || ''}</td>
      <td class="right ${amountClass}">$${tx.amount.toFixed(2)}</td>
      <td>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
    `;

    tableBody.appendChild(row);
  });
}

// Apply filters and sorting
function applyFilters() {
  let filtered = [...allTransactions];
  const query = searchInput.value.trim().toLowerCase();

  if (query) {
    filtered = filtered.filter(
      tx =>
        tx.category.toLowerCase().includes(query) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(query))
    );
  }

  const sortBy = sortSelect.value;
  filtered.sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'amountHigh') {
      return b.amount - a.amount;
    } else if (sortBy === 'amountLow') {
      return a.amount - b.amount;
    }
    return 0;
  });

  renderTransactions(filtered);
}

// Event listeners
searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Init
fetchTransactions();
