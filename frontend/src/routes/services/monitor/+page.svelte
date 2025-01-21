<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let petitions = [];
  let filteredPetitions = [];
  let filteredPetitionsStatus1 = [];
  let filteredPetitionsCurrentLevel2 = []; // For currentLevelId: 2 and statusId: 2
  let filteredPetitionsStatus4 = []; // New variable for statusId: 4
  let filteredPetitionsStatus3 = []; // New variable for statusId: 3
  let filteredPetitionsType3 = []; // New variable for typeId: 3

  let searchPhone = "";

  async function fetchPetitions() {
    try {
      const response = await fetch("http://localhost:8000/petitions/all");
      if (response.ok) {
        petitions = await response.json();
        // Filter petitions with typeId: 3 and statusId: 2
        filteredPetitions = petitions.filter(petition => 
          petition.typeId === 3 && petition.statusId === 2
        );
        // Filter petitions with statusId: 1
        filteredPetitionsStatus1 = petitions.filter(petition => 
          petition.statusId === 1
        );
        // Filter petitions with currentLevelId: 2, statusId: 2, and typeId: 1 or 2
        filteredPetitionsCurrentLevel2 = petitions.filter(petition => 
          petition.currentLevelId === 2 && 
          petition.statusId === 2 && 
          (petition.typeId === 1 || petition.typeId === 2)
        );
        // Filter petitions with statusId: 4
        filteredPetitionsStatus4 = petitions.filter(petition => 
          petition.statusId === 4
        );
        // Filter petitions with statusId: 3
        filteredPetitionsStatus3 = petitions.filter(petition => 
          petition.statusId === 3
        );
        // Filter petitions with typeId: 3
        filteredPetitionsType3 = petitions.filter(petition => 
          petition.typeId === 3
        );
      } else {
        console.error("Failed to fetch petitions");
      }
    } catch (error) {
      console.error("Error fetching petitions:", error);
    }
  }

  function goToDirectorPage(id: number) {
    goto(`monitor/follow?id=${id}`);
  }

  onMount(() => {
    fetchPetitions();
  });

  async function searchPetitions() {
    try {
      if (searchPhone.trim() === "") {
        // If search input is empty, show all filtered petitions
        filteredPetitions = petitions.filter(petition => 
          petition.typeId === 3 && petition.statusId === 2
        );
        // Show all petitions with statusId: 1
        filteredPetitionsStatus1 = petitions.filter(petition => 
          petition.statusId === 1
        );
        // Show all petitions with currentLevelId: 2 and statusId: 2
        filteredPetitionsCurrentLevel2 = petitions.filter(petition => 
          petition.currentLevelId === 2 && 
          petition.statusId === 2 && 
          (petition.typeId === 1 || petition.typeId === 2)
        );
        // Show all petitions with statusId: 4
        filteredPetitionsStatus4 = petitions.filter(petition => 
          petition.statusId === 4
        );
        // Show all petitions with statusId: 3
        filteredPetitionsStatus3 = petitions.filter(petition => 
          petition.statusId === 3
        );
        // Show all petitions with typeId: 3
        filteredPetitionsType3 = petitions.filter(petition => 
          petition.typeId === 3
        );
        return;
      }

      const response = await fetch(
        `http://localhost:8000/petitions/search?telNo=${searchPhone}`
      );
      if (response.ok) {
        const searchedPetitions = await response.json();
        // Filter the searched petitions based on the same criteria
        filteredPetitions = searchedPetitions.filter(petition => 
          petition.typeId === 3 && petition.statusId === 2
        );
        // Filter searched petitions with statusId: 1
        filteredPetitionsStatus1 = searchedPetitions.filter(petition => 
          petition.statusId === 1
        );
        // Filter searched petitions with currentLevelId: 2 and statusId: 2
        filteredPetitionsCurrentLevel2 = searchedPetitions.filter(petition => 
          petition.currentLevelId === 2 && 
          petition.statusId === 2 && 
          (petition.typeId === 1 || petition.typeId === 2)
        );
        // Filter searched petitions with statusId: 4
        filteredPetitionsStatus4 = searchedPetitions.filter(petition => 
          petition.statusId === 4
        );
        // Filter searched petitions with statusId: 3
        filteredPetitionsStatus3 = searchedPetitions.filter(petition => 
          petition.statusId === 3
        );
        // Filter searched petitions with typeId: 3
        filteredPetitionsType3 = searchedPetitions.filter(petition => 
          petition.typeId === 3
        );
      } else {
        console.error("Failed to fetch petitions");
      }
    } catch (error) {
      console.error("Error fetching petitions:", error);
    }
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-4">
    ติดตามการพิจารณาคำร้องขอจริยธรรมการวิจัยในมนุษย์
  </h1>
  

  <!-- Existing tables for statusId: 1 and currentLevelId: 2 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (รออนุมัติ)</h2>
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
        {#if filteredPetitionsStatus1.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each filteredPetitionsStatus1 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div> <!-- Changed to blue -->
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div> <!-- Default case if needed -->
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}
                >รายละเอียด</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- New Table for petitions with currentLevelId: 2 and statusId: 2 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (อนุมัติแล้ว)</h2>
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
        {#if filteredPetitionsCurrentLevel2.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each filteredPetitionsCurrentLevel2 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div> <!-- Changed to blue -->
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div> <!-- Default case if needed -->
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}
                >รายละเอียด</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- New Table for petitions with statusId: 4 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (ปรับปรุงเอกสาร)</h2>
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
        {#if filteredPetitionsStatus4.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each filteredPetitionsStatus4 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div> <!-- Changed to blue -->
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div> <!-- Default case if needed -->
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}
                >รายละเอียด</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- New Table for petitions with statusId: 3 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (ไม่ผ่านการอนุมัติ)</h2>
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
        {#if filteredPetitionsStatus3.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each filteredPetitionsStatus3 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div> <!-- Changed to blue -->
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div> <!-- Default case if needed -->
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}
                >รายละเอียด</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- New Table for petitions with typeId: 3 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (เข้าข่ายยกเว้นการรับรอง)</h2>
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
        {#if filteredPetitionsType3.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each filteredPetitionsType3 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">
                {petition.researcher}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.correspondenceNo}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.currentLevel}
              </td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">{petition.statusDescription}</div> <!-- Changed to blue -->
                {:else if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">{petition.statusDescription}</div>
                {:else if petition.statusId === 4}
                  <div class="badge badge-warning badge-outline">{petition.statusDescription}</div>
                {:else}
                  <div class="badge badge-danger badge-outline">{petition.statusDescription}</div> <!-- Default case if needed -->
                {/if}
              </td>
              <td class="py-3 px-6 text-left">
                {petition.created_at}
              </td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => goToDirectorPage(petition.id)}
                >รายละเอียด</button>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
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
    margin-bottom: 2rem; /* Added bottom margin for spacing */
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