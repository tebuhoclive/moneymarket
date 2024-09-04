import swal from "sweetalert";
// import MODAL_NAMES from "../../../money-market-management-system/logged-in/dialogs/ModalName";
// import { ISwitchTransaction } from "../../models/SwitchTransactionModel";
// import AppStore from "../../stores/AppStore";
// import showModalFromId, { hideModalFromId } from "../ModalShow";
// import AppApi from "../../apis/AppApi";
// import { IStatementTransaction } from "../../models/StatementTransactionModel";
// import { dateFormat_YY_MM_DD } from "../../utils/utils";
// import {
//   getAccountBalance,
//   getAccountRate,
//   getAccountId,
// } from "../MyFunctions";
// import { IMoneyMarketAccount } from "../../models/money-market-account/MoneyMarketAccount";

// export const onViewTransaction = (transactionId: string, store: AppStore) => {
//   const selectedTransaction = store.switch.getItemById(transactionId);
//   if (selectedTransaction) {
//     store.switch.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL);
//   }
// };

// export const onReturnSwitchForAmendment = (
//   transactionId: string,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   // Set loading to true when operation begins
//   setLoading(true);

//   const selectedTransaction = store.switch.getItemById(transactionId);

//   if (selectedTransaction) {
//     store.switch.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.RETURN_SWITCH_FOR_AMENDMENT_MODAL);
//   }

//   // Set loading to false after operation completes
//   setLoading(false);
// };

// export const onAmendSwitch = (transactionId: string, store: AppStore) => {
//   const selectedTransaction = store.switch.getItemById(transactionId);

//   if (selectedTransaction) {
//     store.switch.select(selectedTransaction.asJson);
//     showModalFromId(MODAL_NAMES.BACK_OFFICE.AMEND_SWITCH_MODAL);
//   }
// };

// export const onDeleteSwitch = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   // Set loading to true when operation begins

//   const update = async (
//     oldTransaction: ISwitchTransaction,
//     newTransaction: ISwitchTransaction
//   ) => {
//     try {
//       await api.switch.updateAndCreateAuditTrail(
//         oldTransaction,
//         newTransaction
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been deleted",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Delete"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);

//       const oldTransaction = store.switch.getItemById(oldTransactionId);

//       if (oldTransaction) {
//         store.switch.select(oldTransaction.asJson);
//         const saveTransaction: ISwitchTransaction = {
//           ...oldTransaction.asJson,
//           timeFirstLevel: Date.now(),
//           switchStatus: "Deleted",
//           switchAction: "Deleted",
//           timeDeleted: Date.now(),
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

//     // Set loading to false after operation completes
//     setLoading(false);
//   });
// };

// export const onFirstLevelSwitchApproval = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   // Set loading to true when operation begins

//   const update = async (
//     oldTransaction: ISwitchTransaction,
//     newTransaction: ISwitchTransaction
//   ) => {
//     try {
//       await api.switch.updateAndCreateAuditTrail(
//         oldTransaction,
//         newTransaction
//       );
//       swal({
//         icon: "success",
//         text: "Transaction has been approved (1st level approval)!",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve (1st Level Approval)"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);

//       const oldTransaction = store.switch.getItemById(oldTransactionId);

//       if (oldTransaction) {
//         store.switch.select(oldTransaction.asJson);
//         const saveTransaction: ISwitchTransaction = {
//           ...oldTransaction.asJson,
//           switchStatus: "Verified",
//           switchAction: "Submitted for 1st Approval",
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

//     // Set loading to false after operation completes
//     setLoading(false);
//   });
// };

// export const onSecondLevelSwitchApproval = async (
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading: (loading: boolean) => void // Add setLoading as an argument
// ) => {
//   // Set loading to true when operation begins

//   const update = async (
//     oldTransaction: ISwitchTransaction,
//     newTransaction: ISwitchTransaction
//   ) => {
//     try {
//       await api.switch.updateAndCreateAuditTrail(
//         oldTransaction,
//         newTransaction
//       );
//       swal({
//         icon: "success",
//         text: "Passed 2nd Level Approval",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve(2nd Level)"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       setLoading(true);

//       const oldTransaction = store.switch.getItemById(oldTransactionId);

//       if (oldTransaction) {
//         store.switch.select(oldTransaction.asJson);
//         const saveTransaction: ISwitchTransaction = {
//           ...oldTransaction.asJson,
//           switchStatus: "Approved",
//           switchAction: "Submitted for 2nd Approval",
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

//     // Set loading to false after operation completes
//     setLoading(false);
//   });
// };

// export const onCompletedSwitchApproval = async (
//   switchTransaction: ISwitchTransaction,
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore,
//   setLoading?: (loading: boolean) => void
// ) => {
//   const moneyMarketAccounts = store.mma.all;

//   const update = async (
//     oldTransaction: ISwitchTransaction,
//     newTransaction: ISwitchTransaction
//   ) => {
//     try {
//       try {
//         const fromAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber === newTransaction.fromAccount
//         );

//         const toAccount = moneyMarketAccounts.find(
//           (account) => account.asJson.accountNumber === newTransaction.toAccount
//         );

//         if (switchTransaction.description === "Switch from Closed Account") {
//           swal("You are about to approve a Switch Close Out");
//           if (fromAccount && toAccount) {
//             const updatedMMA = {
//               ...fromAccount.asJson,
//             };

//             await api.mma.updateBalance(updatedMMA);

//             if (fromAccount.asJson.monthTotalInterest) {
//               const statementTransactionCapitalise: IStatementTransaction = {
//                 id: `s${Date.now()}`,
//                 date: Date.parse(dateFormat_YY_MM_DD(switchTransaction.ijgValueDate || Date.now())),
//                 transaction: "capitalisation",
//                 balance:
//                   getAccountBalance(switchTransaction.fromAccount, store) +
//                   fromAccount.asJson.monthTotalInterest,
//                 previousBalance: getAccountBalance(
//                   switchTransaction.fromAccount,
//                   store
//                 ),
//                 rate: getAccountRate(switchTransaction.fromAccount, store) || 0,
//                 remark: `Capitalise`,
//                 amount: fromAccount.asJson.monthTotalInterest,
//                 createdAt: Date.now(),
//               };

//               try {
//                 await api.mma.createSwitchCapitalisationTransaction(
//                   getAccountId(switchTransaction.fromAccount, store) || "",
//                   statementTransactionCapitalise,
//                   switchTransaction,
//                   fromAccount.asJson.monthTotalInterest
//                 );
//                 try {
//                 } catch (error) {}
//               } catch (error) {}
//             }
//           }
//           await api.switch.updateAndCreateAuditTrail(
//             oldTransaction,
//             newTransaction
//           );
//         } else if (
//           switchTransaction.description !== "Switch from Closed Account"
//         ) {
//           if (fromAccount) {
//             const newBalance =
//               fromAccount.asJson.balance - newTransaction.amount;
//             const runningBalance =
//               fromAccount.asJson.balance - newTransaction.amount;

//             // update balance in MM account
//             const accountUpdate: IMoneyMarketAccount = {
//               ...fromAccount.asJson,
//               balance: newBalance,
//               runningBalance: runningBalance,
//             };

//             try {
//               await api.mma.update(accountUpdate);

//               const statementTransactionFrom: IStatementTransaction = {
//                 id: newTransaction.id,
//                 date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                 transaction: "withdrawal",
//                 balance: newBalance,
//                 rate: getAccountRate(newTransaction.fromAccount, store) || 0,
//                 remark: `Switch to ${newTransaction.toAccount}`,
//                 amount: newTransaction.amount,
//                 createdAt: Date.now(),
//               };
//               try {
//                 await api.mma.createStatementTransaction(
//                   getAccountId(newTransaction.fromAccount, store) || "",
//                   statementTransactionFrom
//                 );
//               } catch (error) {}
//             } catch (error) {}
//           }

//           if (toAccount) {
//             const newBalance = toAccount.asJson.balance + newTransaction.amount;
//             const runningBalance =
//               toAccount.asJson.balance + newTransaction.amount;

//             // update balance in MM account
//             const accountUpdate: IMoneyMarketAccount = {
//               ...toAccount.asJson,
//               balance: newBalance,
//               runningBalance: runningBalance,
//             };

//             try {
//               await api.mma.update(accountUpdate);
//               const statementTransactionTo: IStatementTransaction = {
//                 id: newTransaction.id,
//                 date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                 transaction: "deposit",
//                 balance: newBalance,
//                 rate: getAccountRate(newTransaction.toAccount, store) || 0,
//                 remark: `Switch from ${newTransaction.fromAccount}`,
//                 amount: newTransaction.amount,
//                 createdAt: Date.now(),
//               };
//               try {
//                 await api.mma.createStatementTransaction(
//                   getAccountId(newTransaction.toAccount, store) || "",
//                   statementTransactionTo
//                 );
//               } catch (error) {}
//             } catch (error) {}
//           }

//           await api.switch.updateAndCreateAuditTrail(
//             oldTransaction,
//             newTransaction
//           );
//         }
//       } catch (error) {}
//       swal({
//         icon: "success",
//         text: "Transaction Completed",
//       });
//       hideModalFromId(MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL);
//     } catch (error) {}
//   };

//   swal({
//     title: "Are you sure?",
//     icon: "warning",
//     buttons: ["Cancel", "Approve(Completed)"],
//     dangerMode: true,
//   }).then(async (edit) => {
//     if (edit) {
//       const oldTransaction = store.switch.getItemById(oldTransactionId);

//       if (oldTransaction) {
//         store.switch.select(oldTransaction.asJson);
//         if (switchTransaction.ijgValueDate) {
//           const saveTransaction: ISwitchTransaction = {
//             ...oldTransaction.asJson,
//             switchStatus: "Completed",
//             switchAction: "Completed",
//             ijgValueDate: switchTransaction.ijgValueDate,
//           };
//           await update(oldTransaction.asJson, saveTransaction);
//         } else {
//           const saveTransaction: ISwitchTransaction = {
//             ...oldTransaction.asJson,
//             switchStatus: "Completed",
//             switchAction: "Completed",
//             ijgValueDate: Date.now(),
//           };
//           await update(oldTransaction.asJson, saveTransaction);
//         }
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

// export const onCompletedSwitchApproveOnBulk = async (
//   switchTransaction: ISwitchTransaction,
//   oldTransactionId: string,
//   api: AppApi,
//   store: AppStore
// ) => {
//   // Set loading to true when operation begins

//   const moneyMarketAccounts = store.mma.all;

//   const update = async (
//     oldTransaction: ISwitchTransaction,
//     newTransaction: ISwitchTransaction
//   ) => {
//     try {
//       try {
//         const fromAccount = moneyMarketAccounts.find(
//           (account) =>
//             account.asJson.accountNumber === newTransaction.fromAccount
//         );
//         const toAccount = moneyMarketAccounts.find(
//           (account) => account.asJson.accountNumber === newTransaction.toAccount
//         );

//         if (fromAccount) {
//           const newBalance = fromAccount.asJson.balance - newTransaction.amount;
//           const runningBalance =
//             fromAccount.asJson.balance - newTransaction.amount;

//           // update balance in MM account
//           const accountUpdate: IMoneyMarketAccount = {
//             ...fromAccount.asJson,
//             balance: newBalance,
//             runningBalance: runningBalance,
//           };

//           try {
//             await api.mma.update(accountUpdate);

//             const statementTransactionFrom: IStatementTransaction = {
//               id: newTransaction.id,
//               date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//               transaction: "withdrawal",
//               balance: newBalance,
//               rate: getAccountRate(newTransaction.fromAccount, store) || 0,
//               remark: `Switch to ${newTransaction.toAccount}`,
//               amount: newTransaction.amount,
//               createdAt: Date.now(),
//             };
//             try {
//               await api.mma.createStatementTransaction(
//                 getAccountId(newTransaction.fromAccount, store) || "",
//                 statementTransactionFrom
//               );
//             } catch (error) {}
//           } catch (error) {}
//         }

//         if (toAccount) {
//           const newBalance = toAccount.asJson.balance + newTransaction.amount;
//           const runningBalance =
//             toAccount.asJson.balance + newTransaction.amount;

//           // update balance in MM account
//           const accountUpdate: IMoneyMarketAccount = {
//             ...toAccount.asJson,
//             balance: newBalance,
//             runningBalance: runningBalance,
//           };

//           try {
//             await api.mma.update(accountUpdate);
//             const statementTransactionTo: IStatementTransaction = {
//               id: newTransaction.id,
//               date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//               transaction: "deposit",
//               balance: newBalance,
//               rate: getAccountRate(newTransaction.toAccount, store) || 0,
//               remark: `Switch from ${newTransaction.fromAccount}`,
//               amount: newTransaction.amount,
//               createdAt: Date.now(),
//             };
//             try {
//               await api.mma.createStatementTransaction(
//                 getAccountId(newTransaction.toAccount, store) || "",
//                 statementTransactionTo
//               );
//             } catch (error) {}
//           } catch (error) {}
//         }

//         await api.switch.updateAndCreateAuditTrail(
//           oldTransaction,
//           newTransaction
//         );
//       } catch (error) {}
//     } catch (error) {}
//   };

//   const oldTransaction = store.switch.getItemById(oldTransactionId);

//   if (oldTransaction) {
//     store.switch.select(oldTransaction.asJson);
//     if (switchTransaction.ijgValueDate) {
//       const saveTransaction: ISwitchTransaction = {
//         ...oldTransaction.asJson,
//         switchStatus: "Completed",
//         switchAction: "Completed",
//         ijgValueDate: switchTransaction.ijgValueDate,
//       };
//       await update(oldTransaction.asJson, saveTransaction);
//     } else {
//       const saveTransaction: ISwitchTransaction = {
//         ...oldTransaction.asJson,
//         switchStatus: "Completed",
//         switchAction: "Completed",
//         ijgValueDate: Date.now(),
//       };
//       await update(oldTransaction.asJson, saveTransaction);
//     }
//   } else {
//   }

//   // Set loading to false after operation completes
// };
