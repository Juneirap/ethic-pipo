<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { auth, clearAuth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  export let links: {
    href: string;
    text: string;
    icon: string;
    submenu?: {
      href: string;
      text: string;
      icon: string;
    }[];
  }[] = [];

  const dispatch = createEventDispatcher();

  function handleClick(link: {
    href: string;
    text: string;
    icon: string;
    submenu?: { href: string; text: string; icon: string }[];
  }) {
    dispatch("menuClick", { href: link.href, text: link.text });
  }

  function handleLogin() {
    if ($auth.isAuthenticated) {
      logout();
    } else {
      goto('/auth/login');
    }
  }

  onMount(async () => {
    await checkAuthStatus();
  });

  async function checkAuthStatus() {
    try {
      const res = await fetch("http://localhost:8000/auth/check", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        auth.set({
          isAuthenticated: true,
          user: data.user,
          token: data.authToken
        });
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      clearAuth();
    }
  }

  async function logout() {
    try {
      const res = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        clearAuth();
        goto('/auth/login');
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
</script>

<aside aria-label="Sidebar Navigation" class="sidebar">
  <ul class="menu">
    {#each links as link (link.href)}
      {#if link.text == "<hr>"}
        <hr class="mt-4 mb-4" />
      {:else if link.href.includes("considerations")}
        {#if $auth.isAuthenticated}
          <li>
            <a
              href={link.href}
              class="menu-item"
              on:click={() => handleClick(link)}
            >
              <i class={`icon ${link.icon}`}></i>
              <span>{link.text}</span>
            </a>
            {#if link.submenu}
              <ul class="submenu">
                {#each link.submenu as sublink (sublink.href)}
                  <li>
                    <a
                      href={sublink.href}
                      class="submenu-item"
                      on:click={() => handleClick(sublink)}
                    >
                      <i class={`icon ${sublink.icon}`}></i>
                      <span>{sublink.text}</span>
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          </li>
        {/if}
      {:else}
        <li>
          <a
            href={link.href}
            class="menu-item"
            on:click={() => handleClick(link)}
          >
            <i class={`icon ${link.icon}`}></i>
            <span>{link.text}</span>
          </a>
          {#if link.submenu}
            <ul class="submenu">
              {#each link.submenu as sublink (sublink.href)}
                <li>
                  <a
                    href={sublink.href}
                    class="submenu-item"
                    on:click={() => handleClick(sublink)}
                  >
                    <i class={`icon ${sublink.icon}`}></i>
                    <span>{sublink.text}</span>
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/if}
    {/each}
  </ul>

  <ul class="menu login">
    <hr/>
    <li>
      <button class="menu-item" on:click={handleLogin}>
        <i class={`icon fas fa-sign-${$auth.isAuthenticated ? 'out' : 'in'}-alt`}></i>
        {$auth.isAuthenticated ? 'ออกจากระบบ' : 'เข้าสู่ระบบ'}
      </button>
    </li>
  </ul>
</aside>

<style>
  .sidebar {
    background-color: #f4f4f4;
    padding: 1rem;
    width: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .menu {
    list-style: none;
    padding: 0.5rem;
  }

  .menu.login {
    margin-top: auto;
    margin-bottom: 2rem;
  }

  .menu-item,
  .submenu-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.25rem;
    text-decoration: none;
    color: #333;
    font-size: 1rem;
    font-weight: 500;
    margin: 0.2rem;
  }

  .menu-item:hover,
  .submenu-item:hover {
    background-color: #8d8d8d;
    color: #ffffff;
  }

  .menu-item-hr {
    color: #8d8d8d;
  }

  .icon {
    margin-right: 1rem;
    font-size: 1.25rem;
  }

  .submenu {
    margin-left: 1rem;
    margin-top: 0.5rem;
    list-style: none;
    padding: 0;
  }

  .active {
    background-color: #8d8d8d;
    color: #ffffff;
  }
</style>
