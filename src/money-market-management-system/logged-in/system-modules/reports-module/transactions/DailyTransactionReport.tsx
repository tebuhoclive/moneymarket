import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { dateFormat_DD_MM_YY, dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../shared/utils/utils';
import { numberFormat } from "../../../../../shared/functions/Directives";
import { flagBackDatedTransaction, flagDeletedTransaction } from "./DailyTransactionFunctions";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { NoData } from "../../../../../shared/components/nodata/NoData";
import pdfMake from "pdfmake/build/pdfmake";
import { ExportAsExcel } from "react-export-table";
import { faFileExcel, faFilePdf, faMailBulk } from "@fortawesome/free-solid-svg-icons";

import { CustomOpenAccordion } from "../../../../../shared/components/accordion/Accordion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../dialogs/ModalName";
import DailyTransactionStatementReportModal from "../../../dialogs/reports/daily-transaction-report/DailyTransactionStatementReportModal";
import showModalFromId from "../../../../../shared/functions/ModalShow";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";

export interface IDailyTransactionReport {
  id: string;
  clientName: string;
  accountNumber: string;
  productCode: string;
  transactionType: string;
  transactionDate: number;
  valueDate: number;
  capturedDate: number;
  transactionAmount: number;
  transactionStatus: string;
}

interface IEntity {
  entityId: string;
  entityDisplayName: string;
}
export interface ISelectedClient {
  clientName: string;
  transactions: IDailyTransactionReport[];
}

const DailyTransactionReport = () => {

  const { api, store } = useAppContext();
  const todaysDate = Date.now();
  const [reportDate, setReportDate] = useState(todaysDate);

  const [loading, setLoading] = useState(false);

  const transactions: IDailyTransactionReport[] = [];

  const clients: IEntity[] = [
    ...store.client.naturalPerson.all.map(client => client.asJson),
    ...store.client.legalEntity.all.map(client => client.asJson)
  ];

  const accounts: IMoneyMarketAccount[] = [
    ...store.mma.all.map(account => account.asJson)
  ]

  const getClientName = (parentEntityId: string): string => {
    const client = clients.find(client => client.entityId === parentEntityId);
    return client ? client.entityDisplayName : "";
  };

  const getAccountName = (accountNumber: string): string => {
    const account = accounts.find(account => account.accountNumber === accountNumber);
    return account ? account.accountName : "";
  };

  const handleFilterDateChange = (date: number) => {
    setReportDate(date);
    setSelectedClients([]);
  }
  const handleFilterDateReset = () => {
    setReportDate(Date.now());
    setSelectedClients([]);
  }

  const filterTransactionsByDate = (transactions: IDailyTransactionReport[], date: number): IDailyTransactionReport[] => {
    return transactions.filter(transaction => dateFormat_YY_MM_DD(transaction.valueDate) === (reportDate ? dateFormat_YY_MM_DD(reportDate) : dateFormat_YY_MM_DD(todaysDate)));
  };

  const deposits = store.depositTransaction.all.filter((depositTransaction) => {
    const { depositNodeType, transactionStatus, transactionType } = depositTransaction.asJson;

    return (
      (
        (depositNodeType === "Child" && transactionStatus === "Completed") ||
        transactionStatus === "Completed" ||
        transactionStatus === "Corrected"
      ) && !(transactionType === "Split" && depositNodeType === "Parent")
    );
  }).map((depositTransaction) => depositTransaction.asJson);

  const depositTransactions: IDailyTransactionReport[] = deposits.map(transaction => ({
    id: transaction.id,
    accountNumber: transaction.accountNumber || "",
    transactionDate: transaction.transactionDate || 0,
    transactionAmount: transaction.transactionStatus === "Corrected" ? -transaction.amount : transaction.amount || 0,
    productCode: transaction.productCode || "",
    transactionType: "Deposit",
    capturedDate: transaction.transactionDate || 0,
    valueDate: transaction.valueDate || 0,
    clientName: transaction.entityNumber || "",
    transactionStatus: transaction.transactionStatus
  }));

  //WITHDRAWALS 
  const withdrawals = store.withdrawalTransaction.all.filter((withdrawalTransaction) => {
    return withdrawalTransaction.asJson.transactionStatus === "Completed" || withdrawalTransaction.asJson.transactionStatus === "Deleted"
  }).map((withdrawalTransaction) => withdrawalTransaction.asJson);

  const withdrawalTransactions: IDailyTransactionReport[] = withdrawals.map(
    (transaction) => ({
      id: transaction.id,
      accountNumber: transaction.accountNumber || "",
      transactionDate: transaction.transactionDate || 0,
      transactionAmount: -transaction.amount || 0,
      productCode: transaction.productCode || "",
      transactionType: transaction.description === "Account Close Out" ? "Close Out" : "Withdrawal",
      capturedDate: transaction.transactionDate || 0,
      valueDate: transaction.valueDate || 0,
      clientName: transaction.entityNumber || "",
      transactionStatus: transaction.transactionStatus,
    })
  );

  //SWITCHES
  const switches = store.switch.all.filter((switchTransaction) => {
    return switchTransaction.asJson.switchStatus === "Completed";
  }).map((switchTransaction) => switchTransaction.asJson);

  const switchFromTransactions: IDailyTransactionReport[] = switches.map(transaction => ({
    id: transaction.id,
    accountNumber: transaction.fromAccount || "",
    transactionDate: transaction.transactionDate || 0,
    transactionAmount: -transaction.amount || 0,
    productCode: transaction.fromProductCode || "",
    transactionType: "Switch",
    capturedDate: transaction.valueDate || 0,
    valueDate: transaction.valueDate || 0,
    clientName: transaction.toEntityNumber || "",
    transactionStatus: transaction.switchStatus || ""
  }));

  const switchToTransactions: IDailyTransactionReport[] = switches.map(transaction => ({
    id: transaction.id,
    accountNumber: transaction.toAccount || "",
    transactionDate: transaction.transactionDate || 0,
    transactionAmount: transaction.amount || 0,
    productCode: transaction.toProductCode || "",
    transactionType: "Switch",
    capturedDate: transaction.valueDate || 0,
    valueDate: transaction.valueDate || 0,
    clientName: transaction.toEntityNumber || "",
    transactionStatus: transaction.switchStatus || ""
  }));

  const switchesAll = []


  switchesAll.push(...switchFromTransactions);
  switchesAll.push(...switchToTransactions);


  const filteredDepositTransactions = filterTransactionsByDate(depositTransactions, reportDate).sort((a, b) => {
    const nameA = a.accountNumber;
    const nameB = b.accountNumber;

    return nameA.localeCompare(nameB);
  });

  const totalDeposits = filteredDepositTransactions.filter((d) => d.transactionStatus !== "Corrected").reduce(
    (sum, amount) => sum + amount.transactionAmount,
    0
  );

  const filteredWithdrawalTransactions = filterTransactionsByDate(withdrawalTransactions, reportDate).sort((a, b) => {
    const nameA = a.accountNumber;
    const nameB = b.accountNumber;

    return nameA.localeCompare(nameB);
  });

  const totalWithdrawals = filteredWithdrawalTransactions.filter((d) => d.transactionStatus !== "Delelted").reduce(
    (sum, amount) => sum + amount.transactionAmount,
    0
  );

  const filteredSwitchesTransactions = filterTransactionsByDate(switchesAll, reportDate).sort((a, b) => {
    const nameA = a.clientName;
    const nameB = b.clientName;

    return nameA.localeCompare(nameB);
  });

  const exportableData: IDailyTransactionReport[] = [...filteredDepositTransactions, ...filteredWithdrawalTransactions, ...filteredSwitchesTransactions];

  const net = totalDeposits - Math.abs(totalWithdrawals);

  const calculateTotal = (transactions: IDailyTransactionReport[], field: keyof IDailyTransactionReport): string => {
    const total = transactions.filter(status => status.transactionStatus !== "Corrected").reduce((total, transaction) => total + Number(transaction[field]), 0);
    return numberFormat(total)
  };

  transactions.push(...filteredDepositTransactions)
  transactions.push(...filteredWithdrawalTransactions)
  transactions.push(...filteredSwitchesTransactions)

  // Group transactions by product code and then by transaction type
  const groupedTransactions: { [productCode: string]: { [transactionType: string]: IDailyTransactionReport[] } } = transactions.reduce((grouped: any, transaction) => {
    const { productCode, transactionType } = transaction;
    if (!grouped[productCode]) {
      grouped[productCode] = {};
    }
    if (!grouped[productCode][transactionType]) {
      grouped[productCode][transactionType] = [];
    }
    grouped[productCode][transactionType].push(transaction);
    return grouped;
  }, {});

  // Calculate product totals
  const productTotals: { [productCode: string]: number } = {};
  Object.keys(groupedTransactions).forEach(productCode => {
    productTotals[productCode] = Object.values(groupedTransactions[productCode]).reduce((total, transactions) => {
      return total + transactions.reduce((sum, transaction) => sum + transaction.transactionAmount, 0);
    }, 0);
  });

  const getBase64ImageFromURL = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  };

  const generatePDFNew = async () => {
    const logo = await getBase64ImageFromURL(
      `${process.env.PUBLIC_URL}/ijg-header.jpg`
    );

    const docDefinition: any = {
      content: [
        {
          image: `${logo}`,
          fit: [500, 500], // Adjust the fit as needed
          alignment: "center",
        },
        {
          text: "Daily Transaction Report",
          style: "title",
          alignment: "center",
        }, // Add your title here
        { text: "", margin: [0, 10, 0, 0] }, // Add some space after the title
      ],
      pageOrientation: "landscape", // Set page orientation to landscape
      header: function (currentPage: number, pageCount: number) {
        if (currentPage === 1) {
          return null; // No header on the first page because the logo/header is already there
        } else {
          return {
            text: "_______________________________________________________________________________________________",
            margin: [0, 40, 0, 0],
            alignment: "center",
          };
        }
      },
      footer: function (currentPage: number, pageCount: number) {
        return {
          text: currentPage.toString() + " of " + pageCount,
          alignment: "center",
        };
      },
      styles: {
        title: {
          fontSize: 15,
          bold: true,
          alignment: "center",
          margin: [0, 10, 0, 10], // Add margin below the title
        },
        mainTitle: {
          fontSize: 11,
          bold: true,
          alignment: "left",
          margin: [0, 10, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "black",
          alignment: "left",
        },
        tableCell: {
          fontSize: 10,
          color: "black",
          alignment: "left",
        },
      },
    };

    // Iterate over groupedTransactions
    Object.entries(groupedTransactions).forEach(([productCode, transactionsByType]) => {
      docDefinition.content.push({
        text: `Product Code: ${productCode}`,
        style: "mainTitle",
      });

      // Create a table for each product code
      const productTable: any = {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], // Adjust column widths as needed
          body: [],
        },
        layout: 'lightHorizontalLines', // Add horizontal lines between rows
      };

      // Add table headers
      productTable.table.body.push([
        { text: 'Client Name', style: 'tableHeader' },
        { text: 'Account Number', style: 'tableHeader' },
        { text: 'Transaction Date', style: 'tableHeader' },
        { text: 'Value Date', style: 'tableHeader' },
        { text: 'Transaction Amount', style: 'tableHeader' },
        { text: 'Transaction Type', style: 'tableHeader' },
        { text: 'Remark', style: 'tableHeader' },
      ]);

      // Iterate over transactions for each product code
      Object.entries(transactionsByType).forEach(([transactionType, transactions]) => {
        // Add a row for the transaction type
        productTable.table.body.push([
          { text: `${transactionType}s`, colSpan: 7, style: 'mainTitle' },
          {}, {}, {}, {}, {}, {}, // Empty cells for colspan
        ]);

        // Iterate over individual transactions
        transactions.forEach(transaction => {
          productTable.table.body.push([
            { text: getClientName(transaction.clientName), style: 'tableCell' },
            { text: transaction.accountNumber, style: 'tableCell' },
            { text: dateFormat_YY_MM_DD_NEW(transaction.transactionDate), style: 'tableCell' },
            { text: dateFormat_YY_MM_DD_NEW(transaction.valueDate), style: 'tableCell' },
            { text: numberFormat(transaction.transactionAmount), style: 'tableCell' },
            { text: transaction.transactionType === "Switche" ? 'Switch' : transaction.transactionType, style: 'tableCell' },
            { text: flagDeletedTransaction(transaction) ? 'Correction' : flagBackDatedTransaction(transaction) ? 'Backdated' : '', style: 'tableCell' },
          ]);
        });

        // Add total rows
        productTable.table.body.push([
          { text: `Total ${transactionType} Transactions:`, colSpan: 4, style: 'tableHeader' },
          {}, {}, {},
          { text: transactions.length, colSpan: 3, style: 'tableHeader' },
        ]);
      });

      // Add the product table to the document definition
      docDefinition.content.push(productTable);
    });

    // Generate PDF
    pdfMake.createPdf(docDefinition).download();
  };

  interface TransactionsByType {
    [transactionType: string]: IDailyTransactionReport[];
  }

  function calculateProductTotals(transactionsByType: TransactionsByType): { [product: string]: number } {
    const productTotals: { [product: string]: number } = {};

    // Iterate through each transaction type
    Object.values(transactionsByType).forEach((transactions: IDailyTransactionReport[]) => {
      // Iterate through transactions of each type
      const filteredTransactions = transactions.filter(status => status.transactionStatus !== "Corrected");

      filteredTransactions.forEach((transaction: IDailyTransactionReport) => {
        // Check if the product exists in the productTotals object
        if (!productTotals.hasOwnProperty(transaction.productCode)) {
          // If the product doesn't exist, initialize it with the transaction amount
          productTotals[transaction.productCode] = transaction.transactionAmount;
        } else {
          // If the product exists, add the transaction amount to its total
          productTotals[transaction.productCode] += transaction.transactionAmount;
        }
      });
    });

    return productTotals;
  }

  const renderExcel = ({ onClick }: { onClick: () => void }) => {
    return (
      <button className="btn btn-primary" onClick={onClick}>
        <FontAwesomeIcon
          icon={faFileExcel}
          size="lg"
          className="icon uk-margin-small-right"
        />
        Export Excel
      </button>
    )
  }

  const formattedData = exportableData.filter((d) => d.transactionStatus !== "Corrected").map((d) => {

    const $clientName = getClientName(d.clientName);
    const $accountNumber = d.accountNumber;
    const $productCode = d.productCode;
    const $valueDate = d.valueDate;
    const $transactionDate = d.transactionDate;
    const $transactionType = d.transactionType === "Switche" ? 'Switch' : d.transactionType;
    const $transactionAmount = d.transactionAmount;

    return (
      {
        clientName: $clientName,
        accountNumber: $accountNumber,
        transactionDate: dateFormat_YY_MM_DD_NEW($transactionDate),
        valueDate: dateFormat_YY_MM_DD_NEW($valueDate),
        transactionsAmount: $transactionAmount,
        transactionsType: $transactionType,
        productCode: $productCode,
      }
    )
  });

  const filteredTransactions = transactions.filter(status => status.transactionStatus !== "Corrected")

  // Initial state setup
  const [selectedClients, setSelectedClients] = useState<ISelectedClient[]>([]);

  const selectAllClients = () => {
    setSelectedClients([]);

    const clientsMap: { [key: string]: ISelectedClient } = {};

    filteredTransactions.forEach(transaction => {
      if (!clientsMap[transaction.clientName]) {
        clientsMap[transaction.clientName] = { clientName: transaction.clientName, transactions: [] };
      }
      clientsMap[transaction.clientName].transactions.push(transaction);
    });

    setSelectedClients(Object.values(clientsMap));
    showModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_DAILY_TRANSACTION_STATEMENT_REPORT);
  };


  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([
          api.depositTransaction.getAll(),
          api.withdrawalTransaction.getAll(),
          api.switch.getAll(),
        ]);
        setLoading(false);
      } catch (error) {
      }
    };

    loadAll();
  }, [api.depositTransaction, api.withdrawalTransaction, api.switch]);

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Daily Transaction Report"
            leftControls={
              <h4 className="main-title-md">{dateFormat_DD_MM_YY(reportDate)}</h4>
            }
            rightControls={
              <form>
                <div className="uk-form-controls uk-flex">
                  <label className="uk-form-label uk-text-white" htmlFor="">
                    Report Date
                  </label>
                  <input
                    id="date"
                    value={reportDate ? dateFormat_YY_MM_DD(reportDate) : dateFormat_YY_MM_DD(todaysDate)}
                    className="uk-input uk-form-small"
                    type="date"
                    onChange={(e) => handleFilterDateChange(e.target.valueAsNumber)}
                  />
                  <button
                    type="button"
                    onClick={handleFilterDateReset}
                    className="btn btn-danger">
                    Reset
                  </button>
                </div>
              </form>
            }
          />
          <Toolbar
            leftControls={
              <>
                {
                  filteredTransactions.length > 0 &&
                  <button className="btn btn-primary" onClick={selectAllClients}>
                    <FontAwesomeIcon icon={faMailBulk} /> Send Statements to selected Clients
                  </button>
                }


                <button className="btn btn-primary" onClick={generatePDFNew}>
                  <FontAwesomeIcon icon={faFilePdf} /> Export PDF
                </button>
                <ExportAsExcel
                  fileName={`Daily Transaction Report
                   ${reportDate ?
                      dateFormat_YY_MM_DD(reportDate) :
                      dateFormat_YY_MM_DD(todaysDate)}`}
                  name="Summary"
                  data={formattedData}
                  headers={
                    ["Client Name", "Account Number",
                      "Transaction Date", "Value Date",
                      "Transaction Amount", "Transaction Type",
                      "Product Code"
                    ]
                  }
                >{renderExcel}
                </ExportAsExcel>
              </>
            }
          />
          <hr />
        </div>
        {
          !loading &&
          <div>
            {Object.entries(groupedTransactions).map(
              ([productCode, transactionsByType]) => (
                <div key={productCode}>
                  <>
                    <h4 className="main-title-lg">Product Code: {productCode}</h4>
                    <CustomOpenAccordion title={`${productCode} Transactions`}>
                      <table className="kit-table-bordered">
                        <thead>
                          <tr>
                            <th>Client Name</th>
                            <th>Account Number</th>
                            <th>Transaction Date</th>
                            <th>Value Date</th>
                            <th>Transaction Amount</th>
                            <th>Transaction Type</th>
                            <th>Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(transactionsByType).map(
                            ([transactionType, transactions]) => (
                              <Fragment key={transactionType}>
                                <tr className="uk-margin-top">
                                  <th colSpan={7}>
                                    <h4 className="main-title-sm">
                                      {transactionType}s
                                    </h4>
                                  </th>
                                </tr>
                                {transactions.sort((a, b) => {
                                  const nameA = getAccountName(a.accountNumber);
                                  const nameB = getAccountName(b.accountNumber);

                                  return nameA.localeCompare(nameB);
                                }).map((transaction, index) => (
                                  <Fragment>

                                    {flagDeletedTransaction(transaction) && "Correction" &&
                                      <>
                                        <tr
                                          key={transaction.id}
                                          style={{
                                            color: flagDeletedTransaction(transaction) ? "red" : flagBackDatedTransaction(transaction) ? "orange" : "",
                                            fontWeight: `bold`
                                          }}>

                                          <td>{getAccountName(transaction.accountNumber)}</td>
                                          <td>{transaction.accountNumber}</td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(
                                              transaction.transactionDate
                                            )}
                                          </td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(transaction.valueDate)}
                                          </td>
                                          <td>
                                            {numberFormat(Math.abs(transaction.transactionAmount))}
                                          </td>
                                          <td>{transaction.transactionType === 'Switche' ? 'Switch' : transaction.transactionType}</td>
                                          <td>
                                            {flagDeletedTransaction(transaction)
                                              ? "Correction"
                                              : flagBackDatedTransaction(transaction)
                                                ? "Back Dated"
                                                : ""}
                                          </td>
                                        </tr>
                                        <tr
                                          key={`${transaction.id}dd`}
                                          style={{
                                            color: flagDeletedTransaction(transaction) ? "red" : flagBackDatedTransaction(transaction) ? "orange" : "",
                                            fontWeight: `bold`
                                          }}>
                                          <td>{getAccountName(transaction.accountNumber)}</td>
                                          <td>{transaction.accountNumber}</td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(
                                              transaction.transactionDate
                                            )}
                                          </td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(transaction.valueDate)}
                                          </td>
                                          <td>
                                            {numberFormat(transaction.transactionAmount)}
                                          </td>
                                          <td>{transaction.transactionType === 'Switche' ? 'Switch' : transaction.transactionType}</td>
                                          <td>
                                            {flagDeletedTransaction(transaction)
                                              ? "Correction"
                                              : flagBackDatedTransaction(transaction)
                                                ? "Back Dated"
                                                : ""}
                                          </td>
                                        </tr>
                                      </>
                                    }
                                    {!flagDeletedTransaction(transaction) && "Correction" &&
                                      <>
                                        <tr
                                          key={`${transaction.id}ss`}
                                          style={{
                                            color: flagDeletedTransaction(transaction) ? "red" : flagBackDatedTransaction(transaction) ? "orange" : "",
                                            fontWeight: flagDeletedTransaction(transaction) ? `bold` : ``
                                          }}>
                                          <td>{getAccountName(transaction.accountNumber)}</td>
                                          <td>{transaction.accountNumber}</td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(
                                              transaction.transactionDate
                                            )}
                                          </td>
                                          <td>
                                            {dateFormat_YY_MM_DD_NEW(transaction.valueDate)}
                                          </td>
                                          <td>
                                            {numberFormat(transaction.transactionAmount)}
                                          </td>
                                          <td>{transaction.transactionType === 'Switche' ? 'Switch' : transaction.transactionType}</td>
                                          <td>
                                            {flagDeletedTransaction(transaction) ? "Correction" : flagBackDatedTransaction(transaction)
                                              ? "Back Dated"
                                              : ""}
                                          </td>
                                        </tr>
                                      </>
                                    }
                                  </Fragment>

                                ))}
                                <tr>
                                  <th>
                                    <h4 className="main-title-sm">
                                      Total {transactionType} Transactions:
                                    </h4>
                                  </th>
                                  <th>
                                    <h4 className="main-title-sm">
                                      {transactions.filter((d) => d.transactionStatus !== "Corrected").length}
                                    </h4>
                                  </th>
                                  <th></th>
                                  <th>
                                    <h4 className="main-title-sm">
                                      Total {transactionType}s:
                                    </h4>
                                  </th>
                                  <th colSpan={3}>
                                    <h4 className="main-title-sm">
                                      {calculateTotal(
                                        transactions,
                                        "transactionAmount"
                                      )}
                                    </h4>
                                  </th>
                                </tr>
                              </Fragment>
                            )
                          )}
                        </tbody>
                        <tfoot>
                          {Object.entries(
                            calculateProductTotals(transactionsByType)
                          ).map(([product, total]) => (
                            <tr key={product}>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td>
                                <h2 className="main-title-sm uk-margin-top">
                                  {total < 0
                                    ? "Total Cancellation  "
                                    : "Total Creation  "}{" "}
                                  for {productCode}:
                                </h2>
                              </td>
                              <td colSpan={1}>
                                <h2 className="main-title-sm uk-margin-top">
                                  <span
                                    className={`${total < 0 ? "uk-text-danger" : "uk-text-success"
                                      }`}
                                    style={{
                                      border: "1px solid var(--color-white)",
                                      padding: "4px",
                                    }}>
                                    {numberFormat(total)}
                                  </span>
                                </h2>
                              </td>
                              <td></td>
                              <td colSpan={3}></td>
                            </tr>
                          ))}
                        </tfoot>
                      </table>
                    </CustomOpenAccordion>
                  </>
                </div>
              )
            )}

            <table className="kit-table-bordered">
              <tbody>
                <tr></tr>
                <tr>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      Total Deposit Volume
                    </h2>
                  </td>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      {numberFormat(totalDeposits)}
                    </h2>
                  </td>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      Total Withdrawal Volume
                    </h2>
                  </td>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      {numberFormat(totalWithdrawals)}
                    </h2>
                  </td>
                  <td></td>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      {net < 0
                        ? "Total Cancellation"
                        : "Total Creation  "}
                    </h2>
                  </td>
                  <td>
                    <h2 className="main-title-md uk-margin-top">
                      <span
                        className={`${net < 0 ? "uk-text-danger" : "uk-text-success"
                          }`}
                        style={{
                          border: "1px solid var(--color-white)",
                          padding: "4px",
                        }}>
                        {numberFormat(net)}
                      </span>
                    </h2></td>
                </tr>
              </tbody>
            </table>

            {Object.entries(groupedTransactions).length === 0 && <NoData />}
          </div>
        }
        {
          loading && <LoadingEllipsis />
        }

      </div>
      <Modal modalId={MODAL_NAMES.BACK_OFFICE.VIEW_DAILY_TRANSACTION_STATEMENT_REPORT}>
        <DailyTransactionStatementReportModal data={selectedClients} />
      </Modal>
    </div>
  );
}

export default DailyTransactionReport
