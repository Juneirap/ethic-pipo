<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let petitions = [];
  let filteredPetitionsStatus1and4 = [];
  let filteredPetitionsStatus2and3 = [];
  let selectedPetitionId: number | null = null; // Store the selected petition ID for verification
  let errorMessage: string | null = null; // State variable for error message
  let isLoading = false; // State variable for loading indicator
  let currentPageStatus1and4 = 1;
  let currentPageStatus2and3 = 1;
  const itemsPerPage = 10;

  // Computed properties for pagination
  $: paginatedPetitionsStatus1and4 = filteredPetitionsStatus1and4.slice((currentPageStatus1and4 - 1) * itemsPerPage, currentPageStatus1and4 * itemsPerPage);
  $: paginatedPetitionsStatus2and3 = filteredPetitionsStatus2and3.slice((currentPageStatus2and3 - 1) * itemsPerPage, currentPageStatus2and3 * itemsPerPage);

  // Total pages
  $: totalPagesStatus1and4 = Math.ceil(filteredPetitionsStatus1and4.length / itemsPerPage);
  $: totalPagesStatus2and3 = Math.ceil(filteredPetitionsStatus2and3.length / itemsPerPage);

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

  async function fetchPetitions() {
    try {
      const response = await fetch("http://localhost:8000/petitions/all");
      if (response.ok) {
        petitions = await response.json();
        filteredPetitionsStatus1and4 = petitions.filter(
          (petition) => petition.statusId === 1 || petition.statusId === 4
        );
        filteredPetitionsStatus2and3 = petitions.filter(
          (petition) => petition.statusId === 2 || petition.statusId === 3
        );
      } else {
        console.error("Failed to fetch petitions");
      }
    } catch (error) {
      console.error("Error fetching petitions:", error);
    }
  }

  function openModal(petitionId: number) {
    selectedPetitionId = petitionId; // Set the selected petition ID
    errorMessage = null; // Reset any previous error message
    isLoading = false; // Reset loading state
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
    const input = document.getElementById("phone-input") as HTMLInputElement;
    input.value = ""; // Reset the input field to empty
    modal?.showModal(); // Open the modal
  }

  async function verifyAndGoToDirectorPage() {
    const telNo = (document.getElementById("phone-input") as HTMLInputElement)
      .value;
    if (!telNo) return; // Exit if no phone number is provided

    try {
      const response = await fetch(
        `http://localhost:8000/researchers/verify?telNo=${telNo}&petitionId=${selectedPetitionId}`
      );
      if (response.ok) {
        isLoading = true; // Set loading state to true
        setTimeout(() => {
          goto(`monitor/follow?id=${selectedPetitionId}`);
        }, 1000); // Change delay to 2 seconds before navigating
      } else {
        const errorData = await response.json();
        errorMessage = errorData.error || "การยืนยันล้มเหลว."; // Set error message
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการยืนยันหมายเลขโทรศัพท์", error);
      errorMessage = "เกิดข้อผิดพลาดขณะยืนยันหมายเลขโทรศัพท์"; // Set error message
    }
  }

  function handleInputChange() {
    errorMessage = null; // Clear error message when input changes
  }

  function closeModal() {
    errorMessage = null; // Reset error message
    const modal = document.getElementById("my_modal_1") as HTMLDialogElement;
    modal?.close(); // Close the modal
  }

  let searchPhone = '';
  let isSearching = false;
  let searchError = null;

  // ฟังก์ชันดีเลย์การค้นหา
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ฟังก์ชันค้นหาด้วยเบอร์โทร
  const searchPetitions = debounce(async () => {
    if (!searchPhone.trim()) {
      await fetchPetitions(); // รีเซ็ตกลับไปแสดงข้อมูลทั้งหมด
      searchError = null;
      return;
    }

    try {
      isSearching = true;
      searchError = null;

      // ตรวจสอบรูปแบบเบอร์โทร
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(searchPhone.trim())) {
        searchError = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ตัวเลข 10 หลัก)";
        return;
      }

      const response = await fetch(`http://localhost:8000/petitions/search?telNo=${searchPhone.trim()}`);
      if (response.ok) {
        const searchResults = await response.json();
        
        // แยกข้อมูลตาม status
        filteredPetitionsStatus1and4 = searchResults.filter(
          (petition) => petition.statusId === 1 || petition.statusId === 4
        );
        filteredPetitionsStatus2and3 = searchResults.filter(
          (petition) => petition.statusId === 2 || petition.statusId === 3
        );

        // รีเซ็ตหน้าเพจกลับไปหน้าแรก
        currentPageStatus1and4 = 1;
        currentPageStatus2and3 = 1;

        if (searchResults.length === 0) {
          searchError = "ไม่พบข้อมูลคำร้องที่ตรงกับเบอร์โทรศัพท์นี้";
        }
      } else {
        const errorData = await response.json();
        searchError = errorData.message || "เกิดข้อผิดพลาดในการค้นหา";
      }
    } catch (error) {
      console.error('Error searching petitions:', error);
      searchError = "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์";
    } finally {
      isSearching = false;
    }
  }, 500); // รอ 500ms หลังจากพิมพ์เสร็จแล้วค่อยค้นหา

  function getPaginationArray(totalPages) {
    const paginationArray = [];
    for (let i = 1; i <= totalPages; i++) {
      paginationArray.push(i);
    }
    return paginationArray;
  }

  onMount(() => {
    fetchPetitions();
  });
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-4">
    ติดตามการพิจารณาคำร้องขอจริยธรรมการวิจัยในมนุษย์
  </h1>

  <div class="mb-4">
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">ค้นหาด้วยเบอร์โทรศัพท์</span>
      </label>
      <div class="relative">
        <input 
          type="text" 
          placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก" 
          bind:value={searchPhone} 
          on:input={searchPetitions}
          class="input input-bordered w-full pr-10"
          maxlength="10"
          pattern="[0-9]*"
        />
        {#if isSearching}
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span class="loading loading-spinner loading-sm"></span>
          </div>
        {/if}
      </div>
      {#if searchError}
        <label class="label">
          <span class="label-text-alt text-error">{searchError}</span>
        </label>
      {/if}
    </div>
  </div>

  <!-- Table for statusId: 1 and 4 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">ข้อมูลคำร้อง (กำลังดำเนินการ)</h2>
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
        {#if paginatedPetitionsStatus1and4.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each paginatedPetitionsStatus1and4 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">{petition.researcher}</td>
              <td class="py-3 px-6 text-left">{petition.correspondenceNo}</td>
              <td class="py-3 px-6 text-left">
                {petition.title_th.length > 11 ? petition.title_th.substring(0, 11) + "..." : petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">{petition.currentLevel}</td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 1}
                  <div class="badge badge-info badge-outline">
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
              <td class="py-3 px-6 text-left">{petition.created_at}</td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => openModal(petition.id)}>รายละเอียด</button
                >
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>

    <!-- Pagination controls -->
    <div class="pagination">
      <button on:click={prevPageStatus1and4} disabled={currentPageStatus1and4 === 1}>ก่อนหน้า</button>
      {#each getPaginationArray(totalPagesStatus1and4) as page}
        <button on:click={() => currentPageStatus1and4 = page} class:active={currentPageStatus1and4 === page}>{page}</button>
      {/each}
      <button on:click={nextPageStatus1and4} disabled={currentPageStatus1and4 === totalPagesStatus1and4}>ถัดไป</button>
    </div>
  </div>

  <!-- Table for statusId: 2 and 3 -->
  <div class="table-container">
    <h2 class="text-xl font-bold mt-8 mb-4">
      ข้อมูลคำร้อง (ดำเนินการเสร็จสิ้น)
    </h2>
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
        {#if paginatedPetitionsStatus2and3.length === 0}
          <tr>
            <td colspan="7" class="py-8 text-center text-gray-500">ไม่พบข้อมูลคำร้อง</td>
          </tr>
        {:else}
          {#each paginatedPetitionsStatus2and3 as petition}
            <tr class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left whitespace-nowrap">{petition.researcher}</td>
              <td class="py-3 px-6 text-left">{petition.correspondenceNo}</td>
              <td class="py-3 px-6 text-left">
                {petition.title_th.length > 11 ? petition.title_th.substring(0, 11) + "..." : petition.title_th}
              </td>
              <td class="py-3 px-6 text-left">{petition.currentLevel}</td>
              <td class="py-3 px-6 text-left">
                {#if petition.statusId === 2}
                  <div class="badge badge-success badge-outline">
                    {petition.statusDescription}
                  </div>
                {:else if petition.statusId === 3}
                  <div class="badge badge-error badge-outline">
                    {petition.statusDescription}
                  </div>
                {:else}
                  <div class="badge badge-danger badge-outline">
                    {petition.statusDescription}
                  </div>
                {/if}
              </td>
              <td class="py-3 px-6 text-left">{petition.created_at}</td>
              <td class="py-3 px-6 text-center">
                <button
                  class="btn btn-outline btn-primary"
                  on:click={() => openModal(petition.id)}>รายละเอียด</button
                >
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>

    <!-- Pagination controls -->
    <div class="pagination">
      <button on:click={prevPageStatus2and3} disabled={currentPageStatus2and3 === 1}>ก่อนหน้า</button>
      {#each getPaginationArray(totalPagesStatus2and3) as page}
        <button on:click={() => currentPageStatus2and3 = page} class:active={currentPageStatus2and3 === page}>{page}</button>
      {/each}
      <button on:click={nextPageStatus2and3} disabled={currentPageStatus2and3 === totalPagesStatus2and3}>ถัดไป</button>
    </div>
  </div>
</div>

<!-- Modal -->
<dialog id="my_modal_1" class="modal">
  <div class="modal-box p-6">
    <h3 class="text-lg font-bold mb-4">กรุณากรอกเบอร์โทรศัพท์ของคุณ</h3>
    <div class="mt-4 mb-6 relative">
      <input
        type="text"
        id="phone-input"
        placeholder="ยืนยันเบอร์โทรศัพท์ผู้วิจัย"
        class="input w-full px-4 py-2"
        on:input={handleInputChange}
      />
      {#if isLoading}
        <span
          class="loading loading-bars loading-md absolute inset-y-0 right-0 mr-2"
        ></span>
      {/if}
    </div>
    {#if errorMessage}
      <p class="text-red-500 mb-4">{errorMessage}</p>
    {/if}
    <div class="modal-action flex justify-between items-center">
      <div>
        <button
          class="btn btn-outline btn-info"
          on:click={verifyAndGoToDirectorPage}>ยืนยัน</button
        >
      </div>
      <div>
        <form method="dialog" on:submit={closeModal}>
          <button class="btn btn-outline btn-error">ยกเลิก</button>
        </form>
      </div>
    </div>
  </div>
</dialog>

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

  .modal-box {
    max-width: 32rem;
    width: 90%;
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .modal-action {
    margin-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
</style>
