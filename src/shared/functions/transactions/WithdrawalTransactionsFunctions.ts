// import swal from "sweetalert";
// import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
// import AppStore from "../../stores/AppStore";
// import showModalFromId, { hideModalFromId } from "../ModalShow";
// import { IWithdrawalTransaction } from "../../models/withdrawal-transaction/WithdrawalTransactionModel";
// import AppApi from "../../apis/AppApi";
// import { IWithdrawalPaymentBatch } from "../../models/batches/BatchesModel";
// import { generateBatchFileReference } from "../MyFunctions";
// import { splitAndTrimString } from "../StringFunctions";

import { IWithdrawalTransaction } from "../../models/withdrawal-transaction/WithdrawalTransactionModel";
import AppStore from "../../stores/AppStore";

// export const onViewCompletedWithdrawalTransaction = (
//   batchId: string,
//   clientId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.withdrawalTransaction.getItemById(
//     clientId
//   );
//   const selectedBatch = store.batches.getItemById(batchId);
//   if (selectedTransaction && selectedBatch) {
//     store.batches.select(selectedBatch.asJson);
//     store.withdrawalTransaction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_COMPLETED_WITHDRAWAL_MODAL);
//   }
// };

// export const onViewWithdrawalTransaction = (
//   clientId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.withdrawalTransaction.getItemById(
//     clientId
//   );

//   if (selectedTransaction) {
//     store.withdrawalTransaction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//   }
// };

// export const onViewBackWithdrawalTransaction = (
//   clientId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.withdrawalTransaction.getItemById(
//     clientId
//   );

//   if (selectedTransaction) {
//     store.withdrawalTransaction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.BACK_DATE_WITHDRAWAL_TRANSACTION);
//   }
// };

// export const onViewRecurringWithdrawalTransaction = (
//   clientId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.recurringWithdrawalInstruction.getItemById(
//     clientId
//   );

//   if (selectedTransaction) {
//     store.recurringWithdrawalInstruction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//   }
// };

// export const onReturnWithdrawalForAmendment = (
//   transactionId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.withdrawalTransaction.getItemById(
//     transactionId
//   );

//   if (selectedTransaction) {
//     store.withdrawalTransaction.select(selectedTransaction.asJson);
//     showModalFromId(
//       MODAL_NAMES.BACK_OFFICE.RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL
//     );
//   }
// };

// export const onAmendWithdrawal = (transactionId: string, store: AppStore) => {
//   const selectedTransaction = store.withdrawalTransaction.getItemById(
//     transactionId
//   );

//   if (selectedTransaction) {
//     store.withdrawalTransaction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
//   }
// };

// export const onAmendRecurringWithdrawal = (
//   transactionId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.recurringWithdrawalInstruction.getItemById(
//     transactionId
//   );

//   if (selectedTransaction) {
//     store.recurringWithdrawalInstruction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
//   }
// };

// export const onEditRecurringWithdrawal = (
//   transactionId: string,
//   store: AppStore
// ) => {
//   const selectedTransaction = store.recurringWithdrawalInstruction.getItemById(
//     transactionId
//   );

//   if (selectedTransaction) {
//     store.recurringWithdrawalInstruction.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.EDIT_WITHDRAWAL_RECURRING_MODAL);
//   }
// };

// export const onFirstLevelApproval = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been submitted for 1st level approval!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);

//         if (
//           oldTransaction.asJson.description.includes("Returned for Amendment")
//         ) {
//           const saveTransaction: IWithdrawalTransaction = {
//             ...oldTransaction.asJson,
//             allocationStatus: "Awaiting Verification",
//             transactionStatus: "Awaiting Verification",
//             transactionAction: "Submitted for 1st Approval",
//             timeFirstLevelApproval: Date.now(),
//             description: "Amended",
//           };
//           await update(oldTransaction.asJson, saveTransaction);
//         } else {
//           const saveTransaction: IWithdrawalTransaction = {
//             ...oldTransaction.asJson,
//             allocationStatus: "Awaiting Verification",
//             transactionStatus: "Awaiting Verification",
//             transactionAction: "Submitted for 1st Approval",
//             timeFirstLevelApproval: Date.now(),
//           };
//           await update(oldTransaction.asJson, saveTransaction);
//         }
//         // Use the loading state here
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//     // Set loading to false after operation completes
//     setLoading(false);
//   });
// };

// export const onSecondLevelApproval = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (2nd level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Verified",
//           transactionStatus: "Verified",
//           transactionAction: "Submitted for 2nd Approval",
//           timeSecondLevelApproval: Date.now(),
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//     setLoading(false);
//   });
// };

// export const onApproveForBatching = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (2nd level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Approved",
//           transactionStatus: "Approved",
//           transactionAction: "Submitted to Payment Queue",
//           timePaymentQueue: Date.now(),
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//     setLoading(false);
//   });
// };

// export const onBatching = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (2nd level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Approved",
//           transactionStatus: "Approved",
//           transactionAction: "Submitted to Payment Queue",
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//     setLoading(false);
//   });
// };

// export const onDeleteTransaction = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been deleted!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Delete "],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Deleted",
//           transactionAction: "Deleted",
//           timeDelete: Date.now(),
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onFirstLevelApprovalDelete = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (2nd level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve (2nd Level Approval)"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Deleted",
//           transactionStatus: "Deleted",
//           transactionAction: "Passed 2nd Level Approval",
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export const onSecondLevelApprovalDelete = (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore
// ) => {
//   const update = async (
//     oldTransactionState: IWithdrawalTransaction,
//     newTransactionState: IWithdrawalTransaction
//   ) => {
//     try {
//       await api.withdrawalTransaction.updateAndCreateAuditTrail(
//         oldTransactionState,
//         newTransactionState
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (2nd level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTION_WITHDRAWAL_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve (2nd Level Approval"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       const oldTransaction = store.withdrawalTransaction.getItemById(
//         oldTransactionId
//       );

//       if (oldTransaction) {
//         store.withdrawalTransaction.select(oldTransaction.asJson);
//         const saveTransaction: IWithdrawalTransaction = {
//           ...oldTransaction.asJson,
//           allocationStatus: "Deleted",
//           transactionStatus: "Deleted",
//           transactionAction: "Passed 2nd Level Approval",
//         };
//         await update(oldTransaction.asJson, saveTransaction);
//       } else {
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// };

// export async function batchesWithdrawalPayments(
//   store: AppStore,
//   api: AppApi,
//   me: string,
//   transactions: IWithdrawalTransaction[],
//   filter: string,
//   setLoader?: (loading: boolean) => void,
//   setTransactionUpdated?: (numberOfAccount: number) => void,
//   setProgressPercentage?: (progress: string) => void
// ) {
//   const allTransactions = transactions
//     .filter(
//       (t) =>
//         (t.batchStatus === false || !t.batchStatus) &&
//         t.allocationStatus === "Approved"
//     )
//     .map((t) => {
//       return t;
//     });

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Batch Payments"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       if (setLoader) {
//         setLoader(true);
//       }
//       let completedCount = 0;
//       const namibianUniversalBranchCodes = [
//         "280172",
//         "483772",
//         "461609",
//         "087373",
//       ];

//       const lowValueTransactions = allTransactions
//         .filter(
//           (t) =>
//             t.amount <= 5000000 &&
//             namibianUniversalBranchCodes.includes(
//               splitAndTrimString("|", t.bank)[3].trim()
//             )
//         )
//         .map((t) => {
//           return t;
//         });

//       const highValueTransactions = allTransactions
//         .filter(
//           (t) =>
//             t.amount > 5000000 &&
//             namibianUniversalBranchCodes.includes(
//               splitAndTrimString("|", t.bank)[3].trim()
//             )
//         )
//         .map((t) => {
//           return t;
//         });

//       const zarTransactions = allTransactions.filter(
//         (t) =>
//           !namibianUniversalBranchCodes.includes(
//             splitAndTrimString("|", t.bank)[3].trim()
//           )
//       );

//       if (filter === "Normal") {
//         const lowValueTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: lowValueTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "Low",
//           isFileDownloaded: false,
//         };

//         try {
//           if (lowValueTransactions.length > 0) {
//             await api.batches.create(lowValueTransactionBatch);
//           }
//         } catch (error) {
//         } finally {
//           // update batch status in transactions for display.
//           for (const transaction of lowValueTransactions) {
//             try {
//               console.log("transaction batched", transaction.id);

//               await api.withdrawalTransaction.updateBatchStatus(
//                 transaction.id
//               );
//             } catch (error) {}
//           }
//           swal(
//             "Low Value Payments have been batch and are ready for upload to bank"
//           );
//         }
//       }

//       if (filter === "High Value") {
//         const highValueTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: highValueTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "High",
//           isFileDownloaded: false,
//         };

//         try {
//           if (highValueTransactions.length > 0) {
//             await api.batches.create(highValueTransactionBatch);
//           }
//         } catch (error) {
//         } finally {
//           // update batch status in transactions for display.
//           for (const transaction of highValueTransactions) {
//             try {
//               await api.withdrawalTransaction.updateBatchStatus(
//                 transaction.id
//               );
//               console.log("transaction batched", transaction.id);
//             } catch (error) {}
//           }
//           swal({
//             icon: "success",
//             text:
//               "High Value Payments have been batch and are ready for upload to bank",
//           });
//         }
//       }

//       if (filter === "ZAR") {
//         const zarTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: zarTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "ZAR",
//           isFileDownloaded: false,
//         };

//         try {
//           if (zarTransactions.length > 0) {
//             await api.batches.create(zarTransactionBatch);
//           }
//         } catch (error) {
//         } finally {
//           // update batch status in transactions for display.
//           for (const transaction of zarTransactions) {
//             try {
//               await api.withdrawalTransaction.updateBatchStatus(
//                 transaction.id
//               );
//               console.log("transaction batched", transaction.id);
//             } catch (error) {}
//           }
//           swal({
//             icon: "success",
//             text:
//               "ZAR Payments have been batch and are ready for upload to bank",
//           });
//         }
//       }

//       if (filter === "" || filter === "Both") {
//         const lowValueTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: lowValueTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "Low",
//           isFileDownloaded: false,
//         };

//         const highValueTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: highValueTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "High",
//           isFileDownloaded: false,
//         };

//         const zarTransactionBatch: IWithdrawalPaymentBatch = {
//           id: "",
//           batchNumber: generateBatchFileReference(),
//           paymentBatchFileTransactions: zarTransactions,
//           processedBy: me || "",
//           timeProcessed: Date.now(),
//           paymentBatchFileType: "ZAR",
//           isFileDownloaded: false,
//         };

//         try {
//           if (lowValueTransactions.length > 0) {
//             await api.batches.create(lowValueTransactionBatch);
//             console.log(
//               " low value transaction batched",
//               lowValueTransactionBatch
//             );
//           }

//           if (highValueTransactions.length > 0) {
//             await api.batches.create(highValueTransactionBatch);
//             console.log(
//               " high value transaction batched",
//               lowValueTransactionBatch
//             );
//           }

//           if (zarTransactions.length > 0) {
//             await api.batches.create(zarTransactionBatch);
//             console.log(" Zar transaction batched", zarTransactionBatch);
//           }
//         } catch (error) {
//         } finally {
//           for (const transaction of allTransactions) {
//             try {
//               await api.withdrawalTransaction.updateBatchStatus(
//                 transaction.id
//               );
//               completedCount++;
//               const progress = (
//                 (completedCount / allTransactions.length) *
//                 100
//               ).toFixed(2);
//               if (setProgressPercentage && setTransactionUpdated) {
//                 setTransactionUpdated(completedCount);
//                 setProgressPercentage(progress);
//               }
//             } catch (error) {}
//           }
//           swal({
//             icon: "success",
//             text:
//               "Selected Payments have been batch and are ready for upload to bank",
//           });
//           if (setLoader) {
//             setLoader(false);
//           }
//         }
//       }
//     } else {
//       swal({
//         icon: "error",
//         text: "Operation cancelled!",
//       });
//     }
//   });
// }

export const createFunction = () => {

}
