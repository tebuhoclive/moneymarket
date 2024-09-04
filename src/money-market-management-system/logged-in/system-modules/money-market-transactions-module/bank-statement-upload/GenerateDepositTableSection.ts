import { Content, ContentTable, Table } from "pdfmake/interfaces";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import {
  dateFormat_YY_MM_DD,
  dateFormat_YY_MM_DD_NEW,
} from "../../../../../shared/utils/utils";

export const generateDepositTableSection = (tableData: any[]): Content => {
  const table: Table = {
    headerRows: 1,
    widths: [
      "14.29%",
      "14.29%",
      "14.29%",
      "14.29%",
      "14.29%",
      "14.29%",
      "14.29%",
    ], // Adjust the widths to spread them evenly
    body: [
      [
        { text: "Client Name", style: "tableHeader", fontSize: 7 },
        { text: "Date/Time Uploaded", style: "tableHeader", fontSize: 7 },
        { text: "Account Number", style: "tableHeader", fontSize: 7 },
        { text: "Statement Reference", style: "tableHeader", fontSize: 7 },
        { text: "Amount", style: "tableHeader", fontSize: 7 },
        { text: "Transaction Date", style: "tableHeader", fontSize: 7 },
        { text: "Value Date", style: "tableHeader", fontSize: 7 },
      ],
      ...tableData.map((transaction) => {
        return [
          { text: transaction.clientName },
          dateFormat_YY_MM_DD(transaction.dateTimeUploaded ?? Date.now()),
          { text: transaction.allocation },
          { text: transaction.reference },
          { text: currencyFormat(transaction.amount), alignment: "right" },
          { text: dateFormat_YY_MM_DD_NEW(transaction.transactionDate) },
          { text: dateFormat_YY_MM_DD_NEW(transaction.valueDate) },
        ];
      }),
    ],
  };

  const tableSection: ContentTable = {
    table,
    layout: {
      fillColor: "#fff", // Background color for the table cells
      hLineWidth: (i) => (i === 0 || i === table.body.length ? 0.1 : 0.1), // Adjust the thickness of horizontal lines
      vLineWidth: () => 0.1, // Adjust the thickness of vertical lines
    },
    margin: [0, 2, 5, 20], // Adjust the margin to fit the columns, with right margin set to 20 units
    fontSize: 7,
    style: "table",
  };

  return tableSection;
};
