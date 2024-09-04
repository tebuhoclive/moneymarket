import saveAs from 'file-saver';
// import * as XLSX from 'xlsx';

// export const JsonToExcelOld = (data: any[], filename: string) => {
//   const workbook = XLSX.utils.book_new();
//   const sheet = XLSX.utils.json_to_sheet(data);
//   XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
  
//   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
//   const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
//   saveAs(blob, `${filename}.xlsx`);
// };


// export const JsonToExcel = (data: any[], filename: string, options?: { columnNames?: string[], columnWidths?: number[] }) => {
//   const workbook = XLSX.utils.book_new();
//   const sheet = XLSX.utils.json_to_sheet(data, {
//     header: options?.columnNames, // Custom column names
//     skipHeader: true, // Don't repeat header row
//   });

//   if (options?.columnWidths) {
//     const columnWidths = options.columnWidths.map(width => ({ wch: width }));
//     sheet['!cols'] = columnWidths; // Set column widths
//   }

//   XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

//   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
//   const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//   saveAs(blob, `${filename}.xlsx`);
// };

export const JsonToExcel = ()=>{
  return null
}

