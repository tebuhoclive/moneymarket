// import { useEffect, useState } from "react";
// import { useAppContext } from "../../../../../../shared/functions/Context";
// import { dateFormat_YY_MM_DD } from "../../../../../../shared/utils/utils";
// import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
// import { calculateInterest, getFilteredStatementTransactions, getStatementTotalDays, getStatementTotalDistribution } from "../../../../../../shared/functions/transactions/Statement";
// import { ISwitchTransaction } from "../../../../../../shared/models/SwitchTransactionModel";
// import { getAccountRate } from "../../../../../../shared/functions/MyFunctions";
// import { IStatementTransaction } from "../../../../../../shared/models/StatementTransactionModel";

// interface IProps {
//     moneyMarketAccountId: string;
//     startDate: Date;
//     endDate: Date;
//     switchTransaction: ISwitchTransaction;
// }

// const currentDate = new Date();
// const currentYear = currentDate.getFullYear();
// const currentMonth = currentDate.getMonth();

// const startOfMonth = new Date(currentYear, currentMonth, 1);
// const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

// const ShowClientStatement = (props: IProps) => {

//     const { api, store } = useAppContext();

//     const { moneyMarketAccountId, switchTransaction } = props;
//     const [newStatement, setNewStatement] = useState<IStatementTransaction[]>([])

//     const [loading, setLoading] = useState(false);

//     const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

//     const statementTransactionsAsJson = statementTransactions.map((transaction) => {
//         return transaction.asJson;
//     }
//     );

//     const filteredStatementTransactions = getFilteredStatementTransactions(startOfMonth, endOfMonth, statementTransactionsAsJson)

//     const getNewTransactions = () => {
//         const newTransaction: IStatementTransaction = {
//             id: "",
//             date: Date.parse(dateFormat_YY_MM_DD(switchTransaction.switchDate || Date.now())),
//             transaction: "switchFrom",
//             balance: getAccountBalance(switchTransaction.fromAccount, store),
//             rate: getAccountRate(switchTransaction.fromAccount, store) || 0,
//             remark: `Switch from ${switchTransaction.fromAccount}`,
//             amount: switchTransaction.amount,
//             createdAt: Date.now(),
//             previousBalance: getAccountBalance(switchTransaction.fromAccount, store),
//         };

//         const statementPlusTransaction = [...filteredStatementTransactions]
//         statementPlusTransaction.push(newTransaction);

//         const includeNew = statementPlusTransaction.sort((a, b) => {
//             const dateA = new Date(a.date || 0);
//             const dateB = new Date(b.date || 0);

//             if (dateB.getTime() !== dateA.getTime()) {
//                 return dateA.getTime() - dateB.getTime();
//             } else {
//                 const createdAtA = new Date(a.createdAt || 0);
//                 const createdAtB = new Date(b.createdAt || 0);

//                 return createdAtA.getTime() - createdAtB.getTime();
//             }
//         });

//         const modifiedTransactions = [includeNew[0]];

//         for (let i = 1; i < includeNew.length; i++) {
//             const previousBalance = includeNew[i - 1].balance;
//             const currentTransaction = includeNew[i];
//             currentTransaction.previousBalance = previousBalance;
//             if (currentTransaction.transaction === "deposit" || currentTransaction.transaction === "switchTo") {
//                 currentTransaction.balance = previousBalance + currentTransaction.amount;
//             } else if (currentTransaction.transaction === "withdrawal" || currentTransaction.transaction === "switchFrom") {
//                 currentTransaction.balance = previousBalance - currentTransaction.amount;
//             }
//             modifiedTransactions.push(currentTransaction);
//         }

//         setNewStatement(modifiedTransactions);
//     }

//     const totalDays = getStatementTotalDays(newStatement);
//     const totalDistribution = getStatementTotalDistribution(newStatement);

//     calculateInterest(statementTransactionsAsJson, newStatement);

//     useEffect(() => {
//         const loadStatement = async () => {
//             if (moneyMarketAccountId) {
//                 try {
//                     setLoading(true);
//                     await Promise.all([
//                         store.statementTransaction.removeAll(),
//                         api.statementTransaction.getAll(moneyMarketAccountId),
//                         getNewTransactions()
//                     ]);
//                     setLoading(false);
//                 } catch (error) { }
//             }
//         };

//         loadStatement();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [api.statementTransaction, getNewTransactions, moneyMarketAccountId]);

//     return (
//         <div>
//             <div className="uk-width-expand">
//                 {!loading && newStatement.length > 0 &&
//                     <table className="uk-table uk-table-small kit-table">
//                         <thead>
//                             <tr>
//                                 <th>Date</th>
//                                 <th>Amount</th>
//                                 <th>Previous Balance</th>
//                                 <th>Balance</th>
//                                 <th>Rate</th>
//                                 <th>Days</th>
//                                 <th>Interest</th>
//                                 <th>Remark</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <th></th>
//                                 <th>Opening Balance</th>
//                                 <th>
//                                     {newStatement &&
//                                         (
//                                             newStatement[0]?.balance || 0
//                                         )}
//                                 </th>
//                                 <th></th>
//                                 <th></th>
//                                 <th></th>
//                                 <th></th>
//                                 <th></th>
//                             </tr>
//                             {newStatement &&
//                                 newStatement.map((transaction, index) => (
//                                     <tr className={transaction.blinded ? 'uk-text-danger' : ''} key={transaction.id}>

//                                         <td>{dateFormat_YY_MM_DD(transaction.date)}</td>
//                                         <td>
//                                             {transaction.amount ?
//                                                 transaction.transaction === "withdrawal" ?
//                                                     `-${(transaction.amount)}` :
//                                                     (transaction.amount) :
//                                                 "-"}
//                                         </td>
//                                         <td>{(transaction.previousBalance || 0)}</td>
//                                         <td>{(transaction.balance)}</td>
//                                         <td>{(transaction.rate)}</td>
//                                         <td>{(transaction.days) || "-"}</td>
//                                         <td>{(transaction.distribution || 0) || "-"}</td>
//                                         <td>{transaction.remark}</td>
//                                     </tr>
//                                 ))}
//                             <tr>
//                                 <th></th>
//                                 <th>Closing Balance</th>
//                                 <th>
//                                     {newStatement &&
//                                         (
//                                             newStatement[
//                                                 newStatement.length - 1
//                                             ]?.balance || 0
//                                         )}
//                                 </th>
//                                 <th></th>
//                                 <th>Totals</th>
//                                 <th>{totalDays}</th>
//                                 <th>{(totalDistribution)}</th>
//                                 <th></th>
//                             </tr>
//                         </tbody>
//                     </table>
//                 }
//                 {
//                     loading && <LoadingEllipsis />
//                 }
//             </div>
//         </div>
//     )
// }

// export default ShowClientStatement

import React from 'react'

const ShowClientStatement = () => {
  return (
    <div>
      
    </div>
  )
}

export default ShowClientStatement

