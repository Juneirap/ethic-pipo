<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // สร้างตัวแปรสำหรับวันที่ปัจจุบัน
  let currentDate = new Date().toISOString().split("T")[0];
  let currentLevelId = 0;

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
        },
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
    const file = (event.target as any).files?.[0];
    if (!file) return;

    const petitionId = $page.url.searchParams.get("id");
    if (!petitionId) {
      alert("ไม่พบรหัสคำร้อง");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (petitions.id === null) {
        throw new Error("Petition ID is missing");
      }
      if (documentTypeId === null) {
        throw new Error("Document Type ID is missing");
      }
      formData.append("petitionId", petitions.id.toString());
      formData.append("documentTypeId", documentTypeId.toString());

      const response = await fetch(`http://localhost:8000/upload/upload/${petitions.id}/${documentTypeId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      }

      alert("อัพโหลดไฟล์สำเร็จ");
      // รีเฟรชรายการไฟล์
      await getPetitionFiles();
      // เปลี่ยนเส้นทาง URL
      window.location.href = `http://localhost:3000/services/monitor/follow?id=${petitions.id}`;
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
    }
  }

  // เพิ่มฟังก์ชันสำหรับการแก้ไขไฟล์
  async function handleFileEdit(file: PetitionFile, newFile: File) {
    try {
      const formData = new FormData();
      formData.append("file", newFile);

      const response = await fetch(
        `http://localhost:8000/upload/edit/${file.id}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการแก้ไขไฟล์");
      }

      alert("แก้ไขไฟล์สำเร็จ");
      // รีเฟรชรายการไฟล์
      await getPetitionFiles();
      // เปลี่ยนเส้นทาง URL
      window.location.href = `http://localhost:3000/services/monitor/follow?id=${petitions.id}`;
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขไฟล์");
      window.location.href = `http://localhost:3000/services/monitor/follow?id=${petitions.id}`;
    }
  }

  async function getPetitionFiles() {
    const id = $page.url.searchParams.get("id");
    if (!id) return;

    try {
      const response = await fetch(
        `http://localhost:8000/petitions/files?petitionId=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch petition files");
      }

      const data = await response.json();
      petitionFiles = data.files; // Update to use data.files instead of data
      console.log("Petition files:", petitionFiles);
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์");
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

  async function handleUpload(event: Event, documentTypeId: number) {
    const input = (event.target as any);
    const file = input.files?.[0];
    if (!file) return;

    if (!petitions.id) {
      alert("ไม่พบรหัสคำร้อง");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (petitions.id === null) {
        throw new Error("Petition ID is missing");
      }
      if (documentTypeId === null) {
        throw new Error("Document Type ID is missing");
      }
      formData.append("petitionId", petitions.id.toString());
      formData.append("documentTypeId", documentTypeId.toString());

      const response = await fetch(`http://localhost:8000/upload/upload/${petitions.id}/${documentTypeId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      }

      alert("อัพโหลดไฟล์สำเร็จ");
      // รีเฟรชรายการไฟล์
      await getPetitionFiles();
      // เปลี่ยนเส้นทาง URL
      window.location.href = `http://localhost:3000/services/monitor/follow?id=${petitions.id}`;
    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลดไฟล์");
      window.location.href = `http://localhost:3000/services/monitor/follow?id=${petitions.id}`;
    }
  }

  // เรียกใช้ฟังก์ชันเมื่อ component ถูกโหลด
  onMount(() => {
    getPetitionById();
    getPetitionFiles();
  });

  // ฟังก์ชันสําหรับกลับไปหน้า monitor
  function gotomonitor() {
    window.location.href = "http://localhost:3000/services/monitor";
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
          />
          การทำวิจัย
        </label>
        <label>
          <input
            type="radio"
            name="objective"
            value="2"
            checked={selectedObjective === "2"}
          />
          การขอขึ้นทะเบียนยาในประเทศ
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="objective"
            value="3"
            checked={selectedObjective === "3"}
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
          />
          มรภ.บร.</label
        >
        <label>
          <input
            type="radio"
            name="grant"
            value="2"
            checked={selectedGrant === "2"}
          />
          ส่วนตัว
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="grant"
            value="3"
            checked={selectedGrant === "3"}
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
          />
          ทั่วไป (เกี่ยวข้องกับมนุษย์โดยตรง)
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="2"
            checked={selectedType === "2"}
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
          />
          เข้าข่ายยกเว้นการรับรอง
        </label>
      </div>
    </div>

    {#if petitions.currentLevelId !== 2}
      <div class="document-table">
        <h3>เอกสารประกอบการพิจารณา (ขั้นอนุกรรมการ)</h3>
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
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleFileUpload(e, 1)}
                      id="upload-file-1"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-1");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
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
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleFileUpload(e, 2)}
                      id="upload-file-2"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-2");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
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
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleFileUpload(e, 4)}
                      id="upload-file-4"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-4");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
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
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleFileUpload(e, 9)}
                      id="upload-file-9"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-9");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
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
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleFileUpload(e, 10)}
                      id="upload-file-10"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-10");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}

    {#if petitions.currentLevelId !== 1}
      <div class="document-table" style="margin-top: 20px;">
        <h3>เอกสารประกอบการพิจารณา (ขั้นกรรมการ)</h3>
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
                1. ประวัติส่วนตัว/ผลงานของผู้วิจัย
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 3).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 3) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 3)}
                      id="upload-file-3"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-3");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2"
                >2. แบบประเมินโครงการวิจัยด้วยตนเอง (Self-Assessment Form)
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 5).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 5) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 5)}
                      id="upload-file-5"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-5");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">
                3. การขัดแย้งทางผลประโยชน์ (Conflict of interest)
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 6).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 6) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 6)}
                      id="upload-file-6"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-6");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">
                4. เอกสารชี้แจงผู้เข้าร่วมการวิจัย (Participant information sheet)
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 7).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 7) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 7)}
                      id="upload-file-7"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-7");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">
                5. หนังสือแสดงเจตนายินยอมเข้าร่วมการวิจัย (Informed consent form)
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 8).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 8) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 8)}
                      id="upload-file-8"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-8");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
            <tr>
              <td class="border px-4 py-2">
                6. Investigator’s brochure / ทะเบียนและเอกสารกำกับยาหรือเครื่องมือ
                (ถ้ามี)
              </td>
              <td class="border px-4 py-2">
                {#if petitionFiles.filter((f) => f.documentTypeId === 11).length > 0}
                  {#each petitionFiles.filter((f) => f.documentTypeId === 11) as file}
                    <div class="file-container">
                      <div class="file-info">
                        <i class="fas fa-file-alt file-icon"></i>
                        <span
                          class="file-name cursor-pointer"
                          on:click={() => openFile(file.name)}
                        >
                          {file.name.length > 31
                            ? file.name.substring(0, 35) + "..."
                            : file.name}
                        </span>
                      </div>
                      {#if ![1, 2, 3].includes(petitions.statusId)}
                      <div class="file-actions">
                        <input
                          type="file"
                          style="display: none"
                          on:change={(e) => {
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
                            const element = document.getElementById(
                              `edit-file-${file.id}`,
                            );
                            if (element) element.click();
                          }}
                        >
                          <i class="fas fa-edit"></i>
                          แก้ไข
                        </button>
                      </div>
                      {/if}
                    </div>
                  {/each}
                {:else}
                  <div class="no-file">
                    <input
                      type="file"
                      style="display: none"
                      on:change={(e) => handleUpload(e, 11)}
                      id="upload-file-11"
                    />
                    <button
                      class="action-button upload-button"
                      on:click={() => {
                        const element = document.getElementById("upload-file-11");
                        if (element) element.click();
                      }}
                    >
                      อัปโหลดไฟล์
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}

    <div class="evaluation-section">
      <h3>ข้อเสนอแนะ</h3>
      <div class="evaluation-fields">
        <div class="field-group">
          <label>ข้อเสนอแนะเพิ่มเติม</label>
          <textarea
            class="evaluation-textarea"
            bind:value={petitions.note}
            placeholder="กรุณาระบุข้อเสนอแนะเพิ่มเติม"
          ></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" on:click={gotomonitor}>กลับไปก่อนหน้า</button>
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
    color: #2196f3;
  }

  .file-name {
    color: #2196f3;
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
    background-color: #2196f3;
    color: white;
  }

  .edit-button:hover {
    background-color: #1976d2;
  }

  .upload-button {
    background-color: #4caf50;
    color: white;
  }

  .upload-button:hover {
    background-color: #388e3c;
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
    color: #1565c0;
  }
</style>
