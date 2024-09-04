import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { getNaturalPersonsName } from "../../functions/MyFunctions";
import { useAppContext } from "../../functions/Context";

interface ExportExcelProps {
  title: string;
  jsonData: any[]; // JSON data array to export
  headers: string[]; // Header column names
}

const ExportExcel: React.FC<ExportExcelProps> = ({
  jsonData,
  headers,title,
}) => {
  // Add clientName to each transaction
  const { store } = useAppContext();
  const transactionsWithClientName = jsonData.map((transaction) => {
    const clientName = getNaturalPersonsName(transaction.entity, store);
    return {
      ...transaction,
      clientName: clientName,
    };
  });

  const exportToExcel = () => {
    try {
      // Map fields to corresponding headers
      const fieldMappings: Record<string, keyof any> = {
        "Client Name": "clientName", // Add client name mapping
        "Date/Time Uploaded": "dateTimeUploaded",
        "Statement Reference": "reference",
        "Account Number": "allocation", // Add account number mapping
        Amount: "amount",
        "Transaction Date": "transactionDate",
        "Value Date": "valueDate",
      };

      // Extract headers from fieldMappings keys
      const headers = Object.keys(fieldMappings);

      // Combine headers and data
      const worksheetData = [
        headers, // Headers row
        ...transactionsWithClientName.map((item) => {
          return headers.map((header) => {
            const fieldName = fieldMappings[header];
            // Convert date fields to strings
            if (fieldName === "transactionDate" || fieldName === "valueDate") {
              return item[fieldName]
                ? new Date(item[fieldName]).toLocaleString()
                : ""; // Convert to localized string format
            } else if (fieldName === "dateTimeUploaded") {
              // Use valueDate if dateTimeUploaded is empty
              const dateTimeUploaded = item.dateTimeUploaded || item.valueDate;
              return dateTimeUploaded
                ? new Date(dateTimeUploaded).toLocaleString()
                : "";
            } else {
              return fieldName ? item[fieldName] : ""; // Get data based on field mapping
            }
          });
        }),
      ];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Adjust column widths (optional)
      const columnWidths = worksheetData[0].map(() => ({ wch: 20 })); // Adjust as needed
      worksheet["!cols"] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Save file
      saveAs(data, "exported_data.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <button className="btn btn-primary" onClick={exportToExcel}>
      Export to Excel
      <FontAwesomeIcon icon={faFileExcel} />
    </button>
  );
};

export default ExportExcel;
