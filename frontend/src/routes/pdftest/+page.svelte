<script>
    import jsPDF from "jspdf";
    import "jspdf-autotable"; // Import the autotable plugin
  
    // Example JSON Data
    let jsonData = {
      title: "My PDF with Table",
      date: "2025-01-22",
      tableData: [
        { name: "Alice", age: 30, city: "New York" },
        { name: "Bob", age: 25, city: "Los Angeles" },
        { name: "Charlie", age: 35, city: "Chicago" },
      ],
    };
  
    // Function to generate PDF with a table
    const generatePDF = () => {
      const doc = new jsPDF();
  
      // Add title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text(jsonData.title, 10, 10);
  
      // Add date
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Date: ${jsonData.date}`, 10, 20);
  
      // Convert JSON data into table format
      const tableHeaders = ["Name", "Age", "City"];
      const tableRows = jsonData.tableData.map((row) => [row.name, row.age, row.city]);
  
      // Add table to the PDF
      doc.autoTable({
        head: [tableHeaders], // Table headers
        body: tableRows,      // Table rows
        startY: 30,           // Y position where the table starts
      });
  
      // Save the PDF
      doc.save("table-document.pdf");
    };
  </script>
  
  <!-- Frontend UI -->
  <main>
    <h1>Create a PDF with a Table</h1>
    <button on:click={generatePDF}>Generate PDF</button>
  </main>
  
  <style>
    main {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
  