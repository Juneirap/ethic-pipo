<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { auth } from "$lib/stores/auth";

  let username = "";
  let password = "";
  let errorMessage = "";

  onMount(() => {
    // Check if already authenticated
    if ($auth.isAuthenticated) {
      goto("/home");
    }
  });

  async function login() {
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        console.log("Login successful");

        // Update auth store
        auth.set({
          isAuthenticated: true,
          user: data.user,
          token: data.authToken,
        });

        goto("/home");
      } else {
        errorMessage =
          data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ : ไม่มีข้อมูลในระบบ";
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      console.error("Login error:", error);
    }
  }
</script>

<div class="card">
  <div class="card-body">
    <h2 class="card-title">เข้าสู่ระบบ</h2>
    <p>ใส่เบอร์โทรศัพท์เพื่อเข้าสู่ระบบ</p>
    <div class="card-actions">
      <form on:submit|preventDefault={login} class="login-form">
        {#if errorMessage}
          <div class="error-message">
            {errorMessage}
          </div>
        {/if}

        <div>
          <input
            type="text"
            class="input input-bordered w-full max-w-xs mb-2"
            bind:value={username}
            placeholder="ผู้ใช้งาน"
            required
          />
        </div>
        <div>
          <input
            type="password"
            class="input input-bordered w-full max-w-xs mb-2"
            bind:value={password}
            placeholder="รหัสผ่าน"
            required
          />
        </div>

        <div class="flex justify-between">
          <button type="submit" class="btn btn-outline btn-primary">เข้าสู่ระบบ</button>
          <button type="reset" class="btn btn-outline btn-secondary">ยกเลิก</button>
        </div>
      </form>
    </div>
  </div>
</div>
