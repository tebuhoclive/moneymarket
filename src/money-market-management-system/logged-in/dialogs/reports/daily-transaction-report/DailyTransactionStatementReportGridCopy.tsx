// import { observer } from "mobx-react-lite";
// import { Mail, OpenInNew } from "@mui/icons-material";
// import { IconButton, Box } from "@mui/material";
// import { GridColDef, DataGrid, GridCsvExportMenuItem, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";
// import Toolbar from "../../../shared/components/toolbar/Toolbar";
// import { IDailyTransactionReport, ISelectedClient } from "../../../system-modules/reports-module/transactions/DailyTransactionReport";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { getNaturalPersonsName } from "../../../../../shared/functions/MyFunctions";
// import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
// import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
// import { useState } from "react";
// import NormalClientStatement from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/NormalClientStatement";
// import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from "../../../../../shared/utils/utils";
// import swal from "sweetalert";
// import { getFilteredStatementTransactions, getStatementTotalDistribution, getStatementTotalDays } from "../../../../../shared/functions/transactions/Statement";
// import { entityNumber, clientName, clientEmail, clientPostalAddress } from '../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions';
// import { sendStatements } from "../../../system-modules/money-market-account-module/client-statements/client-statement-tab-items/statement-run-pdf/statement-email-templates/StatementEmail";
// import MoneyMarketAccountModel from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
// import { faCheckCircle, faCancel, faMailBulk } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { getProductName } from "../../../system-modules/reports-module/transactions/GetProductCode";

// interface IProps {
//   data: ISelectedClient[];
// }

// const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();

// const startOfMonth = new Date(currentYear, currentMonth, 1);
// const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

// const DailyTransactionStatementReportGrid = observer((props: IProps) => {

//   const { data } = props;
//   const { api, store } = useAppContext();

//   const [transactions, setTransactions] = useState<IDailyTransactionReport[]>();
//   const [accountId, setAccountId] = useState("");

//   const [loading, setLoading] = useState<boolean>(false);
//   const [isPreparingRun, setPreparingRun] = useState<boolean>(false);

//   const [statementView, setStatementView] = useState(false);

//   const [progress, setProgress] = useState<number>(0);
//   const [statementsSent, setStatementsSent] = useState(0);

//   const clients = [
//     ...store.client.naturalPerson.all.map(client => client.asJson),
//     ...store.client.legalEntity.all.map(client => client.asJson)
//   ];


//   const getClientInfo = (parentEntityId: string): ILegalEntity | INaturalPerson | undefined => {
//     const client = clients.find(client => client.entityId === parentEntityId);
//     return client ? client : undefined;
//   };

//   const getSelectedAccount = (accountNumber: string) => {
//     const moneyMarketAccount = store.mma.all.find(account => account.asJson.accountNumber === accountNumber);
//     if (moneyMarketAccount) {
//       setAccountId(moneyMarketAccount.asJson.id);
//       setStatementView(true);
//     }
//   }

//   const CustomToolbar = () => {
//     return (
//       <GridToolbarContainer>
//         <GridToolbarQuickFilter />
//         <GridCsvExportMenuItem />
//       </GridToolbarContainer>
//     );
//   }

//   const viewTransactionDetails = (transactions: IDailyTransactionReport[]) => {
//     setTransactions(transactions);
//     setStatementView(false);
//   }

//   interface IStatementRunData {
//     id: string,
//     entityNumber: string;
//     clientName: string,
//     accountNumber: string;
//     product: string;
//     instrumentName: string;
//     emailAddress: string;
//     rate: number;
//     postalAddress: string;
//   }

//   const statementData: IStatementRunData[] = [];

//   const [selectedClients, setSelectedClients] = useState<string[]>([]);
//   const [selectedClientAccounts, setSelectedClientAccounts] = useState<MoneyMarketAccountModel[]>([]);

//   const addToSelectedClients = (entityId: string) => {
//     setSelectedClientAccounts([]);
//     if (entityId) {
//       setSelectedClients(prevTransactions => {
//         if (prevTransactions.includes(entityId)) {
//           return prevTransactions.filter(id => id !== entityId);
//         }
//         return [...prevTransactions, entityId];
//       });
//     }
//   }

//   const selectAllClients = () => {
//     setSelectedClientAccounts([]);
//     const uniqueClientNames = Array.from(new Set(data.map(transaction => transaction.clientName)));
//     setSelectedClients(uniqueClientNames);
//   };

//   const deselectAllClients = () => {
//     setSelectedClients([]);
//   }

//   selectedClientAccounts.forEach((account) => {
//     const newAccountData: IStatementRunData = {
//       id: account.asJson.id,
//       entityNumber: entityNumber(account.asJson.id, store),
//       clientName: clientName(account.asJson.id, store),
//       accountNumber: account.asJson.accountNumber,
//       product: account.asJson.accountType,
//       emailAddress: clientEmail(account.asJson.id, store),
//       rate: account.asJson.clientRate || 0,
//       postalAddress: clientPostalAddress(account.asJson.id, store),
//       instrumentName: getProductName(store, account.asJson.accountType)
//     };
//     statementData.push(newAccountData);
//   });

//   const onPrepareStatementRun = () => {
//     const toSend: MoneyMarketAccountModel[] = []
//     setPreparingRun(true);
//     for (const selectedClient of selectedClients) {

//       const account = store.mma.all.find(account => account.asJson.parentEntity === selectedClient);

//       if (account) {
//         toSend.push(account);
//       }
//     }
//     setPreparingRun(false);
//     setSelectedClientAccounts(toSend);
//   }

//   const onSendStatements = async () => {
//     let completedCount = 0;

//     swal({
//       title: "Statement Run",
//       text: "You are about to send statements to the selected Clients, please ensure you have confirmed the list and the contents of the statements are all correct.",
//       icon: "warning",
//       buttons: ["Cancel", "Run"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);

//         for (const account of statementData) {
//           await api.statementTransaction.$getAll(account.id);
//           const statementTransactions = store.statementTransaction.all.filter(
//             (notBlinded) => notBlinded.asJson.blinded !== true
//           );
//           const statementTransactionsAsJson = statementTransactions.map(
//             (transaction) => {
//               return transaction.asJson;
//             }
//           );
//           const filteredStatementTransactions = getFilteredStatementTransactions(
//             startOfMonth,
//             endOfMonth,
//             statementTransactionsAsJson,
//           );

//           const totalDistribution = getStatementTotalDistribution(
//             filteredStatementTransactions
//           );
//           const totalDays = getStatementTotalDays(filteredStatementTransactions);

//           await sendStatements(account, startOfMonth, endOfMonth);

//           completedCount++; // Increment completed count
//           const progress = (
//             (completedCount / statementData.length) *
//             100
//           );

//           setProgress(progress);
//           setStatementsSent(completedCount);
//         }

//         swal({
//           icon: "success",
//           title: "Statement Run Completed"
//         })
//         setLoading(false);
//       } else {
//         swal({
//           title: "Oops!",
//           text: "Operation cancelled",
//           icon: "error"
//         })
//       }
//     });
//   }

//   const columns: GridColDef[] = [
//     {
//       field: "checked",
//       headerName: "",
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <>
//           <input
//             onChange={() => addToSelectedClients(params.row.clientName)}
//             className="uk-checkbox"
//             type="checkbox"
//             name=""
//             id=""
//             checked={selectedClients.includes(params.row.clientName)}
//             disabled={loading}
//             readOnly
//           />
//         </>
//       ),
//     },
//     {
//       field: "clientName",
//       headerName: "Client Name",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         const clientName = getNaturalPersonsName(params.row.transactions[0].clientName, store);
//         return clientName;
//       },
//     },
//     {
//       field: "emailAddress",
//       headerName: "Email Address",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         const clientName = getClientInfo(params.row.transactions[0].clientName)?.contactDetail.emailAddress || "Not Provided";
//         return clientName;
//       },
//     },
//     {
//       field: "Options",
//       headerName: "Options",
//width:200,
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <div>
//           <>
//             <IconButton data-uk-tooltip="View"
//               onClick={() => viewTransactionDetails(params.row.transactions)}
//             >
//               <OpenInNew />
//             </IconButton>

//             <IconButton data-uk-tooltip="Send Email"
//             >
//               <Mail />
//             </IconButton>
//           </>
//         </div>
//       ),
//     }
//   ];

//   return (
//     <div className="grid">
//       <Toolbar
//         leftControls={
//           <>
//             {
//               selectedClients.length !== data.length &&
//               <button className="btn btn-primary" onClick={selectAllClients} disabled={loading}>
//                 <FontAwesomeIcon icon={faCheckCircle} /> Select All
//               </button>
//             }
//             {
//               selectedClients.length > 0 &&
//               <button className="btn btn-danger" onClick={deselectAllClients} disabled={loading}>
//                 <FontAwesomeIcon icon={faCancel} /> Deselect All
//               </button>
//             }
//             {
//               selectedClients.length > 0 && selectedClientAccounts.length === 0 &&
//               <button className="btn btn-primary" onClick={onPrepareStatementRun} disabled={loading || isPreparingRun}>
//                 Prepare Statement{selectedClients.length > 1 ? 's' : ''} {isPreparingRun && <span data-uk-spinner={"ratio:.5"}></span>}
//               </button>
//             }
//             {
//               selectedClientAccounts.length > 0 &&
//               <button className="btn btn-primary" onClick={onSendStatements} disabled={loading}>
//                 <FontAwesomeIcon icon={faMailBulk} /> Send Statements to selected Client{selectedClients.length > 1 ? 's' : ''}{loading && <span data-uk-spinner={"ratio:.5"}></span>}
//               </button>
//             }
//           </>
//         }
//       />
//       <hr />
//       <div className="uk-grid uk-grid-small" data-uk-grid>
//         {selectedClientAccounts.length > 0 &&
//           <div className="uk-width-1-1 uk-margin">
//             <label>Statement Run</label> <br />
//             <label className="uk-form-label required">
//               {`Progress ${progress}% - ${statementsSent} out of ${selectedClientAccounts.length} completed`}
//             </label>
//             <progress
//               className="uk-progress"
//               value={progress}
//               max={100}
//             ></progress>
//           </div>
//         }
//         <div className="uk-width-1-3 uk-child-width-1-1">
//           <Box sx={{ height: 430 }}>
//             <DataGrid
//               loading={!data}
//               slots={{
//                 toolbar: CustomToolbar,
//               }}
//               rows={data}
//               columns={columns}
//               getRowId={(row) => row.clientName}
//               rowHeight={35}
//             />
//           </Box>
//         </div>

//         <div className="uk-width-expand">
//           {statementView && <button className="btn btn-primary" onClick={() => setStatementView(false)}>Back to Transaction View</button>}
//           <hr />
//           {
//             !statementView && transactions &&
//             <>
//               <h4 className="main-title-md">Account Transaction(s)</h4>
//               <table className="uk-table uk-table-small kit-table">
//                 <thead>
//                   <tr>
//                     <th>Transaction Date</th>
//                     <th>Value Date</th>
//                     <th>Product</th>
//                     <th>Account</th>
//                     <th>Transaction Type</th>
//                     <th>Amount</th>
//                     <th>Remark</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {transactions && transactions.map(transaction => (
//                     <tr>
//                       <td>{dateFormat_YY_MM_DD_NEW(transaction.transactionDate)}</td>
//                       <td>{dateFormat_YY_MM_DD(transaction.valueDate)}</td>
//                       <td>{transaction.productCode}</td>
//                       <td>{transaction.accountNumber}</td>
//                       <td>{transaction.transactionType !== "Switche" ? transaction.transactionType : 'Switches'}</td>
//                       <td>{(transaction.transactionAmount)}</td>
//                       <td>{transaction.transactionStatus}</td>
//                       <td><button className="btn btn-primary" onClick={() => getSelectedAccount(transaction.accountNumber)}>Statement</button></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </>
//           }

//           {
//             statementView &&
//             <>
//               <h4 className="main-title-md">Client Statement</h4>
//               <NormalClientStatement moneyMarketAccountId={accountId} />
//             </>
//           }
//         </div>
//       </div>

//     </div>
//   );
// });

// export default DailyTransactionStatementReportGrid;

import React from 'react'

const DailyTransactionStatementReportGridCopy = () => {
  return (
    <div>
      
    </div>
  )
}

export default DailyTransactionStatementReportGridCopy

