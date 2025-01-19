<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from '$app/navigation';

  // สร้างตัวแปรสำหรับวันที่ปัจจุบัน
  let currentDate = new Date().toISOString().split("T")[0];

  let petitions = {
    id: null,
    correspondenceNo: "",
    title_th: "",
    title_en: "",
    objectiveId: null,
    objectiveOther: "",
    grantId: null,
    grantOther: "",
    researchTypeId: null,
    currentLevelId: null,
    researcherId: null,
    typeId: null,
    statusId: null,
    note: "",
    staffId: null,
    created_at: "",
    researcher: {
      id: null,
      prenameId: null,
      description: "",
      name: "",
      surname: "",
      telNo: "",
      email: "",
      department: {
        id: null,
        description: "",
        facultyId: null,
      },
      faculty: {
        id: null,
        description: "",
        telNo: "",
      },
    },
  };

  interface PetitionFile {
    id: number;
    name: string;
    extension: string;
    md5: string;
    petitionId: number;
    documentTypeId: number;
    documentType: {
      id: number;
      description: string;
    };
  }

  let petitionFiles: PetitionFile[] = [];

  // เพิ่มฟังก์ชันสำหรับเปิดไฟล์
  const openFile = async (fileName: string) => {
    try {
      // Encode the filename to handle special characters
      const encodedFileName = encodeURIComponent(fileName);
      const response = await fetch(
        `http://localhost:8000/upload/file/${encodedFileName}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      // Get the content type from response headers
      const contentType = response.headers.get("Content-Type") || "";
      const disposition = response.headers.get("Content-Disposition") || "";

      // Get the blob with the correct type
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // If it's a PDF or image, open in new tab
      if (contentType.includes("pdf") || contentType.includes("image")) {
        window.open(url, "_blank");
      } else {
        // For other files, trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName; // Use original filename for download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Clean up the URL object after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error opening file:", error);
      alert("ไม่สามารถเปิดไฟล์ได้");
    }
  };

  // เพิ่มฟังก์ชันสำหรับการอัพโหลดไฟล์เพิ่มเติม
  async function handleFileUpload(event: Event, documentTypeId: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const petitionId = $page.url.searchParams.get("id");
    if (!petitionId) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("petitionId", petitionId);
      formData.append("documentTypeId", documentTypeId.toString());

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("อัพโหลดไฟล์สำเร็จ");
        // รีเฟรชรายการไฟล์
        getPetitionFiles();
      } else {
        alert("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
    }
  }

  // เพิ่มฟังก์ชันสำหรับการแก้ไขไฟล์
  async function handleFileEdit(file: PetitionFile, newFile: File) {
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      
      const response = await fetch(`http://localhost:8000/upload/edit/${file.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("แก้ไขไฟล์สำเร็จ");
        
        // อัพเดทรายการไฟล์ในหน้าเว็บทันที
        petitionFiles = petitionFiles.map(pf => {
          if (pf.id === file.id) {
            return {
              ...pf,
              name: data.file.name,
              md5: data.file.md5,
              extension: data.file.extension
            };
          }
          return pf;
        });

        // Redirect กลับไปที่หน้า director พร้อม id
        goto(`/considerations/subcommittee/director?id=${petitions.id}`);
      } else {
        alert("เกิดข้อผิดพลาดในการแก้ไขไฟล์");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขไฟล์");
    }
  }

  async function getPetitionFiles() {
    const id = $page.url.searchParams.get("id");
    if (!id) return;

    try {
      const response = await fetch(
        `http://localhost:8000/petitions/files?petitionId=${id}`
      );
      if (response.ok) {
        const data = await response.json();
        petitionFiles = data.files;
        console.log("Petition files:", petitionFiles);
      } else {
        console.error("Failed to fetch petition files");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // เพิ่มตัวแปรสำหรับเก็บค่าที่เลือก
  let selectedObjective: string = "";
  let selectedGrant: string = "";
  let selectedType: string = "";

  async function getPetitionById() {
    const id = $page.url.searchParams.get("id");
    if (!id) return;

    try {
      const response = await fetch(`http://localhost:8000/petitions?id=${id}`);
      if (response.ok) {
        const { petition } = await response.json();
        console.log("Raw petition data:", petition);

        // อัพเดทข้อมูลในฟอร์ม
        petitions = {
          ...petition,
          created_at: petition.created_at || "",
        };

        // อัพเดทการเลือกตามค่า ID
        selectedObjective = petition.objectiveId?.toString() || "";
        selectedGrant = petition.grantId?.toString() || "";
        selectedType = petition.typeId?.toString() || "";

        console.log("Updated petition:", petitions);
        console.log("Selected values:", {
          selectedObjective,
          selectedGrant,
          selectedType,
        });
      } else {
        console.error("Failed to fetch petition");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // เรียกใช้ฟังก์ชันเมื่อ component ถูกโหลด
  onMount(() => {
    getPetitionById();
    getPetitionFiles();
  });

  // ฟังก์ชันสำหรับอัพเดทค่าเมื่อมีการเลือก radio
  function handleObjectiveChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    selectedObjective = value;
    petitions.objectiveId = parseInt(value);
  }

  function handleGrantChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    selectedGrant = value;
    petitions.grantId = parseInt(value);
  }

  function handleTypeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    selectedType = value;
    petitions.typeId = parseInt(value);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const id = $page.url.searchParams.get("id");
    if (!id) return;

    try {
      const response = await fetch(`http://localhost:8000/petitions?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objectiveId: petitions.objectiveId,
          objectiveOther: petitions.objectiveOther,
          grantId: petitions.grantId,
          grantOther: petitions.grantOther,
          typeId: petitions.typeId,
          statusId: 1,
          researcherId: petitions.researcherId,
          currentLevelId: 2,
          staffId: petitions.staffId,
          note: petitions.note,
        }),
      });

      if (response.ok) {
        alert("บันทึกการพิจารณาเรียบร้อยแล้ว");
        window.location.href = "/considerations/subcommittee";
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  }

  async function handleUpdate(event: Event) {
    event.preventDefault();
    const id = $page.url.searchParams.get("id");
    if (!id) return;

    try {
      const response = await fetch(`http://localhost:8000/petitions?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objectiveId: petitions.objectiveId,
          objectiveOther: petitions.objectiveOther,
          grantId: petitions.grantId,
          grantOther: petitions.grantOther,
          typeId: petitions.typeId,
          statusId: 3,
          researcherId: petitions.researcherId,
          currentLevelId: 1,
          staffId: petitions.staffId,
          note: petitions.note,
        }),
      });

      if (response.ok) {
        alert("บันทึกการพิจารณาเรียบร้อยแล้ว");
        window.location.href = "/considerations/subcommittee";
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  />
</svelte:head>

<div class="form-container">
  <div class="header">
    <img
      src="https://th.bing.com/th/id/OIP.CFJHa2V7Aq9YTw8qF2GLzwHaIn?rs=1&pid=ImgDetMain"
      alt="มหาวิทยาลัยราชภัฏบุรีรัมย์"
      class="logo"
    />
    <div class="title">
      <h1 class="text-2xl font-bold center">บันทึกข้อความ</h1>
      <h2 class="text-2xl">มหาวิทยาลัยราชภัฏบุรีรัมย์</h2>
    </div>
    <div class="form-number">BRU-H1</div>
  </div>

  <form>
    <div class="form-row three-col">
      <div class="field">
        <label>หน่วยงาน</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.faculty?.description || ""}
            readonly
          />
        </div>
      </div>
      <div class="field">
        <label>โทรศัพท์</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.faculty?.telNo || ""}
            readonly
          />
        </div>
      </div>
      <div class="field">
        <label>ต่อ</label>
        <div class="dotted-line">
          <input type="text" />
        </div>
      </div>
    </div>

    <div class="form-row two-col">
      <div class="field">
        <label>เลขเอกสาร</label>
        <div class="dotted-line">
          <input type="text" bind:value={petitions.correspondenceNo} />
        </div>
      </div>
      <div class="field">
        <label>วันที่</label>
        <div class="dotted-line">
          <input type="date" bind:value={currentDate} />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>เรื่อง</label>
        <span>ขอให้พิจารณาจริยธรรมการวิจัยในมนุษย์</span>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>เรียน</label>
        <span>ผู้อำนวยการสถาบันวิจัยและพัฒนา</span>
      </div>
    </div>
    <div class="form-row two-col">
      <div class="field">
        <label>ชื่อ</label>
        <div class="dotted-line">
          <input
            type="text"
            value={`${petitions.researcher?.description || ""}    ${petitions.researcher?.name || ""}`}
            readonly
          />
        </div>
      </div>
      <div class="field">
        <label>นามสกุล</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.surname || ""}
            readonly
          />
        </div>
      </div>
    </div>

    <div class="form-row two-col">
      <div class="field">
        <label>อีเมล</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.email || ""}
            readonly
          />
        </div>
      </div>
      <div class="field">
        <label>เบอร์โทร</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.telNo || ""}
            readonly
          />
        </div>
      </div>
    </div>

    <div class="form-row two-col">
      <div class="field">
        <label>อาจารย์ประจำ/นักศึกษาสาขา</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.department?.description || ""}
            readonly
          />
        </div>
      </div>
      <div class="field">
        <label>คณะ/หน่วยงาน</label>
        <div class="dotted-line">
          <input
            type="text"
            value={petitions.researcher?.faculty?.description || ""}
            readonly
          />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>มีความประสงค์จะทำวิจัยเรื่อง (ภาษาไทย)</label>
        <div class="dotted-line">
          <input type="text" bind:value={petitions.title_th} />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>(ภาษาอังกฤษ)</label>
        <div class="dotted-line">
          <input type="text" bind:value={petitions.title_en} />
        </div>
      </div>
    </div>

    <div class="research-type">
      <p>เพื่อ</p>
      <div class="checkbox-group">
        <label>
          <input
            type="radio"
            name="objective"
            value="1"
            checked={selectedObjective === "1"}
            on:change={handleObjectiveChange}
          />
          การทำวิจัย
        </label>
        <label>
          <input
            type="radio"
            name="objective"
            value="2"
            checked={selectedObjective === "2"}
            on:change={handleObjectiveChange}
          />
          การขอขึ้นทะเบียนยาในประเทศ
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="objective"
            value="3"
            checked={selectedObjective === "3"}
            on:change={handleObjectiveChange}
          />
          อื่น ๆ
          <div class="dotted-line">
            <input
              type="text"
              class="inline-input"
              bind:value={petitions.objectiveOther}
              placeholder="ระบุรายละเอียด"
            />
          </div>
        </label>
      </div>
    </div>

    <div class="funding-source">
      <p>ได้รับทุนสนับสนุนการทำวิจัยจาก</p>
      <div class="checkbox-group">
        <label>
          <input
            type="radio"
            name="grant"
            value="1"
            checked={selectedGrant === "1"}
            on:change={handleGrantChange}
          />
          มรภ.บร.</label
        >
        <label>
          <input
            type="radio"
            name="grant"
            value="2"
            checked={selectedGrant === "2"}
            on:change={handleGrantChange}
          />
          ส่วนตัว
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="grant"
            value="3"
            checked={selectedGrant === "3"}
            on:change={handleGrantChange}
          />
          แหล่งทุนภายนอก
          <div class="dotted-line">
            <input
              type="text"
              class="inline-input"
              bind:value={petitions.grantOther}
              placeholder="ระบุรายละเอียด"
            />
          </div>
        </label>
      </div>
    </div>

    <div class="funding-source">
      <p>ประเภทโครงการวิจัยที่ขอ</p>
      <div class="checkbox-group">
        <label>
          <input
            type="radio"
            name="type"
            value="1"
            checked={selectedType === "1"}
            on:change={handleTypeChange}
          />
          ทั่วไป (เกี่ยวข้องกับมนุษย์โดยตรง)
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="2"
            checked={selectedType === "2"}
            on:change={handleTypeChange}
          />
          ความเสี่ยงต่ำ (เช่น ศึกษาข้อมูลย้อนหลังจากเวชระเบียน บทความ บทสัมภาษณ์
          แบบสอบถาม ศึกษาสิ่งส่งตรวจต่างๆ จำกร่างกาย เป็นต้น)
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="3"
            checked={selectedType === "3"}
            on:change={handleTypeChange}
          />
          เข้าข่ายยกเว้นการรับรอง
        </label>
      </div>
    </div>

    <div class="document-table">
      <h3>เอกสารประกอบการพิจารณา</h3>
      <table>
        <thead>
          <tr>
            <th class="border border-gray-300 text-center">รายการ</th>
            <th class="border border-gray-300 text-center">เอกสาร</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border px-4 py-2">
              1. แบบเสนอเพื่อขอรับการพิจารณาจริยธรรมการวิจัยในมนุษย์ (protocol)
            </td>
            <td class="border px-4 py-2">
              {#if petitionFiles.filter((f) => f.documentTypeId === 1).length > 0}
                {#each petitionFiles.filter((f) => f.documentTypeId === 1) as file}
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span
                        class="file-name cursor-pointer"
                        on:click={() => openFile(file.name)}
                      >
                        {file.md5}{file.extension}
                      </span>
                    </div>
                    <div class="file-actions">
                      <input
                        type="file"
                        style="display: none"
                        on:change={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files && target.files[0]) {
                            handleFileEdit(file, target.files[0]);
                          }
                        }}
                        id="edit-file-{file.id}"
                      />
                      <button
                        class="action-button edit-button"
                        on:click={() => {
                          const element = document.getElementById(`edit-file-${file.id}`);
                          if (element) element.click();
                        }}
                      >
                        <i class="fas fa-edit"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="no-file">ไม่มีข้อมูลเอกสาร</div>
              {/if}
              <div class="upload-section">
                <input
                  type="file"
                  style="display: none"
                  on:change={(e) => handleFileUpload(e, 1)}
                  id="upload-file-1"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td class="border px-4 py-2"
              >2. ข้อเสนอโครงการวิจัยฉบับเต็ม (full Proposal)</td
            >
            <td class="border px-4 py-2">
              {#if petitionFiles.filter((f) => f.documentTypeId === 2).length > 0}
                {#each petitionFiles.filter((f) => f.documentTypeId === 2) as file}
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span
                        class="file-name cursor-pointer"
                        on:click={() => openFile(file.name)}
                      >
                        {file.md5}{file.extension}
                      </span>
                    </div>
                    <div class="file-actions">
                      <input
                        type="file"
                        style="display: none"
                        on:change={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files && target.files[0]) {
                            handleFileEdit(file, target.files[0]);
                          }
                        }}
                        id="edit-file-{file.id}"
                      />
                      <button
                        class="action-button edit-button"
                        on:click={() => {
                          const element = document.getElementById(`edit-file-${file.id}`);
                          if (element) element.click();
                        }}
                      >
                        <i class="fas fa-edit"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="no-file">ไม่มีข้อมูลเอกสาร</div>
              {/if}
              <div class="upload-section">
                <input
                  type="file"
                  style="display: none"
                  on:change={(e) => handleFileUpload(e, 2)}
                  id="upload-file-2"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td class="border px-4 py-2"
              >3. เอกสารผ่านการอบรมจริยธรรมการวิจัย (ถ้ามี)</td
            >
            <td class="border px-4 py-2">
              {#if petitionFiles.filter((f) => f.documentTypeId === 4).length > 0}
                {#each petitionFiles.filter((f) => f.documentTypeId === 4) as file}
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span
                        class="file-name cursor-pointer"
                        on:click={() => openFile(file.name)}
                      >
                        {file.md5}{file.extension}
                      </span>
                    </div>
                    <div class="file-actions">
                      <input
                        type="file"
                        style="display: none"
                        on:change={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files && target.files[0]) {
                            handleFileEdit(file, target.files[0]);
                          }
                        }}
                        id="edit-file-{file.id}"
                      />
                      <button
                        class="action-button edit-button"
                        on:click={() => {
                          const element = document.getElementById(`edit-file-${file.id}`);
                          if (element) element.click();
                        }}
                      >
                        <i class="fas fa-edit"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="no-file">ไม่มีข้อมูลเอกสาร</div>
              {/if}
              <div class="upload-section">
                <input
                  type="file"
                  style="display: none"
                  on:change={(e) => handleFileUpload(e, 4)}
                  id="upload-file-4"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td class="border px-4 py-2"
              >4. แบบบันทึกข้อมูลสำหรับการวิจัย (Case record form) (ถ้ามี)</td
            >
            <td class="border px-4 py-2">
              {#if petitionFiles.filter((f) => f.documentTypeId === 9).length > 0}
                {#each petitionFiles.filter((f) => f.documentTypeId === 9) as file}
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span
                        class="file-name cursor-pointer"
                        on:click={() => openFile(file.name)}
                      >
                        {file.md5}{file.extension}
                      </span>
                    </div>
                    <div class="file-actions">
                      <input
                        type="file"
                        style="display: none"
                        on:change={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files && target.files[0]) {
                            handleFileEdit(file, target.files[0]);
                          }
                        }}
                        id="edit-file-{file.id}"
                      />
                      <button
                        class="action-button edit-button"
                        on:click={() => {
                          const element = document.getElementById(`edit-file-${file.id}`);
                          if (element) element.click();
                        }}
                      >
                        <i class="fas fa-edit"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="no-file">ไม่มีข้อมูลเอกสาร</div>
              {/if}
              <div class="upload-section">
                <input
                  type="file"
                  style="display: none"
                  on:change={(e) => handleFileUpload(e, 9)}
                  id="upload-file-9"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td class="border px-4 py-2"
              >5. แบบสอบถาม (Questionnaire) (ถ้ามี)</td
            >
            <td class="border px-4 py-2">
              {#if petitionFiles.filter((f) => f.documentTypeId === 10).length > 0}
                {#each petitionFiles.filter((f) => f.documentTypeId === 10) as file}
                  <div class="file-container">
                    <div class="file-info">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span
                        class="file-name cursor-pointer"
                        on:click={() => openFile(file.name)}
                      >
                        {file.md5}{file.extension}
                      </span>
                    </div>
                    <div class="file-actions">
                      <input
                        type="file"
                        style="display: none"
                        on:change={(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          if (target && target.files && target.files[0]) {
                            handleFileEdit(file, target.files[0]);
                          }
                        }}
                        id="edit-file-{file.id}"
                      />
                      <button
                        class="action-button edit-button"
                        on:click={() => {
                          const element = document.getElementById(`edit-file-${file.id}`);
                          if (element) element.click();
                        }}
                      >
                        <i class="fas fa-edit"></i>
                        แก้ไข
                      </button>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="no-file">ไม่มีข้อมูลเอกสาร</div>
              {/if}
              <div class="upload-section">
                <input
                  type="file"
                  style="display: none"
                  on:change={(e) => handleFileUpload(e, 10)}
                  id="upload-file-10"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="evaluation-section">
      <h3>ข้อเสนอแนะ</h3>
      <div class="evaluation-fields">
        <div class="field-group">
          <label >ข้อเสนอแนะเพิ่มเติม</label>
          <textarea
            class="evaluation-textarea"
            bind:value={petitions.note}
            placeholder="กรุณาระบุข้อเสนอแนะเพิ่มเติม"
          ></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" on:click={handleSubmit}>ผ่านการพิจารณา</button>
        <button type="button"on:click={handleUpdate}>ไม่ผ่านการพิจารณา</button>
      </div>
    </div>
  </form>
</div>

<style>
  .form-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
    background: white;
    font-family: "Sarabun", sans-serif;
    margin-left: 50px;
    margin-right: 50px;
  }

  .header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 30px;
    position: relative;
  }

  .logo {
    width: 60px;
    height: auto;
    margin-right: 1px;
  }

  .title {
    text-align: center;
    flex-grow: 1;
  }

  .title h1,
  .title h2 {
    margin: 0;
    font-weight: normal;
  }

  .form-number {
    position: absolute;
    top: 0;
    right: 0;
    padding: 5px 10px;
    border: 1px solid #000;
  }

  .form-row {
    margin-bottom: 20px;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .three-col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .full-width {
    width: 100%;
  }

  .dotted-line {
    flex-grow: 1;
    border-bottom: 1px dotted #000;
    position: relative;
  }

  input[type="text"],
  input[type="date"] {
    width: 100%;
    border: none;
    background: transparent;
    padding: 5px 0;
    font-family: "Sarabun", sans-serif;
  }

  input[type="text"]:focus,
  input[type="date"]:focus {
    outline: none;
  }

  .fixed-text {
    position: absolute;
    left: 0;
    bottom: 5px;
  }

  .checkbox-group {
    margin: 10px 0;
    padding-left: 20px;
  }

  .checkbox-group label {
    display: block;
    margin: 5px 0;
  }

  .inline-input {
    width: 200px;
    margin-left: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th,
  td {
    border: 1px solid #000;
    padding: 10px;
    text-align: left;
  }

  th {
    background-color: #f5f5f5;
  }

  .status-container {
    font-family: Arial, sans-serif;
    margin: 20px;
  }
  .status-label {
    font-weight: bold;
  }
  .status-message {
    display: inline-block;
    margin-left: 10px;
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
    font-size: 14px;
  }
  .status-pending {
    background-color: orange;
  }
  .status-success {
    background-color: #4caf50;
  }
  .status-error {
    background-color: red;
  }

  .form-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    gap: 15px;
  }

  .form-actions button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .form-actions button:nth-child(2) {
    background-color: red;
  }

  .form-actions button:nth-child(3) {
    background-color: #7e7e7e;
  }

  .form-actions button:nth-child(4) {
    background-color: #28a745;
  }

  .form-actions button:hover {
    opacity: 0.9;
  }

  .evaluation-section {
    margin-top: 20px;
    width: 100%;
  }

  .evaluation-section h3 {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .evaluation-fields {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-group label {
    font-weight: 500;
  }

  .evaluation-textarea {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    font-family: "Sarabun", sans-serif;
  }

  .evaluation-textarea:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }

  .inline-inputs {
    display: flex;
    width: 100%;
  }

  .inline-inputs input {
    display: inline-block;
  }

  .prename-input {
    width: 60px !important;
    margin-right: 5px;
  }

  .name-input {
    flex: 1;
  }

  .file-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    margin: 4px 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f8f9fa;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .file-icon {
    color: #2196F3;
  }

  .file-name {
    color: #2196F3;
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .file-actions {
    display: flex;
    gap: 8px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .edit-button {
    background-color: #2196F3;
    color: white;
  }

  .edit-button:hover {
    background-color: #1976D2;
  }

  .upload-button {
    background-color: #4CAF50;
    color: white;
  }

  .upload-button:hover {
    background-color: #388E3C;
  }

  .upload-section {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
  }

  .no-file {
    color: #666;
    font-style: italic;
    padding: 8px;
  }

  .file-name:hover {
    color: #1565C0;
  }
</style>
