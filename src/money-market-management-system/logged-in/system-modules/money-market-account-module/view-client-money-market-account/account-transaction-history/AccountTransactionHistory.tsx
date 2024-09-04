// import React, { useEffect, useState } from 'react'
// import { useAppContext } from '../../../../../../shared/functions/Context';
// import Toolbar from '../../../../shared/components/toolbar/Toolbar';
// import MoneyMarketAccountModel from '../../../../../../shared/models/money-market-account/MoneyMarketAccount';
// import { observer } from 'mobx-react-lite';
// import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from '../../../../../../shared/utils/utils';
// import { getEntityId } from '../../../../../../shared/functions/MyFunctions';
// import { AccountTransactionHistoryGrid } from './AccountTransactionHistoryGrid';

import MoneyMarketAccountModel from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";

export interface ICombinedTransaction {
    id: string;
    entityId: string;
    valueDate: string;
    transactionDate: string;
    transaction: string;
    amount: number;
    runningBalance: number;
    sortTime: string;
    pBalance: number;
}

// interface IProps{
//     account: MoneyMarketAccountModel;
// }

// const AccountTransactionHistory = observer((props: IProps) => {
//     const { api, store } = useAppContext();
//     const [loading, setLoading] = useState(false);

//     const {account} = props;

//     const combinedData: ICombinedTransaction[] = [];

//     const deposits = store.depositTransaction.all;
//     const withdrawals = store.withdrawalTransaction.all;
//     const switchTransactions = store.switch.all;
//     const cancelledTransaction = store.cancelledWithdrawal.all.filter(
//         (transaction) =>
//             transaction.asJson.allocation === account.asJson.accountNumber &&
//             transaction.asJson.transactionStatus === "Approved"
//     );

//     const accountDeposits = deposits.filter((transaction) =>
//         transaction.asJson.allocation === account.asJson.accountNumber &&
//         transaction.asJson.allocationStatus === "Completed"
//     ).map((transaction) => transaction.asJson);

//     const accountWithdrawals = withdrawals.filter((transaction) =>
//         transaction.asJson.allocation === account.asJson.accountNumber &&
//         transaction.asJson.transactionStatus === "Approved"
//     ).map((transaction) => transaction.asJson);

//     const accountSwitchesFrom = switchTransactions.filter((transaction) =>
//         transaction.asJson.fromAccount === account.asJson.accountNumber
//     ).map((transaction) => transaction.asJson);

//     const accountSwitchesTo = switchTransactions.filter((transaction) =>
//         transaction.asJson.toAccount === account.asJson.accountNumber
//     ).map((transaction) => transaction.asJson);

//     accountDeposits.forEach((transaction) => {
//         combinedData.push({
//             id: transaction.id,
//             entityId: transaction.entity,
//             valueDate: dateFormat_YY_MM_DD_NEW(transaction.transactionDate),
//             transactionDate: dateFormat_YY_MM_DD_NEW(transaction.transactionDate),
//             transaction: "Deposit",
//             amount: transaction.amount,
//             runningBalance: transaction.amount,
//             sortTime: new Date(transaction.executionTime || 0).toUTCString(),
//             pBalance: transaction?.previousBalance || 0,
//         });
//     });

//     accountWithdrawals.forEach((transaction) => {
//         combinedData.push({
//             id: transaction.id,
//             entityId: transaction.entity,
//             valueDate: dateFormat_YY_MM_DD_NEW(transaction.transactionDate),
//             transactionDate: dateFormat_YY_MM_DD_NEW(transaction.transactionDate),
//             transaction: "Withdrawal",
//             amount: transaction.amount,
//             runningBalance: transaction.amount,
//             sortTime: new Date(transaction.executionTime || 0).toUTCString(),
//             pBalance: transaction?.previousBalance || 0,
//         });
//     });

//     accountSwitchesFrom.forEach((transaction) => {
//         combinedData.push({
//             id: transaction.id,
//             entityId: getEntityId(store, transaction.fromAccount),
//             valueDate: dateFormat_YY_MM_DD(transaction.switchDate) || "",
//             transactionDate: dateFormat_YY_MM_DD(transaction.switchDate) || "",
//             transaction: `Switch To (${transaction.toAccount})`,
//             amount: transaction.amount,
//             runningBalance: transaction.amount,
//             sortTime: new Date(transaction.executionTime || 0).toUTCString(),
//             pBalance: transaction?.toPBalance || 0,
//         });
//     });

//     accountSwitchesTo.forEach((transaction) => {
//         combinedData.push({
//             id: transaction.id,
//             entityId: getEntityId(store, transaction.toAccount),
//             valueDate: dateFormat_YY_MM_DD(transaction.switchDate) || "",
//             transactionDate: dateFormat_YY_MM_DD(transaction.switchDate) || "",
//             transaction: `Switch From (${transaction.fromAccount})`,
//             amount: transaction.amount,
//             runningBalance: transaction.amount,
//             sortTime: new Date(transaction.executionTime || 0).toUTCString(),
//             pBalance: transaction?.fromPBalance || 0,
//         });
//     });

//     cancelledTransaction.forEach((transaction) => {
//         combinedData.push({
//             id: transaction.asJson.id,
//             entityId: getEntityId(store, transaction.asJson.entity),
//             valueDate: dateFormat_YY_MM_DD(transaction.asJson.transactionDate) || "",
//             transactionDate:
//                 dateFormat_YY_MM_DD(transaction.asJson.transactionDate) || "",
//             transaction: `Cancelled`,
//             amount: transaction.asJson.amount,
//             runningBalance: transaction.asJson.amount,
//             sortTime: new Date(transaction.asJson.executionTime || 0).toUTCString(),
//             pBalance: transaction?.asJson.previousBalance || 0,
//         });
//     });

//     const customSort = (a: ICombinedTransaction, b: ICombinedTransaction): number => {
//         const dateA = new Date(a.sortTime);
//         const dateB = new Date(b.sortTime);

//         if (dateA > dateB) {
//             return 1;
//         } else if (dateA < dateB) {
//             return -1;
//         } else {
//             return 0;
//         }
//     };

//     const sortedData = combinedData.sort(customSort);

//     useEffect(() => {
//         const loadAll = async () => {
//             try {
//                 setLoading(true);
//                 await Promise.all([
//                     api.depositTransaction.getAll(),
//                     api.withdrawalTransaction.getAll(),
//                     api.switch.getAll()
//                 ]);
//                 setLoading(false);
//             } catch (error) { }
//         };
//         loadAll();
//     }, [api.depositTransaction, api.withdrawalTransaction, api.switch]);
//     return (
//         <div>
//             <Toolbar leftControls={<h4 className="main-title-md">Transaction</h4>} />
//             <hr className="uk-margin-top-remove" />
//             <AccountTransactionHistoryGrid loading={loading} balance={account.asJson.balance} data={sortedData} />
//         </div>
//     )
// })

// export default AccountTransactionHistory

interface IProps{
    account: MoneyMarketAccountModel;
}
const AccountTransactionHistory = (props:IProps) => {
  return (
    <div>

    </div>
  )
}

export default AccountTransactionHistory

