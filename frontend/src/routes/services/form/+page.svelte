<script lang="ts">
  import { onMount } from "svelte";
  import jsPDF from "jspdf";
  import "jspdf-autotable";
  import { font } from "../form/Sarabun-Regular-normal.js";

  // สร้างตัวแปรสำหรับวันที่ปัจจุบัน
  let currentDate = new Date().toISOString().split("T")[0];

  // Prename data
  let prenames: Array<{
    id: number;
    description: string;
  }> = [];

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8000/prename/all");
      if (response.ok) {
        prenames = await response.json();
      } else {
        console.error("Failed to fetch prenames");
      }
    } catch (error) {
      console.error("Error fetching prenames:", error);
    }
  });

  // Department search
  let departmentSearchTerm = "";
  let departmentResults: Array<{
    id: number;
    description: string;
    facultyId: string;
  }> = [];
  let showDepartmentDropdown = false;
  let selectedFaculty = "";

  async function searchDepartments(term: string) {
    departmentSearchTerm = term;
    if (!term) {
      departmentResults = [];
      showDepartmentDropdown = false;
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/departments/name?name=${encodeURIComponent(term)}`
      );
      if (response.ok) {
        departmentResults = await response.json();
        showDepartmentDropdown = true;
      } else {
        console.error("Failed to fetch departments");
        departmentResults = [];
      }
    } catch (error) {
      console.error("Error searching departments:", error);
      departmentResults = [];
    }
  }

  function selectDepartment(dept: {
    id: number;
    description: string;
    facultyId: string;
  }) {
    researcherData.departmentId = dept.id.toString();
    departmentSearchTerm = dept.description;
    selectedFaculty = dept.facultyId;
    showDepartmentDropdown = false;
  }

  // Researcher search
  let researcherSearchTerm = "";
  let researcherResults: Array<{
    id: string;
    prenameId: string;
    name: string;
    surname: string;
    telNo: string;
    email: string;
    department: string;
    faculty: string;
  }> = [];
  let showResearcherDropdown = false;

  async function searchResearchers(term: string) {
    researcherSearchTerm = term;
    if (!term) {
      researcherResults = [];
      showResearcherDropdown = false;
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/researchers/name?name=${encodeURIComponent(term)}`
      );
      if (response.ok) {
        researcherResults = await response.json();
        showResearcherDropdown = true;
      } else {
        console.error("Failed to fetch researchers");
        researcherResults = [];
      }
    } catch (error) {
      console.error("Error searching researchers:", error);
      researcherResults = [];
    }
  }

  let selectedResearcher: any = null; // เพิ่มตัวแปรเก็บนักวิจัยที่เลือก

  function selectResearcher(researcher: any) {
    selectedResearcher = researcher; // เก็บข้อมูลนักวิจัยที่เลือก

    // Fill in all researcher data
    researcherData = {
      prenameId: researcher.prenameId.toString(),
      name: researcher.name,
      surname: researcher.surname,
      departmentId: "",
      telNo: researcher.telNo,
      email: researcher.email,
    };

    // Set the display values
    researcherSearchTerm = researcher.name;
    departmentSearchTerm = researcher.department;
    selectedFaculty = researcher.faculty;

    // Set the petition researcher ID
    formData.researcherId = researcher.id;

    showResearcherDropdown = false;
  }

  // Form data
  let formData = {
    correspondenceNo: "",
    title_th: "",
    title_en: "",
    objectiveId: undefined,
    objectiveOther: "",
    grantId: undefined,
    grantOther: "",
    typeId: undefined,
    researcherId: undefined,
    note: "",
  };

  // Researcher form data
  let researcherData = {
    prenameId: "",
    name: "",
    surname: "",
    departmentId: "",
    telNo: "",
    email: "",
  };

  // State for checkboxes
  let selectedObjective: number | undefined = undefined;
  let selectedGrant: number | undefined = undefined;
  let selectedType: number | undefined = undefined;

  let documentTypes: any[] = [];
  let uploadedFiles: { [key: number]: { name: string; file: File } } = {};
  let petitionId: number | null = null;

  async function fetchDocumentTypes() {
    try {
      const response = await fetch(
        "http://localhost:8000/dataget/documenttype1_11"
      );
      if (response.ok) {
        documentTypes = await response.json();
      } else {
        console.error("Failed to fetch document types");
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
    }
  }

  async function handleFileUpload(event: Event, documentId: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      uploadedFiles[documentId] = {
        name: files[0].name,
        file: files[0],
      };
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    let shouldGeneratePDF = true;

    try {
      // 1. ตรวจสอบข้อมูลที่จำเป็น
      const validationErrors = [];

      // ตรวจสอบข้อมูลนักวิจัย
      if (!researcherData.prenameId) validationErrors.push("กรุณาเลือกคำนำหน้า");
      if (!researcherData.name) validationErrors.push("กรุณากรอกชื่อ");
      if (!researcherData.surname) validationErrors.push("กรุณากรอกนามสกุล");
      if (!researcherData.telNo) validationErrors.push("กรุณากรอกเบอร์โทรศัพท์");
      if (!researcherData.email) validationErrors.push("กรุณากรอกอีเมล");
      if (!departmentSearchTerm) validationErrors.push("กรุณาเลือกสำนักวิชา");
      if (!selectedFaculty) validationErrors.push("กรุณาเลือกคณะ");

      // ตรวจสอบข้อมูลโครงการวิจัย
      if (!formData.title_th) validationErrors.push("กรุณากรอกชื่อเรื่องภาษาไทย");
      if (!formData.title_en) validationErrors.push("กรุณากรอกชื่อเรื่องภาษาอังกฤษ");
      if (!selectedObjective) validationErrors.push("กรุณาเลือกวัตถุประสงค์");
      if (selectedObjective === 3 && !formData.objectiveOther) {
        validationErrors.push("กรุณาระบุวัตถุประสงค์อื่นๆ");
      }
      if (!selectedGrant) validationErrors.push("กรุณาเลือกแหล่งทุน");
      if (selectedGrant === 3 && !formData.grantOther) {
        validationErrors.push("กรุณาระบุแหล่งทุนภายนอก");
      }
      if (!selectedType) validationErrors.push("กรุณาเลือกประเภทโครงการวิจัย");

      // ตรวจสอบไฟล์ที่จำเป็น (มี **)
      const requiredDocs = [1, 2, 4, 9, 10];
      const missingFiles = requiredDocs.filter(id => !uploadedFiles[id]);

      if (missingFiles.length > 0) {
        const missingDocTypes = documentTypes
          .filter(doc => missingFiles.includes(doc.id))
          .map(doc => doc.description);
        validationErrors.push(`กรุณาอัพโหลดไฟล์ที่จำเป็น:\n- ${missingDocTypes.join("\n- ")}`);
      }

      // ถ้ามีข้อผิดพลาด ให้แสดงทั้งหมดและยกเลิกการบันทึก
      if (validationErrors.length > 0) {
        alert(`กรุณาตรวจสอบและกรอกข้อมูลให้ครบถ้วน:\n\n${validationErrors.join("\n")}`);
        return;
      }

      // 2. สร้างนักวิจัยใหม่ (ถ้าจำเป็น)
      let researcherId;
      if (!selectedResearcher) {
        const researcherResponse = await fetch("http://localhost:8000/researchers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(researcherData),
        });

        if (!researcherResponse.ok) {
          const errorData = await researcherResponse.json();
          throw new Error(errorData.error || "ไม่สามารถบันทึกข้อมูลนักวิจัยได้");
        }

        const latestResponse = await fetch("http://localhost:8000/researchers/latest");
        if (!latestResponse.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลนักวิจัยได้");
        }

        const latestResearcher = await latestResponse.json();
        researcherId = latestResearcher.id;
      } else {
        researcherId = selectedResearcher.id;
      }

      // 3. สร้าง petition
      const petitionPayload = {
        ...formData,
        researcherId: researcherId,
        objectiveId: selectedObjective,
        objectiveOther: selectedObjective === 3 ? formData.objectiveOther : "",
        grantId: selectedGrant,
        grantOther: selectedGrant === 3 ? formData.grantOther : "",
        typeId: selectedType,
        statusId: 1,
        currentLevelId: 1,
        staffId: "1",
      };

      // 4. บันทึก petition
      const petitionResponse = await fetch("http://localhost:8000/petitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petitionPayload),
      });

      if (!petitionResponse.ok) {
        const errorData = await petitionResponse.json();
        // ถ้าบันทึก petition ไม่สำเร็จ และเราสร้างนักวิจัยใหม่ ให้ลบนักวิจัยที่เพิ่งสร้าง
        if (!selectedResearcher && researcherId) {
          await fetch(`http://localhost:8000/researchers/${researcherId}`, {
            method: "DELETE",
          });
        }
        throw new Error(errorData.error || "ไม่สามารถบันทึกคำร้องได้");
      }

      // 5. ดึง petition ID ล่าสุด
      const latestPetitionResponse = await fetch("http://localhost:8000/petitions/latest");
      if (!latestPetitionResponse.ok) {
        throw new Error("ไม่สามารถดึงเลขที่คำร้องได้");
      }
      const latestPetition = await latestPetitionResponse.json();
      petitionId = latestPetition[0].id;

      // 6. อัพโหลดไฟล์ทั้งหมด
      const uploadPromises = [];
      for (const [documentId, fileData] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append("file", fileData.file);
        
        const uploadPromise = fetch(
          `http://localhost:8000/upload/upload/${petitionId}/${documentId}`,
          {
            method: "POST",
            body: formData,
          }
        ).then(async response => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `ไม่สามารถอัพโหลดไฟล์ช่องที่ ${documentId}`);
          }
        });
        uploadPromises.push(uploadPromise);
      }

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        // ถ้าเกิดข้อผิดพลาดในการอัพโหลดไฟล์ ให้ลบ petition ที่เพิ่งสร้าง
        await fetch(`http://localhost:8000/petitions/${petitionId}`, {
          method: "DELETE",
        });
        // และถ้าเราสร้างนักวิจัยใหม่ ให้ลบนักวิจัยด้วย
        if (!selectedResearcher && researcherId) {
          await fetch(`http://localhost:8000/researchers/${researcherId}`, {
            method: "DELETE",
          });
        }
        throw new Error(`เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ${error.message}`);
      }

      // 7. สร้าง PDF และรีเซ็ตฟอร์ม
      if (shouldGeneratePDF) {
        generatePDF();
        alert("บันทึกข้อมูลสำเร็จ");
        resetForm();
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  }

  function resetForm() {
    // Reset all form fields
    uploadedFiles = {};
    researcherData = {
      prenameId: "",
      name: "",
      surname: "",
      departmentId: "",
      telNo: "",
      email: "",
    };

    formData = {
      correspondenceNo: "",
      title_th: "",
      title_en: "",
      objectiveId: undefined,
      objectiveOther: "",
      grantId: undefined,
      grantOther: "",
      typeId: undefined,
      researcherId: undefined,
      note: "",
    };

    // Reset search terms and selections
    researcherSearchTerm = "";
    departmentSearchTerm = "";
    selectedFaculty = "";
    selectedResearcher = null;
    selectedObjective = undefined;
    selectedGrant = undefined;
    selectedType = undefined;
    petitionId = null;

    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: HTMLInputElement) => {
      input.value = "";
    });

    // Reset radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach((radio: HTMLInputElement) => {
      radio.checked = false;
    });

    // Reset text inputs
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach((input: HTMLInputElement) => {
      input.value = "";
    });

    // Reset date input
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = currentDate;
    }
  }

  const generatePDF = () => {
    try {
      // ตรวจสอบข้อมูลที่จำเป็นก่อนสร้าง PDF
      if (!researcherData.prenameId || !researcherData.name || !researcherData.surname) {
        throw new Error("กรุณากรอกข้อมูลคำนำหน้า ชื่อ และนามสกุล");
      }

      if (!formData.title_th || !formData.title_en) {
        throw new Error("กรุณากรอกชื่อเรื่องภาษาไทยและภาษาอังกฤษ");
      }

      if (!selectedObjective) {
        throw new Error("กรุณาเลือกวัตถุประสงค์");
      }

      if (!selectedGrant) {
        throw new Error("กรุณาเลือกแหล่งทุน");
      }

      if (!selectedType) {
        throw new Error("กรุณาเลือกประเภทโครงการวิจัย");
      }

      const requiredDocs = [1, 2, 4, 9, 10];
      const missingFiles = requiredDocs.filter(id => !uploadedFiles[id]);

      if (missingFiles.length > 0) {
        const missingDocTypes = documentTypes
          .filter(doc => missingFiles.includes(doc.id))
          .map(doc => doc.description)
          .join("\n- ");
        throw new Error(`กรุณาอัพโหลดไฟล์ที่จำเป็น:\n- ${missingDocTypes}`);
      }

      // สร้าง PDF ถ้าผ่านการตรวจสอบทั้งหมด
      const doc = new jsPDF();
      // ... rest of the existing PDF generation code ...
      // Load Thai font (Sarabun)
      doc.addFileToVFS("Sarabun-Regular.ttf", font);
      doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
      doc.setFont("Sarabun", "normal");

      // Header Section
      const logo =
        "https://th.bing.com/th/id/OIP.CFJHa2V7Aq9YTw8qF2GLzwHaIn?rs=1&pid=ImgDetMain";
      doc.addImage(logo, "JPEG", 10, 10, 20, 20);
      doc.setFontSize(16);
      doc.text("บันทึกข้อความ", 105, 20, { align: "center" });
      doc.text("มหาวิทยาลัยราชภัฏบุรีรัมย์", 105, 30, { align: "center" });
      doc.setFontSize(12);
      doc.text("BRU-H1", 200, 20, { align: "right" });

      // Document Information
      doc.setFontSize(10);
      doc.text(`เลขเอกสาร :   ${formData.correspondenceNo}`, 20, 50);
      doc.line(38, 52, 149, 52); // Draw dot line

      doc.text(`วันที่ :   ${currentDate}`, 150, 50);

      // Subject and Addressee
      doc.setLineHeightFactor(1.5);
      doc.text(
        "เรื่อง : ขออนุมัติทำการวิจัยในมนุษย์และขอรับการรับรองจากคณะกรรมการจริยธรรมการวิจัยในมนุษย์",
        20,
        60
      );
      doc.text("เรียน : ผู้อำนวยการสถาบันวิจัยและพัฒนา", 20, 70);

      // Researcher Information
      const selectedPrename = prenames.find(
        (prename) => prename.id === Number(researcherData.prenameId)
      );
      doc.text(
        `ด้วยข้าพเจ้า :   ${selectedPrename ? selectedPrename.description : ""} ${researcherData.name} ${researcherData.surname}`,
        20,
        80
      );
      doc.line(39, 82, 180, 82); // Draw dot line

      doc.text(`สำนักวิชา :   ${departmentSearchTerm}`, 20, 90);
      doc.line(36, 92, 180, 92); // Draw dot line

      doc.text(`คณะ :   ${selectedFaculty}`, 20, 100);
      doc.line(29, 102, 180, 102); // Draw dot line

      doc.text(`โทรศัพท์ :   ${researcherData.telNo}`, 20, 110);
      doc.line(35, 112, 180, 112); // Draw dot line

      doc.text(`อีเมล :   ${researcherData.email}`, 20, 120);
      doc.line(30, 122, 180, 122); // Draw dot line

      // Research Details
      doc.text(
        `มีความประสงค์จะทำวิจัยเรื่อง (ภาษาไทย) :   ${formData.title_th}`,
        20,
        130
      );
      doc.line(81, 132, 180, 132); // Draw dot line

      doc.text(`(ภาษาอังกฤษ) :   ${formData.title_en}`, 20, 140);
      doc.line(43, 142, 180, 142); // Draw dot line
      doc.text("เพื่อ :", 20, 150);

      // Objectives
      const objectives = [
        { id: 1, text: "การทำวิจัย", selected: selectedObjective === 1 },
        {
          id: 2,
          text: "การขอขึ้นทะเบียนยาในประเทศ",
          selected: selectedObjective === 2,
        },
        {
          id: 3,
          text: "อื่นๆ (โปรดระบุ)",
          selected: selectedObjective === 3,
          other: formData.objectiveOther,
        },
      ];

      objectives.forEach((obj, index) => {
        doc.circle(25, 160 + index * 10, 1.5); // Draw circle for checkbox
        if (obj.selected) {
          doc.circle(25, 160 + index * 10, 1, "F"); // Fill circle if selected
        }
        doc.text(obj.text, 30, 161 + index * 10);
        if (obj.other) {
          doc.text(obj.other, 30, 190); // Additional text for "other" option
        }
        doc.line(30, 192, 180, 192); // Draw dot line below the other text
      });

      // Funding Section
      doc.text("ได้รับทุนสนับสนุนการทำวิจัยจาก :", 20, 200);
      const grants = [
        { id: 1, text: "มรภ.บร.", selected: selectedGrant === 1 },
        { id: 2, text: "ส่วนตัว", selected: selectedGrant === 2 },
        {
          id: 3,
          text: "แหล่งทุนภายนอก (โปรดระบุ)",
          selected: selectedGrant === 3,
          other: formData.grantOther,
        },
      ];

      grants.forEach((grant, index) => {
        doc.circle(25, 210 + index * 10, 1.5); // Draw circle for checkbox
        if (grant.selected) {
          doc.circle(25, 210 + index * 10, 1, "F"); // Fill circle if selected
        }
        doc.text(grant.text, 30, 211 + index * 10);
        if (grant.other) {
          doc.text(grant.other, 30, 240); // Additional text for "other" option
        }
        doc.line(30, 242, 180, 242); // Draw dot line below the other text
      });

      // Research Project Type
      doc.text("ประเภทโครงการวิจัย :", 20, 250);
      const types = [
        {
          id: 1,
          text: "ทั่วไป (เกี่ยวข้องกับมนุษย์โดยตรง)",
          selected: selectedType === 1,
        },
        {
          id: 2,
          text: "ความเสี่ยงต่ำ (เช่น ศึกษาข้อมูลย้อนหลังจากเวชระเบียน บทความ บทสัมภาษณ์)",
          selected: selectedType === 2,
        },
      ];

      types.forEach((type, index) => {
        doc.circle(25, 260 + index * 10, 1.5); // Draw circle for checkbox
        if (type.selected) {
          doc.circle(25, 260 + index * 10, 1, "F"); // Fill circle if selected
        }
        doc.text(type.text, 30, 261 + index * 10);
      });

      // Document Attachment Section
      doc.addPage(); // Add new page
      doc.text("โดยได้แนบเอกสารประกอบการพิจารณา จำนวน 2 ชุด ดังนี้", 20, 20);
      let yPosition = 35; // Starting position for the document table
      doc.setFontSize(10);

      // Draw table headers
      doc.text("รายการเอกสาร", 23, yPosition);
      doc.text("อัพโหลดไฟล์", 152, yPosition);
      yPosition += 10;

      // Draw the top border of the table
      doc.line(20, yPosition - 6, 180, yPosition - 6); // Top border

      // Draw a line to close the header
      doc.line(20, yPosition - 17, 180, yPosition - 17); // Header closing line

      documentTypes.forEach((docType) => {
        doc.text(`${docType.id}. ${docType.description}`, 23, yPosition);
        const fileStatus = uploadedFiles[docType.id]
          ? uploadedFiles[docType.id].name.length > 5
            ? uploadedFiles[docType.id].name.slice(0, 5) +
              "." +
              uploadedFiles[docType.id].name.split(".").pop()
            : uploadedFiles[docType.id].name
          : "ไม่มีเอกสาร";
        doc.text(fileStatus, 153, yPosition);
        yPosition += 10;
      });

      // Draw the bottom border of the table
      yPosition -= 5; // Move up by 5 units
      doc.line(20, yPosition, 180, yPosition); // Bottom border

      // Draw vertical lines for column separation
      doc.line(143, 28, 143, yPosition); // Vertical line for "รายการเอกสาร"
      // Draw additional vertical lines
      doc.line(20, 28, 20, yPosition); // Vertical line for the left side
      doc.line(180, 28, 180, yPosition); // Vertical line for the right side

      // Save the PDF
      doc.save(
        "เอกสารขออนุมัติทำการวิจัยในมนุษย์และขอรับการรับรองจากคณะกรรมการจริยธรรมการวิจัยในมนุษย์.pdf"
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("เกิดข้อผิดพลาดในการสร้าง PDF");
    }
  };

  fetchDocumentTypes();
</script>

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

  <form on:submit={handleSubmit}>
    <div class="form-row two-col">
      <div class="field">
        <label>เลขเอกสาร</label>
        <div class="dotted-line">
          <input type="text" bind:value={formData.correspondenceNo} />
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
        <span
          >ขออนุมัติทำการวิจัยในมนุษย์และขอรับการรับรองจากคณะกรรมการจริยธรรมการวิจัยในมนุษย์</span
        >
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>เรียน</label>
        <span>ผู้อำนวยการสถาบันวิจัยและพัฒนา</span>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>ด้วยข้าพเจ้า</label>
        <div class="dotted-line researcher-input">
          <div class="researcher-field-group">
            <select bind:value={researcherData.prenameId}>
              <option value="">-- คำนำหน้า --</option>
              {#each prenames as prename}
                <option value={prename.id.toString()}
                  >{prename.description}</option
                >
              {/each}
            </select>
            <input
              type="text"
              bind:value={researcherSearchTerm}
              on:input={(e) => searchResearchers(e.currentTarget.value)}
              on:blur={() => {
                setTimeout(() => {
                  showResearcherDropdown = false;
                  researcherData.name = researcherSearchTerm;
                }, 200);
              }}
              placeholder="ชื่อ"
            />
            <input
              type="text"
              bind:value={researcherData.surname}
              placeholder="นามสกุล"
            />
          </div>
          {#if showResearcherDropdown && researcherResults.length > 0}
            <div class="researcher-dropdown">
              {#each researcherResults as researcher}
                <div
                  class="researcher-option"
                  on:click={() => selectResearcher(researcher)}
                >
                  {researcher.name}
                  {researcher.surname}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>สำนักวิชา</label>
        <div class="dotted-line department-input">
          <input
            type="text"
            bind:value={departmentSearchTerm}
            on:input={(e) => searchDepartments(e.currentTarget.value)}
            placeholder="พิมพ์เพื่อค้นหาสาขา"
          />
          {#if showDepartmentDropdown && departmentResults.length > 0}
            <div class="department-dropdown">
              {#each departmentResults as dept}
                <div
                  class="department-option"
                  on:click={() => selectDepartment(dept)}
                >
                  {dept.description}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>คณะ</label>
        <div class="dotted-line">
          <input type="text" bind:value={selectedFaculty} readonly />
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="field full-width">
        <label>โทรศัพท์</label>
        <div class="dotted-line">
          <input type="text" bind:value={researcherData.telNo} />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>อีเมล</label>
        <div class="dotted-line">
          <input type="text" bind:value={researcherData.email} />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>มีความประสงค์จะทำวิจัยเรื่อง(ภาษาไทย)</label>
        <div class="dotted-line">
          <input type="text" bind:value={formData.title_th} />
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="field full-width">
        <label>(ภาษาอังกฤษ)</label>
        <div class="dotted-line">
          <input type="text" bind:value={formData.title_en} />
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
            value={1}
            bind:group={selectedObjective}
          />
          การทำวิจัย
        </label>
        <label>
          <input
            type="radio"
            name="objective"
            value={2}
            bind:group={selectedObjective}
          />
          การขอขึ้นทะเบียนยาในประเทศ
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="objective"
            value={3}
            bind:group={selectedObjective}
          />
          อื่น ๆ
          <div class="dotted-line">
            <input
              type="text"
              class="inline-input"
              placeholder="ระบุรายละเอียด"
              bind:value={formData.objectiveOther}
              disabled={selectedObjective !== 3}
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
            value={1}
            bind:group={selectedGrant}
          />
          มรภ.บร.
        </label>
        <label>
          <input
            type="radio"
            name="grant"
            value={2}
            bind:group={selectedGrant}
          />
          ส่วนตัว
        </label>
        <label class="inline-container">
          <input
            type="radio"
            name="grant"
            value={3}
            bind:group={selectedGrant}
          />
          แหล่งทุนภายนอก (โปรดระบุ)
          <div class="dotted-line">
            <input
              type="text"
              class="inline-input"
              placeholder="ระบุรายละเอียด"
              bind:value={formData.grantOther}
              disabled={selectedGrant !== 3}
            />
          </div>
        </label>
      </div>
    </div>
    <div class="funding-source">
      <p>ประเภทโครงการวิจัย</p>
      <div class="checkbox-group">
        <label>
          <input type="radio" name="type" value={1} bind:group={selectedType} />
          ทั่วไป (เกี่ยวข้องกับมนุษย์โดยตรง)
        </label>
        <label>
          <input type="radio" name="type" value={2} bind:group={selectedType} />
          ความเสี่ยงต่ำ (เช่น ศึกษาข้อมูลย้อนหลังจากเวชระเบียน บทความ บทสัมภาษณ์
          แบบสอบถาม ศึกษาสิ่งส่งตรวจต่างๆ จำกร่างกาย เป็นต้น)
        </label>
      </div>

      <div class="document-table">
        <h3>โดยได้แนบเอกสารประกอบการพิจารณา จำนวน 2 ชุด ดังนี้</h3>
        <table>
          <thead>
            <tr>
              <th>รายการเอกสาร</th>
              <th>อัพโหลดไฟล์</th>
            </tr>
          </thead>
          <tbody>
            {#each documentTypes as doc}
              <tr>
                <td>
                  {doc.id}. {doc.description}
                  {#if doc.id === 1 || doc.id === 2 || doc.id === 4 || doc.id === 9 || doc.id === 10}
                    <span class="asterisk">**</span>
                  {/if}
                </td>
                <td>
                  <div class="upload-container">
                    <label
                      for="file-upload-{doc.id}"
                      class="custom-file-upload"
                    >
                      <span class="choose-file-btn">เลือกไฟล์</span>
                      {#if uploadedFiles[doc.id]}
                        <span class="file-name truncated">
                          {uploadedFiles[doc.id].name.length > 5
                            ? uploadedFiles[doc.id].name.slice(0, 5) +
                              "." +
                              uploadedFiles[doc.id].name.split(".").pop()
                            : uploadedFiles[doc.id].name}
                        </span>
                      {:else}
                        <span class="no-file">ยังไม่มีไฟล์</span>
                      {/if}
                    </label>
                    <input
                      type="file"
                      id="file-upload-{doc.id}"
                      class="upload-input"
                      on:change={(e) => handleFileUpload(e, doc.id)}
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    <div class="form-actions">
      <button type="submit" on:click={generatePDF}
        >ส่งเอกสารขออนุมัติทำการวิจัย</button
      >
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

  .file-upload {
    position: relative;
    display: inline-block;
    width: 100%;
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

  .center-text {
    text-align: center;
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
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .form-actions button:hover {
    opacity: 0.9;
  }

  .department-input {
    position: relative;
  }

  .department-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .department-option {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .department-option:hover {
    background-color: #f0f0f0;
  }

  .researcher-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .researcher-option {
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .researcher-option:hover {
    background-color: #f0f0f0;
  }

  select {
    width: 100%;
    padding: 8px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 1em;
    cursor: pointer;
  }

  select option {
    background: white;
    color: #333;
    padding: 8px;
  }

  .researcher-input {
    position: relative;
  }

  .researcher-field-group {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  .researcher-field-group select {
    width: 150px;
    flex-shrink: 0;
  }

  .researcher-field-group input {
    flex: 1;
  }

  .upload-container {
    position: relative;
    width: 100%;
  }

  .custom-file-upload {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .choose-file-btn {
    display: inline-block;
    padding: 6px 12px;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .choose-file-btn:hover {
    background-color: #0056b3;
  }

  .file-name {
    color: #333;
    word-break: break-all;
  }

  .no-file {
    color: #666;
  }

  .upload-input {
    display: none;
  }

  .file-name.truncated {
    white-space: nowrap; /* Prevent line breaks */
    overflow: hidden; /* Hide overflow */
    text-overflow: ellipsis; /* Add ellipsis for overflow text */
    max-width: 150px; /* Set a maximum width for the file name */
  }

  .asterisk {
    color: red; /* Optional: Change color of the asterisk */
  }
</style>
