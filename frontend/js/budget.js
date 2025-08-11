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

// ===== Render Goals =====
function renderBudgetGoals() {
  budgetGoalsContainer.innerHTML = '';

  budgetGoals.forEach((goal, index) => {
    const progressPercent = Math.min((goal.current / goal.max) * 100, 100);

    const card = document.createElement('div');
    card.className = 'budget-card dash-card';
    card.innerHTML = `
      <h4 class="goal-title">${goal.name}</h4>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
      </div>
      <p class="goal-info">Spent: $${goal.current.toFixed(2)} / $${goal.max.toFixed(2)}</p>
    `;
    budgetGoalsContainer.appendChild(card);
  });
}

// ===== Add Goal Handler =====
budgetGoalForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('goalName').value.trim();
  const max = parseFloat(document.getElementById('goalAmount').value);
  const current = parseFloat(document.getElementById('currentSpending').value);

  if (!name || isNaN(max) || isNaN(current)) {
    alert('Please fill all fields correctly.');
    return;
  }

  budgetGoals.push({ name, max, current });
  renderBudgetGoals();

  budgetGoalForm.reset();
});

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderBudgetGoals();
});

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});
