import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export const exportToExcel = (data:any, fileName:string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Data');

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Add data
  data.forEach((row:any) => {
    const values = headers.map(header => row[header]);
    worksheet.addRow(values);
  });

  // Create a buffer with the Excel file
  workbook.xlsx.writeBuffer().then((buffer:any) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  });
};
