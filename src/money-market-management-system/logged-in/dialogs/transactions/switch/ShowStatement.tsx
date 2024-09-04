// import { useEffect, useState } from "react";
// import { useAppContext } from "../../../../../shared/functions/Context";
// import { IStatementTransaction } from "../../../../../shared/models/StatementTransactionModel";
// import { dateFormat_YY_MM_DD } from "../../../../../shared/utils/utils";
// import { getAccountRate } from "../../../../../shared/functions/MyFunctions";
// import { ISwitchTransaction } from "../../../../../shared/models/SwitchTransactionModel";
// import swal from "sweetalert";
// import { calculateInterest, getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution, getTotalDaysInMonth } from "../../../../../shared/functions/transactions/Statement";
// interface IProps {
//   moneyMarketAccountId: string;
//   switchTransaction: ISwitchTransaction;
// }

// const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();

// const startOfMonth = new Date(currentYear, currentMonth, 1);
// const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

// const ShowStatement = (props: IProps) => {
//   const { api, store } = useAppContext();

//   const [startDate, setStartDate] = useState<Date>(startOfMonth);
//   const [endDate, setEndDate] = useState<Date>(endOfMonth);

//   const { moneyMarketAccountId, switchTransaction } = props;

//   const [selectedRows, setSelectedRows] = useState<number[]>([]);
//   const [loading, setLoading] = useState(false);

//   const statementTransactions = store.statementTransaction.all.filter(
//     (notBlinded) => notBlinded.asJson.blinded !== true
//   );

//   const statementTransactionsAsJson = statementTransactions.map(
//     (transaction) => {
//       return transaction.asJson;
//     }
//   );

//   const calculateDays = (
//     transactionDate: number,
//     nextTransactionDate?: number
//   ): number => {
//     const currentDate = new Date();
//     const transactionDateTime = new Date(transactionDate);

//     if (nextTransactionDate) {
//       const nextTransactionDateTime = new Date(nextTransactionDate);
//       const millisecondsPerDay = 1000 * 60 * 60 * 24;
//       return Math.ceil(
//         (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
//           millisecondsPerDay
//       );
//     } else {
//       const millisecondsPerDay = 1000 * 60 * 60 * 24;
//       return (
//         Math.ceil(
//           (currentDate.getTime() - transactionDateTime.getTime()) /
//             millisecondsPerDay
//         ) - 1
//       );
//     }
//   };
//   const filteredStatementTransactions = getFilteredStatementTransactions(startDate, endDate, statementTransactionsAsJson)

//   const totalDaysInMonth = getTotalDaysInMonth(statementTransactionsAsJson);

//   const newTransaction: IStatementTransaction = {
//     id: "",
//     date: Date.parse(dateFormat_YY_MM_DD(switchTransaction.switchDate || 0)),
//     transaction: "switchFrom",
//     balance: getAccountBalance(switchTransaction.fromAccount, store),
//     rate: getAccountRate(switchTransaction.fromAccount, store) || 0,
//     remark: `Switch from ${switchTransaction.fromAccount}`,
//     amount: switchTransaction.amount,
//     createdAt: Date.now(),
//     previousBalance: getAccountBalance(switchTransaction.fromAccount, store),
//   };

//   // Push the new transaction to the existing filteredStatementTransactions array
//   filteredStatementTransactions.push(newTransaction);

//   // Sort the array based on date and createdAt fields
//   filteredStatementTransactions.sort((a, b) => {
//     const dateA = new Date(a.date || 0);
//     const dateB = new Date(b.date || 0);

//     // First, sort by date
//     if (dateB.getTime() !== dateA.getTime()) {
//       return dateA.getTime() - dateB.getTime();
//     } else {
//       // If dates are equal, sort by createdAt
//       const createdAtA = new Date(a.createdAt || 0);
//       const createdAtB = new Date(b.createdAt || 0);
//       return createdAtA.getTime() - createdAtB.getTime();
//     }
//   });

//   const totalDays = getStatementTotalDays(filteredStatementTransactions);
//   const totalDistribution = getStatementTotalDistribution(filteredStatementTransactions);


//   // Find the index where the new transaction was pushed
//   const newIndex = filteredStatementTransactions.findIndex(
//     (transaction) => transaction === newTransaction
//   );

//   // If the new transaction is not the first transaction in the array
//   if (newIndex > 0) {
//     // Get the previous balance before the pushed transaction
//     const previousBalanceBeforePush =
//       filteredStatementTransactions[newIndex - 1].balance;

//     // Subtract the amount of the pushed transaction from the previous balance
//     const newTransactionAmount = newTransaction.amount || 0;
//     const previousBalanceAfterPush =
//       previousBalanceBeforePush - newTransactionAmount;

//     // Update the balance of the pushed transaction
//     newTransaction.balance = previousBalanceAfterPush;

//     // Flag a message if the pushed transaction amount is greater than the previous balance
//     // if (previousBalanceBeforePush < newTransactionAmount) {
//     //   console.log(
//     //     "Warning: The pushed transaction amount is greater than the previous closing balance."
//     //   );
//     //   // Handle the warning message or alert here
//     // }
//     if (previousBalanceBeforePush < newTransactionAmount) {
//       swal({
//         title: "Back Dating",
//         text: "Cannot Back date transaction if the amount is less than the available balance of the back dated date.",
//         icon: "warning",
//         buttons: ["Cancel", "OK"],
//         dangerMode: true,
//       });
//     }
//   }

//   // Update balances and recalculate days and distribution for each transaction
//   let previousBalance = filteredStatementTransactions[0]?.balance || 0;
//   filteredStatementTransactions.forEach((transaction, index) => {
//     transaction.previousBalance = previousBalance;
//     if (index < filteredStatementTransactions.length - 1) {
//       const nextTransaction = filteredStatementTransactions[index + 1];
//       transaction.days = calculateDays(transaction.date, nextTransaction.date);
//     } else {
//       transaction.days = calculateDays(transaction.date);
//     }
//     transaction.distribution = Number(
//       ((transaction.balance * transaction.rate) / 100) *
//         (transaction.days ? transaction.days / 365 : 0 / 365)
//     );
//     previousBalance = transaction.balance;
//   });


  
//   // Log previous balances
//   const logPreviousBalances = () => {
//     if (filteredStatementTransactions) {
//       let previousBalance = filteredStatementTransactions[0]?.balance || 0;
//       console.log("Previous Balance (Opening):", previousBalance);

//       filteredStatementTransactions.forEach((transaction, index) => {
//         if (index > 0) {
//           console.log(
//             `Previous Balance (Transaction ${index}):`,
//             previousBalance
//           );
//           previousBalance = transaction.balance;
//         }
//       });
//     }
//   };
//   logPreviousBalances();

//   calculateInterest(statementTransactionsAsJson, filteredStatementTransactions);

//   useEffect(() => {
//     const loadStatement = async () => {
//       if (moneyMarketAccountId) {
//         try {
//           await Promise.all([
//             api.statementTransaction.getAll(moneyMarketAccountId),
//           ]);
//         } catch (error) {}
//       } else {
//       }
//     };

//     loadStatement();
//   }, [api.statementTransaction, moneyMarketAccountId]);

//   return (
//     <div>
//       <div className="uk-grid">
//         <div className="uk-width-expand uk-align-items-right">
//           {" "}
//           <h4 className="main-title-lg">Adjusted Client Statement</h4>
//         </div>
//       </div>
//       <div className="uk-width-expand uk-width-1-1">
//         {!loading && (
//           <table className="uk-table uk-table-small kit-table">
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Amount</th>
//                 <th>Previous Balance</th>
//                 <th>Balance</th>
//                 <th>Rate</th>
//                 <th>Days</th>
//                 <th>Interest</th>
//                 <th>Remark</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <th></th>
//                 <th>Opening Balance</th>
//                 <th>
//                   {filteredStatementTransactions &&
//                     (
//                       filteredStatementTransactions[0]?.balance || 0
//                     )}
//                 </th>
//                 <th></th>
//                 <th></th>
//                 <th></th>
//                 <th></th>
//                 <th></th>
//               </tr>
//               {filteredStatementTransactions &&
//                 filteredStatementTransactions.map((transaction, index) => (
//                   <tr
//                     className={transaction.blinded ? "uk-text-danger" : ""}
//                     key={transaction.id}>
//                     <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
//                     <td>
//                       {transaction.amount
//                         ? transaction.transaction === "withdrawal"
//                           ? `-${(transaction.amount)}`
//                           : (transaction.amount)
//                         : "-"}
//                     </td>
//                     <td>{(transaction.previousBalance || 0)}</td>
//                     <td>{(transaction.balance)}</td>
//                     <td>{transaction.rate}</td>
//                     <td>{transaction.days || "-"}</td>
//                     <td>{(transaction.distribution || 0) || "-"}</td>
//                     <td>{transaction.remark}</td>
//                   </tr>
//                 ))}
//               <tr>
//                 <th></th>
//                 <th>Closing Balance</th>
//                 <th>
//                   {filteredStatementTransactions &&
//                     (
//                       filteredStatementTransactions[
//                         filteredStatementTransactions.length - 1
//                       ]?.balance || 0
//                     )}
//                 </th>
//                 <th></th>
//                 <th>Totals</th>
//                 <th>{totalDays}</th>
//                 <th>{(totalDistribution)}</th>
//                 <th></th>
//               </tr>
//             </tbody>
//           </table>
//         )}
//         {/* {loading && <LoadingEllipsis />} */}
//       </div>
//     </div>
//   );
// };

// export default ShowStatement;

import React from 'react'

const ShowStatement = () => {
  return (
    <div>
      
    </div>
  )
}

export default ShowStatement











