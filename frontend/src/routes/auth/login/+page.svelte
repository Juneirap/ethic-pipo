<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';

  let username = '';
  let password = '';
  let errorMessage = '';

  onMount(() => {
    // Check if already authenticated
    if ($auth.isAuthenticated) {
      goto('/home');
    }
  });

  async function login() {
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        console.log('Login successful');
        
        // Update auth store
        auth.set({
          isAuthenticated: true,
          user: data.user,
          token: data.authToken
        });
        
        goto('/home');
      } else {
        errorMessage = data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
      console.error('Login error:', error);
    }
  }
</script>

<div class="login-container">
  <form on:submit|preventDefault={login} class="login-form">
    <h2>เข้าสู่ระบบ</h2>
    <p>ใส่เบอร์โทรศัพท์เพื่อเข้าสู่ระบบ</p>
    
    {#if errorMessage}
      <div class="error-message">
        {errorMessage}
      </div>
    {/if}
    
    <div class="input-group">
      <input type="text" bind:value={username} placeholder="Username" required />
    </div>
    <div class="input-group">
      <input type="password" bind:value={password} placeholder="Password" required />
    </div>
    <button type="submit" class="submit-button">Login</button>
  </form>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f9f9f9;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .login-form {
    background-color: #fff;
    padding: 3rem 2.5rem;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 480px;
    min-height: 450px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 2rem;
    color: #222;
  }

  p {
    margin-bottom: 2rem;
    font-size: 1rem;
    color: #666;
  }

  .input-group {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.9rem 1rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fdfdfd;
    transition: border-color 0.3s ease;
  }

  input[type="text"]:focus,
  input[type="password"]:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 6px rgba(0, 123, 255, 0.4);
  }

  .error-message {
    background-color: #fff2f2;
    color: #dc3545;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    width: 100%;
    text-align: center;
  }

  button.submit-button {
    width: 100%;
    padding: 1rem;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  button.submit-button:hover {
    background-color: #0056b3;
    transform: translateY(-3px);
  }

  button.submit-button:active {
    background-color: #003f8a;
    transform: translateY(0);
  }
</style>
