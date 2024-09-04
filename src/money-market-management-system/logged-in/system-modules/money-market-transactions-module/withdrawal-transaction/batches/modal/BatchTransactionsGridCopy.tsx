// import swal from "sweetalert";
// import "./../Batches.scss";
// import { observer } from "mobx-react-lite";
// import { Box, IconButton } from "@mui/material";
// import { DataGrid, GridColDef } from "@mui/x-data-grid";
// import { IWithdrawalTransaction } from "../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";

// import { useAppContext } from "../../../../../../../shared/functions/Context";
// import {
//   batchTransactionRevert,
//   getAccountBalance,
//   getAccountId,
//   getAccountRate,
//   minusWithdrawalAmountFromBalance,
// } from "../../../../../../../shared/functions/MyFunctions";
// import {
//   dateFormat_YY_MM_DD,
//   dateFormat_YY_MM_DD_NEW,
// } from "../../../../../../../shared/utils/utils";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import DangerousIcon from "@mui/icons-material/Dangerous";
// import HistoryIcon from "@mui/icons-material/History";
// import { IWithdrawalPaymentBatch } from "../../../../../../../shared/models/batches/BatchesModel";
// import { useEffect, useState } from "react";
// import { LoadingEllipsis } from "../../../../../../../shared/components/loading/Loading";

// import {
//   PaymentTransactions,
//   generateHighValueBankPaymentFile,
//   generateNormalValuePaymentFile,
// } from "../../../../../../../shared/functions/PaymentFileGenerator";
// import {
//   getElementAtIndex,
//   padNumberStringWithZero,
// } from "../../../../../../../shared/functions/StringFunctions";
// import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
// import Toolbar from "../../../../../shared/components/toolbar/Toolbar";
// import { OpenInNew } from "@mui/icons-material";
// import { onViewCompletedWithdrawalTransaction } from "../../../../../../../shared/functions/transactions/WithdrawalTransactionsFunctions";
// import Modal from "../../../../../../../shared/components/Modal";
// import MODAL_NAMES from "../../../../../dialogs/ModalName";
// import ViewCompletedWithdrawalModal from "../../../../../dialogs/transactions/withdrawal-transaction/ViewCompletedWithdrawalModal";

// interface IProp {
//   data: IWithdrawalTransaction[];
//   batch: IWithdrawalPaymentBatch;
// }

// export const BatchTransactions = observer(({ data, batch }: IProp) => {
//   const { store, api } = useAppContext();
//   const [loading, setLoading] = useState(false);

//   const batchStatusSuccess = async (
//     transactionIds: string | string[],
//     status: string
//   ) => {
//     const update = async (
//       oldTransactionState: IWithdrawalTransaction,
//       newTransactionState: IWithdrawalTransaction
//     ) => {
//       try {
//         await api.withdrawalTransaction.updateAndCreateAuditTrail(
//           oldTransactionState,
//           newTransactionState
//         );
//       } catch (error) { }
//     };
//     swal({
//       title: "Are you sure?",
//       text: "You are about to mark the transactions as successful",
//       icon: "warning",
//       buttons: ["Cancel", "Proceed"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           // If transactionIds is an array, process each transaction
//           if (Array.isArray(transactionIds)) {
//             for (const transactionId of transactionIds) {
//               await processTransaction(transactionId, status);
//             }
//           } else {
//             // If transactionIds is a single ID, process it directly
//             await processTransaction(transactionIds, status);
//           }
//         } catch (error) {
//           console.error("Error processing transactions:", error);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         swal({
//           icon: "error",
//           text: "Transaction marked as successful!",
//         });
//       }
//     });
//   };

//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//     } catch (error) { }
//   };




//   const processTransaction = async (transactionId: string, status: string) => {
//     const withdrawal = store.withdrawalTransaction.getItemById(transactionId);

//     if (withdrawal) {
//       store.withdrawalTransaction.select(withdrawal.asJson);

//       const saveTransaction: IWithdrawalTransaction = {
//         ...withdrawal.asJson,
//         allocationStatus: "Approved",
//         transactionStatus: "Approved",
//         transactionAction: "Completed",
//         timeProcessedPayment: Date.now()
//       };

//       await update(withdrawal.asJson, saveTransaction);

//       if (store.withdrawalTransaction.selected) {
//         const withdrawalAllocation = store.withdrawalTransaction.selected;

//         try {
//           alert("here")
//           const moneyMarketAccount = store.mma.all.find(
//             (account) =>
//               account.asJson.accountNumber === withdrawalAllocation.allocation
//           );

//           if (moneyMarketAccount) {
//             if (
//               withdrawalAllocation.description === "Account Close Out" &&
//               moneyMarketAccount.asJson.monthTotalInterest
//             ) 
//             {
//               const updatedMMA = {
//                 ...moneyMarketAccount.asJson,
//                 balance:
//                   moneyMarketAccount.asJson.monthTotalInterest +
//                   moneyMarketAccount.asJson.balance,
//               };

//               const statementTransactionCapitalise: IStatementTransaction = {
//                 id: "yHghghyYvhyvsamd",
//                 date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                 transaction: "capitalisation",
//                 balance:
//                   getAccountBalance(withdrawalAllocation.allocation, store) +
//                   moneyMarketAccount.asJson.monthTotalInterest,
//                 previousBalance: getAccountBalance(
//                   withdrawalAllocation.allocation,
//                   store
//                 ),
//                 rate:
//                   getAccountRate(withdrawalAllocation.allocation, store) || 0,
//                 remark: `Capitalise`,
//                 amount: moneyMarketAccount.asJson.monthTotalInterest,
//                 createdAt: Date.now(),
//               };

//               try {
//                 await api.mma.updateBalance(updatedMMA);
//                 try {
//                   let saved = false;
//                   await api.mma.createStatementTransaction(
//                     getAccountId(withdrawalAllocation.allocation, store) || "",
//                     statementTransactionCapitalise
//                   );
//                   saved = true;
//                   try {
//                     await api.batches.updateBatchTransactionStatus(
//                       batch,
//                       transactionId,
//                       status
//                     );
//                     await api.withdrawalTransaction.updateProcessStatus(
//                       transactionId
//                     );
//                     try {
//                       if (saved === true) {
//                         const statementTransaction: IStatementTransaction = {
//                           id: withdrawalAllocation.id,
//                           date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                           transaction: "withdrawal",
//                           balance:
//                             getAccountBalance(
//                               withdrawalAllocation.allocation,
//                               store
//                             ) - withdrawalAllocation.amount,
//                           previousBalance: getAccountBalance(
//                             withdrawalAllocation.allocation,
//                             store
//                           ),
//                           rate:
//                             getAccountRate(
//                               withdrawalAllocation.allocation,
//                               store
//                             ) || 0,
//                           remark: `Close Out: Withdraw to account ${withdrawalAllocation.bank}`,
//                           amount: withdrawalAllocation.amount,
//                           createdAt: Date.now() + 1,
//                         };
//                         await api.mma.createStatementTransaction(
//                           getAccountId(
//                             withdrawalAllocation.allocation,
//                             store
//                           ) || "",
//                           statementTransaction
//                         );
//                         await minusWithdrawalAmountFromBalance(
//                           statementTransactionCapitalise.balance,
//                           moneyMarketAccount.asJson.accountNumber,
//                           store,
//                           api,
//                           transactionId
//                         );
//                       }
//                     } catch (error) { }
//                   } catch (error) {
//                     console.log("Balance Minus Error", error);
//                   }
//                 } catch (error) {
//                   console.log("Balance Update Error", error);
//                 }
//               } catch (error) {
//                 console.log(error);
//               }
//             } 
//             else {
//               const statementTransaction: IStatementTransaction = {
//                 id: withdrawalAllocation.id,
//                 date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                 transaction: "withdrawal",
//                 balance:
//                   getAccountBalance(withdrawalAllocation.allocation, store) -
//                   withdrawalAllocation.amount,
//                 previousBalance: getAccountBalance(
//                   withdrawalAllocation.allocation,
//                   store
//                 ),
//                 rate:
//                   getAccountRate(withdrawalAllocation.allocation, store) || 0,
//                 remark: `Withdraw to account ${withdrawalAllocation.bank}`,
//                 amount: withdrawalAllocation.amount,
//                 createdAt: Date.now(),
//               };
//               await minusWithdrawalAmountFromBalance(
//                 statementTransaction.amount,
//                 moneyMarketAccount.asJson.accountNumber,
//                 store,
//                 api,
//                 transactionId
//               );

//               await api.batches.updateBatchTransactionStatus(
//                 batch,
//                 transactionId,
//                 status
//               );

//               await api.mma.createStatementTransaction(
//                 getAccountId(withdrawalAllocation.allocation, store) || "",
//                 statementTransaction
//               );
//               await api.withdrawalTransaction.updateProcessStatus(
//                 transactionId
//               );
//             }
//           }
//         } catch (error) { }
//       }
//     }
//   };

//   const addToSelected = (transactionId: string) => {
//     if (transactionId) {
//       setSelectedTransactions((prevTransactions) => {
//         if (prevTransactions.includes(transactionId)) {
//           return prevTransactions.filter((id) => id !== transactionId);
//         }
//         return [...prevTransactions, transactionId];
//       });
//     }
//   };

//   const batchStatusFailed = async (transactionId: string, status: string) => {
//     swal({
//       title: "Are you sure?",
//       text: "You are about to mark the transaction as Failed",
//       icon: "warning",
//       buttons: ["Cancel", "Proceed"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           await api.batches.updateBatchTransactionStatus(
//             batch,
//             transactionId,
//             status
//           );
//           await api.withdrawalTransaction.updateProcessStatus(transactionId);
//         } catch (error) {
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         swal({
//           icon: "error",
//           text: "Transaction marked as Failed!",
//         });
//       }
//     });
//   };

//   const revertTransaction = async (transactionId: string) => {
//     swal({
//       title: "Are you sure?",
//       text: "You are about to revert this transaction",
//       icon: "warning",
//       buttons: ["Cancel", "Proceed"],
//       dangerMode: true,
//     }).then(async (edit) => {
//       if (edit) {
//         setLoading(true);
//         try {
//           await batchTransactionRevert(api, store, transactionId, batch, data);
//         } catch (error) {
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         swal({
//           icon: "error",
//           text: "Transaction transaction reverted successfully!",
//         });
//       }
//     });
//   };

//   const columns: GridColDef[] = [
//     {
//       field: "checked",
//       headerName: "",
//width:200,
//       headerClassName: "grid",

//       renderCell: (params) => (
//         <>
//           <input
//             onChange={() => addToSelected(params.row.id)}
//             className="uk-checkbox"
//             type="checkbox"
//             name=""
//             id=""
//             checked={selectedTransactions.includes(params.row.id)}
//           />
//         </>
//       ),
//     },
//     {
//       field: "transactionDate",
//       headerName: "Transaction Date",
//width:200,
//       // width: 200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return dateFormat_YY_MM_DD_NEW(params.row.transactionDate);
//       },
//     },
//     {
//       field: "bank",
//       headerName: "Bank",
//width:200,
//width:200,
//       headerClassName: "grid",
//     },
//     {
//       field: "amount",
//       headerName: "Amount",
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         return (params.row.amount);
//       },
//     },
//     // {
//     //   field: "reference",
//     //   headerName: "Reference",
//     //   width: 200,
//     //   width: 200,
//     //   headerClassName: "grid",
//     // },
//     {
//       field: "description",
//       headerName: "Description",
//width:200,
//       headerClassName: "changable",
//       renderCell: (params) => {
//         const { value } = params;
//         let color = "";

//         // Set color based on description
//         if (value.includes("Withdrawal")) {
//           color = "green";
//         } else if (value.includes("Back Dated")) {
//           color = "blue";
//         } else if (value.includes("Future Dated")) {
//           color = "purple"
//         }
//         else if (value.includes("Returned for Amendment")) {
//           color = "red"
//         } else if (value.includes("Amended")) {
//           color = "#80cbc4"
//         } else if (value.includes("Account Close Out")) {
//           color = "yellow"
//         }
//         return (
//           <div style={{ display: "flex" }}>
//             <div data-uk-tooltip={value} style={{ background: `${color}`, padding: "2px", marginRight: "7px" }}></div>{" "}{value}
//           </div>
//         );
//       },
//     },
//     // {
//     //   field: "allocation",
//     //   headerName: "Allocated To",
//     //   width: 200,
//     //   width: 200,
//     //   headerClassName: "grid",
//     // },
//     // {
//     //   field: "allocatedBy",
//     //   headerName: "Allocated By",
//     //   width: 200,
//     //   width: 200,
//     //   headerClassName: "grid",
//     //   valueGetter: (params) => {
//     //     const person = getAllocatedBy(params.row.allocatedBy, store);
//     //     return person;
//     //   },
//     // },
//     {
//       field: "batchTransactionStatus",
//       headerName: "Status",
//width:200,
//width:200,
//       headerClassName: "grid",
//       valueGetter: (params) => {
//         if (
//           !params.row.batchTransactionStatus ||
//           params.row.batchTransactionStatus === ""
//         ) {
//           return "pending";
//         } else {
//           return params.row.batchTransactionStatus;
//         }
//       },
//       cellClassName: (params) => {
//         const status = params.value || "pending";
//         switch (status) {
//           case "pending":
//             return "blue-background-batch";
//           case "failed":
//             return "red-background-batch";
//           case "success":
//             return "green-background-batch";
//           default:
//             return "";
//         }
//       },
//     },

//     {
//       field: "Option",
//       headerName: "Option",
//width:200,
//       headerClassName: "grid",
//       renderCell: (params) => (
//         <>
//           <IconButton
//             data-uk-tooltip="View Transaction"
//             onClick={() => onViewCompletedWithdrawalTransaction(batch.id, params.row.id, store)}
//           >
//             <OpenInNew />
//           </IconButton>
//           {loading ? (
//             <LoadingEllipsis />
//           ) : (
//             // batch.isFileDownloaded && (
//             <>
//               {batch.isFileDownloaded === true ?
//                 <div>
//                   {params.row.batchTransactionStatus !== "success" && (
//                     <>
//                       <IconButton
//                         data-uk-tooltip="Mark as Success"
//                         onClick={() =>
//                           batchStatusSuccess(params.row.id, "success")
//                         }
//                         disabled={params.row.batchTransactionStatus === "failed"}>
//                         <CheckCircleIcon />
//                       </IconButton>
//                       <IconButton
//                         data-uk-tooltip={
//                           params.row.batchTransactionStatus === "failed"
//                             ? "Cannot Fail"
//                             : "Mark as Fail"
//                         }
//                         onClick={() => batchStatusFailed(params.row.id, "failed")}
//                         disabled={params.row.batchTransactionStatus === "failed"}>
//                         <DangerousIcon />
//                       </IconButton>
//                       <IconButton
//                         data-uk-tooltip="Revert Transaction"
//                         onClick={() => revertTransaction(params.row.id)}>
//                         <HistoryIcon />
//                       </IconButton>
//                     </>
//                   )}
//                 </div> :
//                 <div></div>
//               }
//             </>
//             // )
//           )}
//         </>
//       ),
//     },
//   ];

//   const transactions: PaymentTransactions[] = data.map(
//     (transaction, index) => ({
//       transactionSubBatchNumber: padNumberStringWithZero(index.toString(), 3),
//       transactionReferenceNumber: transaction.reference.trim(),
//       branchNumber: getElementAtIndex(transaction.bank, 3).trim(),
//       accountNumber: getElementAtIndex(transaction.bank, 1).trim(),
//       accountName: getElementAtIndex(transaction.bank, 2).trim(),
//       amount: transaction.amount,
//       bankReference: transaction.reference.trim(),
//       paymentAlertDestinationType: "E",
//       paymentAlertDestination: "",
//     })
//   );

//   const handleGenerateFile = async () => {
//     if (transactions) {
//       generateNormalValuePaymentFile(transactions);
//       const _batch: IWithdrawalPaymentBatch = {
//         ...batch,
//         isFileDownloaded: true,
//       };
//       await api.batches.update(_batch);
//     } else {
//       swal({
//         icon: "error",
//         text: "No transactions to Export!",
//       });
//     }
//   };

//   const [selectedTransactions, setSelectedTransactions] = useState<string[]>(
//     []
//   );
//   const [allTransactionsSuccess, setAllTransactionsSuccess] = useState(false);

//   // Check if all transactions are successful
//   useEffect(() => {
//     const isSuccess = data.every(
//       (transaction) => transaction.batchTransactionStatus === "success"
//     );

//     setAllTransactionsSuccess(isSuccess);
//   }, [data]);

//   const selectAllTransactions = () => {
//     setSelectedTransactions(data.map((transaction) => transaction.id));
//   };

//   const deselectAllTransactions = () => {
//     setSelectedTransactions([]);
//   };

//   const markAllAsSuccess = async () => {
//     // Call batchStatusSuccess for all selected transactions
//     await batchStatusSuccess(selectedTransactions, "success");
//   };

//   const handleGenerateHighValueFile = async () => {
//     if (transactions) {
//       generateHighValueBankPaymentFile(transactions);
//       const _batch: IWithdrawalPaymentBatch = {
//         ...batch,
//         isFileDownloaded: true,
//       };
//       await api.batches.update(_batch);
//     } else {
//       swal({
//         icon: "error",
//         text: "No transactions to Export!",
//       });
//     }
//   };

//   useEffect(() => {
//     const data = async () => {
//       await api.earlyDistribution.getAll();
//       await api.closeOutApi.getAll();
//     };

//     data();
//   }, [api.closeOutApi, api.earlyDistribution]);

//   return (
//     <div className="grid">
//       <Toolbar
//         rightControls={
//           <>

//             <>
//               {batch && batch.paymentBatchFileType !== "High" && (
//                 <button className="btn btn-primary" onClick={handleGenerateFile}>
//                   Download Payment File
//                 </button>
//               )}
//               {batch && batch.paymentBatchFileType === "High" && (
//                 <div>

//                   <button
//                     className="btn btn-primary"
//                     onClick={handleGenerateHighValueFile}>
//                     Download Payment File (High Value)
//                   </button>
//                 </div>
//               )}
//             </>


//           </>
//         }
//         leftControls={
//           <h5 style={{ fontSize: "12px" }} className="main-title-sm">
//             Batch Transactions
//           </h5>
//         }
//       />
//       <div className="uk-margin-bottom">
//         {selectedTransactions.length !== data.length && (
//           <button className="btn btn-primary" onClick={selectAllTransactions}>
//             Select All
//           </button>
//         )}
//         {selectedTransactions.length > 0 && (
//           <button className="btn btn-primary" onClick={deselectAllTransactions}>
//             Deselect {selectedTransactions.length === 1 ? "Selected" : "All"} (
//             {selectedTransactions.length})
//           </button>
//         )}
//       </div>
//       <div className="uk-margin-bottom">
//         {selectedTransactions.length > 0 && (
//           <>
//             {batch.isFileDownloaded === true &&
//               <button
//                 className="btn btn-danger"
//                 onClick={() => markAllAsSuccess()}
//                 disabled={allTransactionsSuccess}>
//                 Mark Selected ({selectedTransactions.length}) As Success
//               </button>
//             }
//           </>
//         )}
//       </div>

//       {/* <button
//         className="btn btn-danger"
//         onClick={() => onViewTransaction()}
//         disabled={allTransactionsSuccess}
//       >
//         Mark Selected ({selectedTransactions.length}) As Success
//       </button> */}

//       <Box sx={{ height: 500 }}>
//         <DataGrid
//           rows={data}
//           columns={columns}
//           getRowId={(row) => row.id} // Use the appropriate identifier property
//           rowHeight={50}
//         />
//       </Box>


//       <Modal modalId={MODAL_NAMES.BACK_OFFICE.VIEW_COMPLETED_WITHDRAWAL_MODAL}>
//         <ViewCompletedWithdrawalModal />
//       </Modal>
//     </div>
//   );
// });

import React from 'react'

const BatchTransactionsGridCopy = () => {
  return (
    <div>
      
    </div>
  )
}

export default BatchTransactionsGridCopy

