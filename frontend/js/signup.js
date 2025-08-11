document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    // Client-side validation
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
  
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || `Signup failed (status ${res.status})`);
        return;
      }
  
      const data = await res.json();
      const token = data.token;
  
      if (token) {
        localStorage.setItem('token', token);
        // Redirect to dashboard after successful signup
        window.location.href = 'dashboard.html';
      } else {
        alert('Signup succeeded but no token received.');
      }
  
    } catch (error) {
      console.error('Signup error:', error);
      alert('Unable to signup, please try again later.');
    }
  });
  