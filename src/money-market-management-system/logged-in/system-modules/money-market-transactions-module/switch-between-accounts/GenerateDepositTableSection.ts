import { Content, ContentTable, Table } from "pdfmake/interfaces";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { ISwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";

export const generateDepositTableSection = (tableData: ISwitchTransaction[]): Content => {

    const table: Table = {
        headerRows: 1,
        widths: ["25%", "50%", "25%"], // Adjust the widths accordingly
        body: [
            [
                { text: "Date/Time Uploaded", style: "tableHeader", fontSize: 7 },
                { text: "Transaction Description", style: "tableHeader", fontSize: 7 },
                { text: "Amount", style: "tableHeader", fontSize: 7 },
            ],
            ...tableData.map(transaction => {
                return [
                    dateFormat_YY_MM_DD(transaction.valueDate ?  transaction.valueDate :Date.now()),
                    { text: `Switch from ${transaction.fromAccount} to ${transaction.toAccount}`},
                    { text: currencyFormat(transaction.amount), alignment: "right" },
                ];
            }),
        ],
    };

    const tableSection: ContentTable = {
        table,
        layout: {
            fillColor: "#fff", // Background color for the table cells
            hLineWidth: (i) => (i === 0 || i === table.body.length) ? 0.1 : 0.1, // Adjust the thickness of horizontal lines
            vLineWidth: () => 0.1, // Adjust the thickness of vertical lines
        },

        margin: [0, 10, 0, 10],
        fontSize: 7,
        style: "table",
    };

    return tableSection;
};
