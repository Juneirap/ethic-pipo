<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  let petitions: string | any[] = [];
  let ongoingPetitions: any[] = [];
  let completedPetitions: any[] = [];
  let authToken: any;
  let errorMessage;
  let searchQuery = "";
  let searchResults = {
    ongoing: [],
    completed: []
  };
  let showSearchResults = false;

  // ดึงค่า authToken จาก store ของ SvelteKit
  $: authToken = $page.data.authToken;

  // ฟังก์ชันดึงข้อมูล petitions ทั้งหมดและแสดงข้อมูลที่มี currentLevelId = 1
  async function fetchPetitions() {
    if (!authToken) {
      petitions = [];
      ongoingPetitions = [];
      completedPetitions = [];
      errorMessage = "คุณไม่ได้รับอนุญาต";
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8000/petitions/subcommittee",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const allPetitions = await response.json();
        // กรองเฉพาะ petitions ที่มี currentLevelId เป็น 2
        petitions = allPetitions.filter((petition) => {
          return petition.currentLevelId === 2;
        });
        
        // แยกข้อมูลตาม statusId
        ongoingPetitions = petitions.filter(petition => 
          petition.statusId === 1 || petition.statusId === 4
        );
        completedPetitions = petitions.filter(petition => 
          petition.statusId === 2 || petition.statusId === 3
        );
      } else {
        errorMessage = "Failed to fetch petitions";
      }
    } catch (error) {
      errorMessage = "Error fetching petitions: " + error.message;
    }
  }

  // ฟังก์ชันค้นหาผู้วิจัย
  function searchResearcher() {
    if (!searchQuery.trim()) {
      showSearchResults = false;
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // ค้นหาในคำร้องที่กำลังดำเนินการ
    searchResults.ongoing = ongoingPetitions.filter(petition =>
      petition.researcher.toLowerCase().includes(query)
    );

    // ค้นหาในคำร้องที่เสร็จสิ้น
    searchResults.completed = completedPetitions.filter(petition =>
      petition.researcher.toLowerCase().includes(query)
    );

    showSearchResults = true;
  }

  // รีเซ็ตการค้นหา
  function resetSearch() {
    searchQuery = "";
    showSearchResults = false;
  }

  // ฟังก์ชันเปลี่ยนหน้า
  function goToDirectorPage(id: number) {
    goto(`/considerations/committee/referee?id=${id}`);
  }

  // Computed properties for pagination
  let currentPageStatus1and4 = 1;
  let currentPageStatus2and3 = 1;
  let itemsPerPage = 10;

  $: filteredPetitionsStatus1and4 = ongoingPetitions.filter(petition => 
    petition.statusId === 1 || petition.statusId === 4
  );

  $: filteredPetitionsStatus2and3 = completedPetitions.filter(petition => 
    petition.statusId === 2 || petition.statusId === 3
  );

  $: paginatedPetitionsStatus1and4 = filteredPetitionsStatus1and4.slice(
    (currentPageStatus1and4 - 1) * itemsPerPage,
    currentPageStatus1and4 * itemsPerPage
  );

  $: paginatedPetitionsStatus2and3 = filteredPetitionsStatus2and3.slice(
    (currentPageStatus2and3 - 1) * itemsPerPage,
    currentPageStatus2and3 * itemsPerPage
  );

  // Total pages
  $: totalPagesStatus1and4 = Math.ceil(
    filteredPetitionsStatus1and4.length / itemsPerPage
  );
  $: totalPagesStatus2and3 = Math.ceil(
    filteredPetitionsStatus2and3.length / itemsPerPage
  );

  function nextPageStatus1and4() {
    if (currentPageStatus1and4 < totalPagesStatus1and4) {
      currentPageStatus1and4 += 1;
    }
  }

  function prevPageStatus1and4() {
    if (currentPageStatus1and4 > 1) {
      currentPageStatus1and4 -= 1;
    }
  }

  function nextPageStatus2and3() {
    if (currentPageStatus2and3 < totalPagesStatus2and3) {
      currentPageStatus2and3 += 1;
    }
  }

  function prevPageStatus2and3() {
    if (currentPageStatus2and3 > 1) {
      currentPageStatus2and3 -= 1;
    }
  }

  function getPaginationArray(totalPages: number) {
    const array = [];
    for (let i = 1; i <= totalPages; i++) {
      array.push(i);
    }
    return array;
  }

  // เรียกใช้ฟังก์ชันเมื่อ component ถูกโหลด
  onMount(() => {
    fetchPetitions();
  });
</script>

<div class="container mx-auto px-4 py-8">
  {#if !authToken}
    <div class="text-red-500 text-center mt-4 text-4xl">
      <p>คุณไม่ได้รับอนุญาต กรุณากลับไปหน้าหลัก!</p>
    </div>
  {:else}
    <h1 class="text-2xl font-bold mb-4">
      รายการคำร้องขอจริยธรรมการวิจัยในมนุษย์ (ขั้นกรรมการ)
    </h1>

    <!-- Search Section -->
    <div class="search-container mb-6">
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="ค้นหาชื่อผู้วิจัย"
          class="input input-bordered w-full max-w-xs"
          on:input={searchResearcher}
        />
        {#if searchQuery}
          <button class="btn btn-outline" on:click={resetSearch}>ล้างการค้นหา</button>
        {/if}
      </div>

      {#if showSearchResults}
        <div class="search-results mt-4">
          <h3 class="text-lg font-semibold mb-2">ผลการค้นหา</h3>
          
          {#if searchResults.ongoing.length > 0}
            <div class="mb-4">
              <h4 class="text-md font-medium text-blue-600">พบในคำร้องที่กำลังดำเนินการ ({searchResults.ongoing.length} รายการ)</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-4 py-2 text-left">ชื่อ-นามสกุล</th>
                      <th class="px-4 py-2 text-left">ชื่อเรื่องภาษาไทย</th>
                      <th class="px-4 py-2 text-center">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each searchResults.ongoing as result}
                      <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2">{result.researcher}</td>
                        <td class="px-4 py-2">
                          {result.title_th.length > 100
                            ? result.title_th.substring(0, 100) + "..."
                            : result.title_th}
                        </td>
                        <td class="px-4 py-2 text-center">
                          <button 
                            class="btn btn-outline btn-primary btn-sm"
                            on:click={() => goToDirectorPage(result.id)}
                          >
                            ตรวจสอบ
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}

          {#if searchResults.completed.length > 0}
            <div class="mb-4">
              <h4 class="text-md font-medium text-green-600">พบในคำร้องที่ดำเนินการเสร็จสิ้น ({searchResults.completed.length} รายการ)</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead>
                    <tr class="bg-gray-50">
                      <th class="px-4 py-2 text-left">ชื่อ-นามสกุล</th>
                      <th class="px-4 py-2 text-left">ชื่อเรื่องภาษาไทย</th>
                      <th class="px-4 py-2 text-center">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each searchResults.completed as result}
                      <tr class="border-b hover:bg-gray-50">
                        <td class="px-4 py-2">{result.researcher}</td>
                        <td class="px-4 py-2">
                          {result.title_th.length > 100
                            ? result.title_th.substring(0, 100) + "..."
                            : result.title_th}
                        </td>
                        <td class="px-4 py-2 text-center">
                          <button 
                            class="btn btn-outline btn-primary btn-sm"
                            on:click={() => goToDirectorPage(result.id)}
                          >
                            ตรวจสอบ
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}

          {#if searchResults.ongoing.length === 0 && searchResults.completed.length === 0}
            <p class="text-gray-500">ไม่พบข้อมูลที่ค้นหา</p>
          {/if}
        </div>
      {/if}
    </div>

    <div class="table-container">
      <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (กำลังดำเนินการ)</h2>
      <table class="min-w-full bg-white">
        <thead>
          <tr
            class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal"
          >
            <th class="py-3 px-6 text-left">ผู้วิจัย</th>
            <th class="py-3 px-6 text-left">เลขที่เอกสาร</th>
            <th class="py-3 px-6 text-left">ชื่อเรื่องภาษาไทย</th>
            <th class="py-3 px-6 text-left">ขั้นตอนปัจจุบัน</th>
            <th class="py-3 px-6 text-left">สถานะเอกสาร</th>
            <th class="py-3 px-6 text-left">วันที่ส่งเอกสาร</th>
            <th class="py-3 px-6 text-center">ข้อมูลคำร้อง</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          {#if paginatedPetitionsStatus1and4.length === 0}
            <tr>
              <td colspan="7" class="py-8 text-center text-gray-500"
                >ไม่พบข้อมูลคำร้อง</td
              >
            </tr>
          {:else}
            {#each paginatedPetitionsStatus1and4 as petition, index}
              <tr class="border-b border-gray-200 hover:bg-gray-100">
                <td class="py-3 px-6 text-left whitespace-nowrap">
                  {petition.researcher}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.correspondenceNo}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.title_th.length > 11
                    ? petition.title_th.substring(0, 11) + "..."
                    : petition.title_th}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.currentLevel}
                </td>
                <td class="py-3 px-6 text-left">
                  {#if petition.statusId === 1}
                    <div class="badge badge-info badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 2}
                    <div class="badge badge-success badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 3}
                    <div class="badge badge-error badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 4}
                    <div class="badge badge-warning badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else}
                    <div class="badge badge-danger badge-outline">
                      {petition.statusDescription}
                    </div>
                  {/if}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.created_at}
                </td>
                <td class="py-3 px-6 text-center">
                  <button
                    class="btn btn-outline btn-primary"
                    on:click={() => goToDirectorPage(petition.id)}
                    >ตรวจสอบ</button
                  >
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
      <div class="pagination">
        <button
          on:click={prevPageStatus1and4}
          disabled={currentPageStatus1and4 === 1}>ก่อนหน้า</button
        >
        {#each getPaginationArray(totalPagesStatus1and4) as page}
          <button
            on:click={() => (currentPageStatus1and4 = page)}
            class:active={currentPageStatus1and4 === page}>{page}</button
          >
        {/each}
        <button
          on:click={nextPageStatus1and4}
          disabled={currentPageStatus1and4 === totalPagesStatus1and4}
          >ถัดไป</button
        >
      </div>
    </div>

    <div class="table-container">
      <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (ดำเนินการเสร็จสิ้น)</h2>
      <table class="min-w-full bg-white">
        <thead>
          <tr
            class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal"
          >
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
          {#if paginatedPetitionsStatus2and3.length === 0}
            <tr>
              <td colspan="7" class="py-8 text-center text-gray-500"
                >ไม่พบข้อมูลคำร้อง</td
              >
            </tr>
          {:else}
            {#each paginatedPetitionsStatus2and3 as petition, index}
              <tr class="border-b border-gray-200 hover:bg-gray-100">
                <td class="py-3 px-6 text-left whitespace-nowrap">
                  {petition.researcher}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.correspondenceNo}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.title_th.length > 11
                    ? petition.title_th.substring(0, 11) + "..."
                    : petition.title_th}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.currentLevel}
                </td>
                <td class="py-3 px-6 text-left">
                  {#if petition.statusId === 1}
                    <div class="badge badge-info badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 2}
                    <div class="badge badge-success badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 3}
                    <div class="badge badge-error badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else if petition.statusId === 4}
                    <div class="badge badge-warning badge-outline">
                      {petition.statusDescription}
                    </div>
                  {:else}
                    <div class="badge badge-danger badge-outline">
                      {petition.statusDescription}
                    </div>
                  {/if}
                </td>
                <td class="py-3 px-6 text-left">
                  {petition.created_at}
                </td>
                <td class="py-3 px-6 text-center">
                  <button
                    class="btn btn-outline btn-primary"
                    on:click={() => goToDirectorPage(petition.id)}
                    >ตรวจสอบ</button
                  >
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
      <div class="pagination">
        <button
          on:click={prevPageStatus2and3}
          disabled={currentPageStatus2and3 === 1}>ก่อนหน้า</button
        >
        {#each getPaginationArray(totalPagesStatus2and3) as page}
          <button
            on:click={() => (currentPageStatus2and3 = page)}
            class:active={currentPageStatus2and3 === page}>{page}</button
          >
        {/each}
        <button
          on:click={nextPageStatus2and3}
          disabled={currentPageStatus2and3 === totalPagesStatus2and3}
          >ถัดไป</button
        >
      </div>
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

  .search-container {
    background-color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .search-results {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .search-results li:last-child {
    border-bottom: none;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .pagination button {
    border: none;
    background-color: #f4f4f4;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }
  .pagination button:hover {
    background-color: #e5e5e5;
  }
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .pagination button.active {
    background-color: #007bff;
    color: white;
  }

  @media (max-width: 768px) {
    .table-container {
      margin: 1rem -1rem;
      border-radius: 0;
    }
  }
</style>
