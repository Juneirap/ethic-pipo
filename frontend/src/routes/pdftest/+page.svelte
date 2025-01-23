<script>
  import jsPDF from "jspdf";
  import "jspdf-autotable";
  import { font } from "../pdftest/Kanit-Regular-normal.js";

  // Example JSON Data with Thai text
  let jsonData = {
    title: "รายงานข้อมูลพนักงาน",
    date: "22 มกราคม 2568",
    tableData: [
      { name: "สมชาย ใจดี", age: 30, city: "กรุงเทพมหานคร" },
      { name: "อรทัย ชื่นสุข", age: 25, city: "เชียงใหม่" },
      { name: "วิชัย ว่องไว", age: 35, city: "ภูเก็ต" },
    ],
  };

  // Function to generate PDF with Thai support
  const generatePDF = () => {
    const doc = new jsPDF();

    // Load Thai font (Kanit)
    doc.addFileToVFS("Kanit-Regular.ttf", font);
    doc.addFont("Kanit-Regular.ttf", "Kanit", "normal");
    doc.setFont("Kanit", "normal");

    // Set title with Thai text
    doc.setFontSize(18);
    doc.text(jsonData.title, 10, 15);

    // Add date in Thai format
    doc.setFontSize(14);
    doc.text(`วันที่: ${jsonData.date}`, 10, 25);

    // Convert JSON data into table format with Thai text
    const tableHeaders = [["ชื่อ", "อายุ", "เมือง"]];
    const tableRows = jsonData.tableData.map((row) => [row.name, row.age, row.city]);

    // Add table to the PDF
    doc.autoTable({
      head: tableHeaders,
      body: tableRows,
      startY: 35,
      styles: { font: "Kanit", fontSize: 12 }, // Thai font styling
      headStyles: { fillColor: [0, 150, 136], textColor: 255, fontStyle: "bold" }, // Header styling
      margin: { top: 40 }, // Ensure space from title
    });

    // Save the PDF
    doc.save("thai-employee-report.pdf");
  };
</script>

<main>
  <h1>สร้าง PDF พร้อมข้อมูลภาษาไทย</h1>
  <button on:click={generatePDF}>สร้าง PDF</button>
</main>

<style>
  main {
    padding: 20px;
    font-family: 'Kanit', sans-serif;
    text-align: center;
  }
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
  }
  button:hover {
    background-color: #45a049;
  }
</style>