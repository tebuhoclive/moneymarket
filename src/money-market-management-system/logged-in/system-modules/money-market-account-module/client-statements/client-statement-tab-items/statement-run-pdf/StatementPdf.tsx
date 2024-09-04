import { capitaliseTransactionLogicAmount, capitaliseTransactionLogicDays, getBase64ImageFromURL } from "../../../../../../../shared/functions/MyFunctions";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { observer } from "mobx-react-lite";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clientEmail, clientName, clientPostalAddress, entityNumber } from "../../../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";
import { useAppContext } from "../../../../../../../shared/functions/Context";
import { getProductName } from "../../../../reports-module/transactions/GetProductCode";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { roundOff } from "../../../../../../../shared/functions/Directives";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

interface IProps {
    accountId: string;
    filteredTransactions: IStatementTransaction[];
    totalDays: number;
    totalDistribution: number;
    startDate: any;
    endDate: any;

}

export const StatementPDFComponent = observer((props: IProps) => {
    const { store } = useAppContext();
    const { accountId, filteredTransactions, startDate, endDate } = props;


    const account = store.mma.all.find((a) => a.asJson.id === accountId)?.asJson as IMoneyMarketAccount;

    const $startDate = dateStringToTimestamp(startDate);
    const $endDate = dateStringToTimestamp(endDate);

    const openingBalance =
        filteredTransactions &&
        (filteredTransactions[0]?.balance || 0);

    const closingBalance =
        filteredTransactions &&
        (
            filteredTransactions[filteredTransactions.length - 1]
                ?.balance || 0
        );


    const totalDeposits = filteredTransactions
        .filter((item) => item.remark.toLowerCase().includes("deposit"))
        .reduce((acc, item) => acc + item.amount, 0);

    const totalWithdrawals = filteredTransactions
        .filter((item) => item.remark.toLowerCase().includes("withdraw"))
        .reduce((acc, item) => acc + item.amount, 0);

    const generatePDF = async () => {
        const header = await getBase64ImageFromURL(`${process.env.PUBLIC_URL}/headerV2.png`);
        const footer = await getBase64ImageFromURL(`${process.env.PUBLIC_URL}/footerV2.png`);

        const pdfMake = require("pdfmake");

        const docDefinition: any = {
            pageMargins: [40, 160, 40, 160], // Adjusted margins to keep content away from header and footer
            header: {
                image: `${header}`,
                width: 590,
                height: 100,
                margin: [0, 0, 0, 0], // Adjust margin as needed
                alignment: "center",
            },
            footer: {
                image: `${footer}`,
                width: 590,
                height: 100,
                margin: [0, 0, 0, 0], // Adjust margin
                alignment: "center",
            },
            content: [
                { text: "", margin: [0, 0, 0, 0] },
                {
                    columns: [
                        {
                            stack: [
                                {
                                    table: {
                                        widths: [235],
                                        body: [
                                            [
                                                {
                                                    stack: [
                                                        { text: `${clientName(account.id, store)}`, style: "subheader" },
                                                        { text: `Profile Number: ${entityNumber(account?.id, store)}`, style: "infoText" },
                                                        { text: `Postal Address: ${clientPostalAddress(account.id, store)}`, style: "infoText" },
                                                        { text: `Email: ${clientEmail(account.id, store)}`, style: "infoText" },
                                                    ],
                                                },
                                            ],
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i: number, node: any) {
                                            return i === 0 || i === node.table.body.length ? 1 : 0;
                                        },
                                        vLineWidth: function (i: number, node: any) {
                                            return i === 0 || i === node.table.widths.length ? 1 : 0;
                                        },
                                        hLineColor: function (i: number, node: any) {
                                            return "#004c98";
                                        },
                                        vLineColor: function (i: number, node: any) {
                                            return "#004c98";
                                        },
                                    },
                                },
                            ],
                            margin: [0, 0, 20, 0],
                        },
                        {
                            stack: [
                                {
                                    table: {
                                        widths: [235],
                                        body: [
                                            [
                                                {
                                                    stack: [
                                                        { text: `Account Number: ${account.accountNumber}`, style: "subheader" },
                                                        { text: `Instrument Code: ${account.accountType}`, style: "infoText" },
                                                        { text: `Instrument Name: ${getProductName(store, account.accountType)}`, style: "infoText" },
                                                        { text: `Rate: ${account.clientRate}`, style: "infoText" },
                                                    ],
                                                },
                                            ],
                                        ],
                                    },
                                    layout: {
                                        hLineWidth: function (i: number, node: any) {
                                            return i === 0 || i === node.table.body.length ? 1 : 0;
                                        },
                                        vLineWidth: function (i: number, node: any) {
                                            return i === 0 || i === node.table.widths.length ? 1 : 0;
                                        },
                                        hLineColor: function (i: number, node: any) {
                                            return "#004c98";
                                        },
                                        vLineColor: function (i: number, node: any) {
                                            return "#004c98";
                                        },
                                    },
                                },
                            ],
                            margin: [0, 0, 0, 0],
                        },
                    ],
                },
                { text: "", margin: [0, 20, 0, 0] },
                {
                    text: `STATEMENT PERIOD: ${dateFormat_YY_MM_DD($startDate)} - ${dateFormat_YY_MM_DD($endDate)}`,
                    margin: [5, 15, 0, 0],
                    fontSize: 8,
                    bold: true,
                },
                {
                    canvas: [
                        {
                            type: "rect",
                            x: 0,
                            y: 0,
                            w: 135,
                            h: 16,
                            r: 5,
                            lineColor: "#004c98",
                            color: "#004c98",
                        },
                    ],
                    margin: [0, 20, 0, 0],
                },
                {
                    text: `Opening Balance: ${roundOff(openingBalance)}`,
                    margin: [3, -13, 0, 10],
                    color: "white",
                    fontSize: 8,
                    bold: true,
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["auto", "auto", "auto", "auto", "auto", "auto", "*"],
                        body: [
                            [
                                { text: "Date", style: "tableHeader" },
                                { text: "Amount", style: "tableHeader" },
                                { text: "Balance", style: "tableHeader" },
                                { text: "Rate", style: "tableHeader" },
                                { text: "Days", style: "tableHeader" },
                                { text: "Interest", style: "tableHeader" },
                                { text: "Remark", style: "tableHeader" },
                            ],
                            ...filteredTransactions.map((item) => [
                                { text: dateFormat_YY_MM_DD(item.date), style: "tableContent" },
                                { text: (item.amount), style: "tableContent" },
                                { text: (item.balance), style: "tableContent" },
                                { text: item.rate, style: "tableContent" },
                                { text: capitaliseTransactionLogicDays(item), style: "tableContent" },
                                { text: capitaliseTransactionLogicAmount(item), style: "tableContent" },
                                { text: item.remark, style: "tableContent" },
                            ]),
                        ],
                    },
                    layout: {
                        hLineWidth: function (i: number, node: any) {
                            return 0.5;
                        },
                        vLineWidth: function (i: number, node: any) {
                            return 0.5;
                        },
                        hLineColor: function (i: number, node: any) {
                            return "#004c98";
                        },
                        vLineColor: function (i: number, node: any) {
                            return "#004c98";
                        },
                    },
                    margin: [0, 5, 0, 20],
                    pageBreakBefore: function (currentNode: any, followingNodesOnPage: any, nodesOnNextPage: any, previousNodesOnPage: any) {
                        return currentNode.startPosition.top + currentNode.table.body.length * 10 > 700;
                    }
                },
                {
                    canvas: [
                        {
                            type: "rect",
                            x: 0,
                            y: 0,
                            w: 135,
                            h: 16,
                            r: 5,
                            lineColor: "#004c98",
                            color: "#004c98",
                        },
                    ],
                    margin: [0, -8, 0, 0],
                },
                {
                    text: `Closing Balance ${closingBalance}`,
                    margin: [3, -13, 0, 10],
                    color: "white",
                    fontSize: 8,
                    bold: true,
                },
                { text: "TRANSACTION SUMMARY", color: "lightgrey", fontSize: 10, margin: [0, 10, 0, 2] },
                {
                    table: {
                        headerRows: 1,
                        margin: [0, -20, 0, 0],
                        widths: ["auto", "auto"],
                        body: [
                            [
                                { text: "Total", color: "black", fontSize: 7 },
                                { text: "Amount", color: "black", fontSize: 7 },
                            ],
                            [
                                { text: "Deposit", style: "tableContent" },
                                { text: `${(totalDeposits)}`, style: "tableContent" },
                            ],
                            [
                                { text: "Withdrawal", style: "tableContent" },
                                { text: `${(totalWithdrawals)}`, style: "tableContent" },
                            ],
                        ],
                    },
                    layout: {
                        hLineWidth: function (i: number, node: any) {
                            return i === 0 || i === node.table.body.length ? 1 : 0;
                        },
                        vLineWidth: function (i: number, node: any) {
                            return i === 0 || i === node.table.widths.length ? 1 : 0;
                        },
                        hLineColor: function (i: number, node: any) {
                            return "#004c98";
                        },
                        vLineColor: function (i: number, node: any) {
                            return "#004c98";
                        },
                    },
                },
                {
                    text: `Statement Date: ${dateFormat_YY_MM_DD(Date.now())}`,
                    margin: [3, 14, 0, 0],
                    color: "black",
                    fontSize: 7,
                    bold: true,
                },
                {
                    text: "Generated By: IJG Back Office",
                    margin: [3, 0, 0, 10],
                    color: "black",
                    fontSize: 7,
                    bold: true,
                },
            ],
            styles: {
                period: {
                    fonSize: 5,
                    margin: [0, 10, 0, 5],
                },
                subheader: {
                    fontSize: 8,
                    bold: true,
                    margin: [0, 10, 0, 5],
                },
                infoText: {
                    fontSize: 7,
                    margin: [0, 2, 0, 2],
                },
                tableHeader: {
                    bold: true,
                    fontSize: 8,
                    color: "white",
                    fillColor: "#004c98",
                    alignment: "left",
                },
                tableContent: {
                    fontSize: 7,
                    alignment: "left",
                },
            },
        };

        pdfMake.createPdf(docDefinition).download(`MMA Client Statement ${account.accountNumber}`);
    };



    return (
            <button
                className="btn btn-primary"
                onClick={generatePDF}>
                <FontAwesomeIcon icon={faFilePdf} />
            </button>
    )
})


function dateStringToTimestamp(dateString: string): number {
    return Date.parse(dateString);
}