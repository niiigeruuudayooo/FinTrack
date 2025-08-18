// ===== Auth Protection =====
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// ===== State =====
let budgetGoals = [];

// ===== DOM Elements =====
const budgetGoalsContainer = document.getElementById('budgetGoalsContainer');
const budgetGoalForm = document.getElementById('budgetGoalForm');

// ===== Fetch Budgets from Backend =====
async function fetchBudgets() {
  try {
    const res = await fetch('/api/budgets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch budget goals');
    budgetGoals = await res.json();
    renderBudgetGoals();
  } catch (err) {
    console.error('Error fetching budgets:', err);
  }
}

// ===== Render Budgets =====
function renderBudgetGoals() {
  budgetGoalsContainer.innerHTML = '';

  if (!budgetGoals.length) {
    budgetGoalsContainer.innerHTML = '<p>No budget goals yet.</p>';
    return;
  }

  budgetGoals.forEach(goal => {
    const progressPercent = Math.min((goal.current / goal.max) * 100, 100);

    const card = document.createElement('div');
    card.className = 'budget-card dash-card';
    card.innerHTML = `
      <h4 class="goal-title">${goal.name}</h4>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
      </div>
      <p class="goal-info">Spent: $${goal.current.toFixed(2)} / $${goal.max.toFixed(2)}</p>
      <button class="btn btn-danger delete-goal" data-id="${goal._id}">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;
    budgetGoalsContainer.appendChild(card);
  });

  // Attach delete handlers
  document.querySelectorAll('.delete-goal').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const goalId = e.currentTarget.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this budget goal?')) {
        await deleteBudgetGoal(goalId);
      }
    });
  });
}

// ===== Delete Goal =====
async function deleteBudgetGoal(id) {
  try {
    const res = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
      alert('Budget goal deleted.');
      fetchBudgets();
    } else {
      alert(data.message || 'Failed to delete budget goal');
    }
  } catch (err) {
    console.error('Error deleting budget goal:', err);
    alert('Error deleting budget goal');
  }
}

// ===== Add Goal Handler =====
budgetGoalForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('goalName').value.trim();
  const max = parseFloat(document.getElementById('goalAmount').value);
  const current = parseFloat(document.getElementById('currentSpending').value) || 0;

  if (!name || isNaN(max)) {
    alert('Please fill in all fields correctly.');
    return;
  }

  try {
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, max, current })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Budget goal added!');
      budgetGoalForm.reset();
      fetchBudgets();
    } else {
      alert(data.message || 'Failed to save budget goal');
    }
  } catch (err) {
    console.error('Error saving budget goal:', err);
    alert('Error saving budget goal');
  }
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', fetchBudgets);

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
