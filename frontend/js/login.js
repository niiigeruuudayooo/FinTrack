document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || `Login failed (status ${res.status})`);
        return;
      }
  
      const data = await res.json();
      const token = data.token;
      if (token) {
        localStorage.setItem('token', token);
        window.location.href = 'dashboard.html';
      } else {
        alert('Login succeeded but no token received.');
      }
  
    } catch (error) {
      console.error('Login error:', error);
      alert('Unable to login, please try again later.');
    }
  });
  