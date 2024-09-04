import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import DownloadIcon from "@mui/icons-material/Download";
import { GridColDef } from "@mui/x-data-grid";
// import { CSVLink } from "react-csv";

interface ExportToCSVButtonEntitiesProps {
  data: any[]; // Adjust the type according to your data structure
  columns: GridColDef[];
  label:string;
}

export const ExportToCSVButtonEntities: React.FC<
  ExportToCSVButtonEntitiesProps
> = ({ data, columns, label }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((col) => col.field)
  );

  const handleToggleColumnVisibility = (columnField: string) => {
    setVisibleColumns((prevVisibleColumns) =>
      prevVisibleColumns.includes(columnField)
        ? prevVisibleColumns.filter((field) => field !== columnField)
        : [...prevVisibleColumns, columnField]
    );
  };

  const csvData = [
    // Headers row
    visibleColumns.map((colField) => {
      const col = columns.find((column) => column.field === colField);
      return col ? String(col.headerName || "") : colField;
    }),
    // Data rows
    ...data.map((row) =>
      visibleColumns.map((colField) => String(row[colField]))
    ),
  ].slice(0); // Skip the first row

  return (
    <div>
      {/* <CSVLink
        data={csvData}
        headers={visibleColumns.map((colField) => {
          const col = columns.find((column) => column.field === colField);
          return {
            label: col ? col.headerName || "" : colField,
            key: colField,
          };
        })}
        filename={label}
      >
        <IconButton data-uk-tooltip="Export to CSV">
          <DownloadIcon />
        </IconButton>
      </CSVLink> */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}
      >
        {columns.map((col) => (
          <div key={col.field} style={{ marginRight: "20px" }}>
            <input
              className="uk-checkbox"
              type="checkbox"
              checked={visibleColumns.includes(col.field)}
              onChange={() => handleToggleColumnVisibility(col.field)}
              style={{ marginRight: "5px" }}
            />
            <span style={{ fontSize: "14px" }}>{col.headerName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
