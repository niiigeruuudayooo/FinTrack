document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name = document.querySelector('#name').value.trim();
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();
  
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        // Save JWT token to local storage
        localStorage.setItem('token', data.token);
        alert('Signup successful! Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
      } else {
        alert(data.message || 'Signup failed, please try again');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('An error occurred while signing up.');
    }
  });
  