<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let petitions: string | any[] = [];
  let authToken: any;
  let errorMessage;

  // ดึงค่า authToken จาก store ของ SvelteKit
  $: authToken = $page.data.authToken;

  // ฟังก์ชันดึงข้อมูล petitions ทั้งหมดและแสดงข้อมูลที่มี currentLevelId = 1
  async function fetchPetitions() {
    if (!authToken) {
      petitions = [];
      errorMessage = 'คุณไม่ได้รับอนุญาต';
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/petitions/subcommittee', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const allPetitions = await response.json();
        // กรองเฉพาะ petitions ที่มี currentLevelId เป็น 1
        petitions = allPetitions.filter(petition => {
          return petition.currentLevelId === 2;
        });
      } else {
        errorMessage = 'Failed to fetch petitions';
      }
    } catch (error) {
      errorMessage = 'Error fetching petitions: ' + error.message;
    }
  }

  // ฟังก์ชันเปลี่ยนหน้า
  function goToDirectorPage(id: number) {
    goto(`/considerations/committee/referee?id=${id}`);
  }

  // เรียกใช้ฟังก์ชันเมื่อ component ถูกโหลด
  onMount(() => {
    fetchPetitions();
  });
</script>

<div class="container mx-auto px-4 py-8">
  {#if !authToken}
    <div class="text-red-500 text-center mt-4">คุณไม่ได้รับอนุญาต</div>
  {:else}
  <h1 class="text-2xl font-bold mb-4">
    รายการคำร้องขอจริยธรรมการวิจัยในมนุษย์ (ขั้นกรรมการ)
  </h1>

  <div class="table-container">
    <table class="min-w-full bg-white">
      <thead>
        <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <th class="py-3 px-6 text-left">ผู้วิจัย</th>
          <th class="py-3 px-6 text-left">เลขที่เอกสาร</th>
          <th class="py-3 px-6 text-left">ชื่อเรื่องภาษาไทย</th>
          <th class="py-3 px-6 text-left">ขั้นตอนปัจจุบัน</th>
          <th class="py-3 px-6 text-left">สถานะเอกสาร</th>
          <th class="py-3 px-6 text-left">วันที่สร้าง</th>
          <th class="py-3 px-6 text-center">ข้อมูลคำร้อง</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        {#if petitions.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500"
              >ไม่พบข้อมูลคำร้อง</td
            >
          </tr>
        {:else}
          {#each petitions as petition, index}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th.length > 11 ? petition.title_th.substring(0, 11) + '...' : petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div>
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}>ตรวจสอบ</button
                >
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .table-container {
    overflow-x: auto;
    margin-top: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
  }

  .research-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
  }

  .research-table th,
  .research-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  .research-table th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #1a202c;
  }

  .research-table tr:hover {
    background-color: #f1f5f9;
  }

  @media (max-width: 768px) {
    .table-container {
      margin: 1rem -1rem;
      border-radius: 0;
    }
  }
</style>
