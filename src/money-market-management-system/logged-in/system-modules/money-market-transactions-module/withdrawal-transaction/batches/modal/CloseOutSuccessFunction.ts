// import AppApi from "../../../../../../../shared/apis/AppApi";
// import {
//   getAccountBalance,
//   getAccountId,
//   getAccountRate,
//   minusWithdrawalAmountFromBalance,
// } from "../../../../../../../shared/functions/MyFunctions";
// import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
// import { IWithdrawalPaymentBatch } from "../../../../../../../shared/models/batches/BatchesModel";
// import { IWithdrawalTransaction } from "../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
// import AppStore from "../../../../../../../shared/stores/AppStore";
// import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";

// export const processCloseOutTransaction = async (
//   store: AppStore,
//   api: AppApi,
//   transactionId: string,
//   batch: IWithdrawalPaymentBatch,
//   status: string
// ) => {
//   const withdrawal = store.withdrawalTransaction.getItemById(transactionId);

//   if (withdrawal) {
//     store.withdrawalTransaction.select(withdrawal.asJson);
//     const saveTransaction: IWithdrawalTransaction = {
//       ...withdrawal.asJson,
//       allocationStatus: "Approved",
//       transactionStatus: "Approved",
//       transactionAction: "Completed",
//       timeProcessedPayment: Date.now(),
//     };
//     await update(withdrawal.asJson, saveTransaction, api);

//     if (store.withdrawalTransaction.selected) {
//       const withdrawalAllocation = store.withdrawalTransaction.selected;

//       const moneyMarketAccount = store.mma.all
//         .map((mma) => {
//           return mma.asJson;
//         })
//         .find(
//           (account) => account.accountNumber === withdrawalAllocation.allocation
//         );
//       if (moneyMarketAccount) {
//         const updatedMMA = {
//           ...moneyMarketAccount,
//           balance:
//             (moneyMarketAccount?.monthTotalInterest || 0) +
//             moneyMarketAccount.balance,
//         };

//         console.log("moneyMarketAccount: ", moneyMarketAccount);

//         const statementTransactionCapitalise: IStatementTransaction = {
//           id: "yHghghyYvhyvsamd",
//           date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//           transaction: "capitalisation",
//           balance:
//             getAccountBalance(withdrawalAllocation.allocation, store) +
//             (moneyMarketAccount.monthTotalInterest || 0),
//           previousBalance: getAccountBalance(
//             withdrawalAllocation.allocation,
//             store
//           ),
//           rate: getAccountRate(withdrawalAllocation.allocation, store) || 0,
//           remark: `Capitalise`,
//           amount: moneyMarketAccount.monthTotalInterest || 0,
//           createdAt: Date.now(),
//         };

//         try {
//           await api.mma.updateBalance(updatedMMA);
//           try {
//             let saved = false;
//             await api.mma.createStatementTransaction(
//               getAccountId(withdrawalAllocation.allocation, store) || "",
//               statementTransactionCapitalise
//             );
//             saved = true;
//             try {
//               await api.batches.updateBatchTransactionStatus(
//                 batch,
//                 transactionId,
//                 status
//               );
//               await api.withdrawalTransaction.updateProcessStatus(
//                 transactionId
//               );
//               try {
//                 if (saved === true) {
//                   const statementTransaction: IStatementTransaction = {
//                     id: withdrawalAllocation.id,
//                     date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
//                     transaction: "withdrawal",
//                     balance:
//                       getAccountBalance(
//                         withdrawalAllocation.allocation,
//                         store
//                       ) - withdrawalAllocation.amount,
//                     previousBalance: getAccountBalance(
//                       withdrawalAllocation.allocation,
//                       store
//                     ),
//                     rate:
//                       getAccountRate(withdrawalAllocation.allocation, store) ||
//                       0,
//                     remark: `Close Out: Withdraw to account ${withdrawalAllocation.bank}`,
//                     amount: withdrawalAllocation.amount,
//                     createdAt: Date.now() + 1,
//                   };
//                   await api.mma.createStatementTransaction(
//                     getAccountId(withdrawalAllocation.allocation, store) || "",
//                     statementTransaction
//                   );
//                   await minusWithdrawalAmountFromBalance(
//                     statementTransactionCapitalise.balance,
//                     moneyMarketAccount.accountNumber,
//                     store,
//                     api,
//                     transactionId
//                   );
//                 }
//               } catch (error) {}
//             } catch (error) {
//               console.log("Balance Minus Error", error);
//             }
//           } catch (error) {
//             console.log("Balance Update Error", error);
//           }
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     }
//   }
// };

// const update = async (
//   oldTransactionState: IWithdrawalTransaction,
//   newTransactionState: IWithdrawalTransaction,
//   api: AppApi
// ) => {
//   try {
//     await api.withdrawalTransaction.updateAndCreateAuditTrail(
//       oldTransactionState,
//       newTransactionState
//     );
//   } catch (error) {}
// };

const CloseOutSuccessFunction = () => {
  return ("")
}

export default CloseOutSuccessFunction

