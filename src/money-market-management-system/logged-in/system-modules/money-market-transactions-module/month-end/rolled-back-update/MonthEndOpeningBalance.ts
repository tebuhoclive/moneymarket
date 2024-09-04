import AppApi from "../../../../../../shared/apis/AppApi";
import { IMoneyMarketAccount } from "../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import AppStore from "../../../../../../shared/stores/AppStore";

const calculateDays = (transactionDate: number, nextTransactionDate?: number, monthEnd?: number): number => {
    const currentDate = new Date();
    const transactionDateTime = new Date(transactionDate);

    if (nextTransactionDate) {
        const nextTransactionDateTime = new Date(nextTransactionDate);
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        return Math.ceil((nextTransactionDateTime.getTime() - transactionDateTime.getTime()) / millisecondsPerDay) - 1; // Add 1 to include both start and end dates
    } else if (monthEnd) {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const remainingDays = Math.ceil((monthEnd - transactionDateTime.getTime()) / millisecondsPerDay) + 1; // Add 1 to include both start and end dates
        return remainingDays;
    } else {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        return Math.ceil((currentDate.getTime() - transactionDateTime.getTime()) / millisecondsPerDay) - 1; // Add 1 to include both start and end dates
    }
};

export async function updateInterestAccruedAndTotalDays(accounts: IMoneyMarketAccount[], store: AppStore, api: AppApi, startDate: Date, endDate: Date, setLoader: (loading: boolean) => void, monthEndDate: number) {
    setLoader(true);
    let completedCount = 0; // Initialize completed count

    try {
        for (const account of accounts) {
            try {
                await api.statementTransaction.getAll(account.id);
            } catch (error) {
            }
            const transactionStatements = store.statementTransaction.all;
            const statementTransactionsAsJson = transactionStatements.map(transaction => { return transaction.asJson });

            const filteredStatementTransactions = statementTransactionsAsJson.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            }).sort((b, a) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB.getTime() - dateA.getTime();
            });

            filteredStatementTransactions.forEach((transaction, index) => {
                transaction.days = index === filteredStatementTransactions.length - 1 ?
                    calculateDays(transaction.date, undefined, monthEndDate) :
                    calculateDays(transaction.date, filteredStatementTransactions[index + 1].date, undefined);
                transaction.distribution = Number((transaction.balance * transaction.rate / 100 * (transaction.days ? transaction.days / 365 : 0 / 365)).toFixed(2));
            });

            const totalDays = filteredStatementTransactions.reduce((acc, curr) => acc + (curr.days || 0), 0);
            const totalDistribution = filteredStatementTransactions.reduce((acc, curr) => acc + (curr.distribution || 0), 0);

            await api.mma.updateDaysAndInterest(account.id, totalDays, totalDistribution);
            completedCount++; // Increment completed count

            const progress = ((completedCount / accounts.length) * 100).toFixed(2); // Calculate progress percentage
        }
    } catch (error) {
        console.log("Error: ", error);
    } finally {
        setLoader(false);
    }
}
