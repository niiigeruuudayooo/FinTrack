document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await res.json();
      console.log('Login response:', data); // Debug - check what the backend returns
  
      // Try to find token no matter what key name is used
      const token = data.token || data.accessToken || data.jwt;
  
      if (res.ok && token) {
        // Save token
        localStorage.setItem('token', token);
  
        // Optional: store user info if returned
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
  
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        // Show message from backend or fallback
        alert(data.message || 'Login failed, please check your credentials.');
      }
  
    } catch (error) {
      console.error('Login error:', error);
      alert('Unable to login. Please try again later.');
    }
  });
  