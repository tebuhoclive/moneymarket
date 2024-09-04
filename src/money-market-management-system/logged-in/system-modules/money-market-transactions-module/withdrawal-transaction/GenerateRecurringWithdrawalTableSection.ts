import { Content, ContentTable, Table } from "pdfmake/interfaces";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
import { IRecurringWithdrawalInstruction } from "../../../../../shared/models/recurring-withdrawal-instruction/RecurringWithdrawalInstructionModel";

export const generateRecurringTableSection = (tableData: IRecurringWithdrawalInstruction[]): Content => {


    const table: Table = {
        headerRows: 1,
        widths: ["16.66%", "16.66%", "16.66%", "16.66%", "16.66%", "16.66%"],
        // Adjust the widths accordingly
        body: [
            [
                { text: "Transaction Date", style: "tableHeader", fontSize: 7 },
                { text: "Client Name", style: "tableHeader", fontSize: 7 },
                { text: "Client Account", style: "tableHeader", fontSize: 7 },
                { text: "Recurring Amount", style: "tableHeader", fontSize: 7 },
                { text: "Bank Name", style: "tableHeader", fontSize: 7 },
                { text: "Recurring Day", style: "tableHeader", fontSize: 7 },
            ],
            ...tableData.map(transaction => {
                return [
                    { text: dateFormat_YY_MM_DD(transaction.transactionDate)},
                    { text: transaction.entity},
                    { text: transaction.allocation},
                    { text: currencyFormat(transaction.amount), alignment: "right" },
                    { text: transaction.bank},
                    { text: transaction.recurringDay},
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
