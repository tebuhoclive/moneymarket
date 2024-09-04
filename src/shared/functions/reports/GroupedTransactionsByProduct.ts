import { dateFormat_YY_MM_DD } from "../../utils/utils";
import { numberFormat } from "../Directives";
import AppStore from "../../stores/AppStore";
import { IDepositTransaction } from "../../models/deposit-transaction/DepositTransactionModel";

export interface IDailyTransactionReport {
    clientName: string;
    accountNumber: string;
    productCode: string;
    transactionType: string;
    transactionDate: number;
    valueDate: number;
    capturedDate: number;
    ijgValueDate: number;
    transactionAmount: number;
    transactionStatus: string;
}

interface IEntity {
    entityId: string;
    entityDisplayName: string;
}

interface TransactionsByType {
    [transactionType: string]: IDailyTransactionReport[];
}

const transactions: IDailyTransactionReport[] = [];


export const filterTransactionsByDate = (transactions: IDailyTransactionReport[], date: number): IDailyTransactionReport[] => {
    return transactions.filter(transaction => dateFormat_YY_MM_DD(transaction.ijgValueDate) === dateFormat_YY_MM_DD(date));
};

export const filterArchivedTransactionsByDate = (transactions: IDepositTransaction[]): IDepositTransaction[] => {
    return transactions
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
};

export const getClientName = (store: AppStore, entityId: string) => {
    const clients: IEntity[] = [
        ...store.client.naturalPerson.all.map(client => client.asJson),
        ...store.client.legalEntity.all.map(client => client.asJson)
    ];

    const client = clients.find(client => client.entityId === entityId);
    if (client && entityId !=="") {
        return client.entityDisplayName;
    } else {
        return "Error finding client name"
    }
}

export const getAllDepositTransactions = (store: AppStore, reportDate: number) => {
    const deposits = store.depositTransaction.all.filter((depositTransaction) => {
        return depositTransaction.asJson.transactionStatus === "Completed" || depositTransaction.asJson.transactionStatus === "Corrected"
    }).map((depositTransaction) => depositTransaction.asJson);

    const depositTransactions: IDailyTransactionReport[] = deposits.map(transaction => ({
        accountNumber: transaction.accountNumber || "",
        transactionDate: transaction.transactionDate || 0,
        transactionAmount: transaction.transactionStatus === "Deleted" ? -transaction.amount : transaction.amount || 0,
        productCode: transaction.productCode || "",
        transactionType: "Deposit",
        capturedDate: transaction.transactionDate || 0,
        valueDate: transaction.valueDate || 0,
        ijgValueDate: transaction.valueDate || 0,
        clientName: getClientName(store, transaction.entityNumber),
        transactionStatus: transaction.allocationStatus
    }));

    const filteredDepositTransactions = filterTransactionsByDate(depositTransactions, reportDate).sort((a, b) => {
        const nameA = a.accountNumber;
        const nameB = b.accountNumber;

        return nameA.localeCompare(nameB);
    });

    return filteredDepositTransactions

}


export const getAllWithdrawalTransactions = (store: AppStore, reportDate: number) => {

    const withdrawals = store.withdrawalTransaction.all.filter((withdrawalTransaction) => {
        return (withdrawalTransaction.asJson.transactionStatus === "Completed")
    }).map((withdrawalTransaction) => withdrawalTransaction.asJson);

    const withdrawalTransactions: IDailyTransactionReport[] = withdrawals.map(
        (transaction) => ({
            accountNumber: transaction.accountNumber || "",
            transactionDate: transaction.transactionDate || 0,
            transactionAmount: -transaction.amount || 0,
            productCode: transaction.productCode || "",
            transactionType: transaction.description === "Account Close Out" ? "Close Out" : "Withdrawal",
            capturedDate: transaction.transactionDate || 0,
            valueDate: transaction.valueDate || 0,
            ijgValueDate: transaction.valueDate || 0,
            clientName: getClientName(store, transaction.entityNumber),
            transactionStatus: transaction.allocationStatus,
        })
    );

    const filteredWithdrawalTransactions = filterTransactionsByDate(withdrawalTransactions, reportDate).sort((a, b) => {
        const nameA = a.accountNumber;
        const nameB = b.accountNumber;

        return nameA.localeCompare(nameB);
    });

    return filteredWithdrawalTransactions
}

export const getAllSwitchTransactions = (store: AppStore, reportDate: number) => {
    const switches = store.switch.all.filter((switchTransaction) => {
        return switchTransaction.asJson.switchStatus === "Completed";
    }).map((switchTransaction) => switchTransaction.asJson);

    const switchFromTransactions: IDailyTransactionReport[] = switches.map(transaction => ({
        accountNumber: transaction.fromAccount || "",
        transactionDate: transaction.transactionDate || 0,
        transactionAmount: -transaction.amount || 0,
        productCode: transaction.fromProductCode || "",
        transactionType: "Switche",
        capturedDate: transaction.transactionDate || 0,
        valueDate: transaction.valueDate || 0,
        ijgValueDate: transaction.valueDate || 0,
        clientName: getClientName(store, transaction.toEntityNumber || ""),
        transactionStatus: transaction.switchStatus || ""
    }));

    const switchToTransactions: IDailyTransactionReport[] = switches.map(transaction => ({
        accountNumber: transaction.toAccount || "",
        transactionDate: transaction.transactionDate || 0,
        transactionAmount: transaction.amount || 0,
        productCode: transaction.toProductCode || "",
        transactionType: "Switche",
        capturedDate: transaction.transactionDate || 0,
        valueDate: transaction.valueDate || 0,
        ijgValueDate: transaction.valueDate || 0,
        clientName: getClientName(store, transaction.toEntityNumber || ""),
        transactionStatus: transaction.switchStatus || ""
    }));

    const switchesAll = []

    switchesAll.push(...switchFromTransactions);
    switchesAll.push(...switchToTransactions);

    const filteredSwitchesTransactions = filterTransactionsByDate(switchesAll, reportDate).sort((a, b) => {
        const nameA = a.clientName;
        const nameB = b.clientName;

        return nameA.localeCompare(nameB);
    });

    return filteredSwitchesTransactions;
}

export const getTransactionTotals = (store: AppStore, reportDate: number) => {

    interface ITransactionTotals {
        deposits: number;
        withdrawals: number;
        switches: number;
        net: number;
    }

    const totalDeposits = getAllDepositTransactions(store, reportDate).reduce(
        (sum, amount) => sum + amount.transactionAmount,
        0
    );

    const totalWithdrawals = getAllWithdrawalTransactions(store, reportDate).reduce(
        (sum, amount) => sum + amount.transactionAmount,
        0
    );

    const totalSwitches = getAllSwitchTransactions(store, reportDate).reduce(
        (sum, amount) => sum + amount.transactionAmount,
        0
    );

    const net = totalDeposits - Math.abs(totalWithdrawals);

    const totals: ITransactionTotals = {
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        switches: totalSwitches,
        net: net
    }

    return totals;
}

export const calculateTotal = (transactions: IDailyTransactionReport[], field: keyof IDailyTransactionReport): string => {
    const total = transactions.filter(status => status.transactionStatus !== "Deleted").reduce((total, transaction) => total + Number(transaction[field]), 0);
    return numberFormat(total)
};

export const groupTransactionsByProduct = (store: AppStore, reportDate: number) => {

    const deposits = getAllDepositTransactions(store, reportDate);
    const withdrawals = getAllWithdrawalTransactions(store, reportDate);
    const switches = getAllSwitchTransactions(store, reportDate);

    transactions.push(...deposits)
    transactions.push(...withdrawals)
    transactions.push(...switches)

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

    return groupedTransactions;
}

export const calculateProductTotals = (transactionsByType: TransactionsByType): { [product: string]: number } => {
    const productTotals: { [product: string]: number } = {};

    // Iterate through each transaction type
    Object.values(transactionsByType).forEach((transactions: IDailyTransactionReport[]) => {
        // Iterate through transactions of each type
        const filteredTransactions = transactions.filter(status => status.transactionStatus !== "Deleted");

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

export const getProductTotal = (productCode: string, transactions: IDailyTransactionReport[]): number => {

    // Calculate product totals
    const productTotals: { [productCode: string]: number } = {};

    let total = 0

    const filteredTransactions = transactions.filter(status => status.transactionStatus !== "Deleted")

    filteredTransactions.forEach((transaction: IDailyTransactionReport) => {
        // Check if the product exists in the productTotals object
        if (!productTotals.hasOwnProperty(transaction.productCode)) {
            // If the product doesn't exist, initialize it with the transaction amount
            total = productTotals[productCode] = transaction.transactionAmount;
            return total
        } else {
            // If the product exists, add the transaction amount to its total

            total = productTotals[productCode] += transaction.transactionAmount;
            return total
        }
    });
    return total;
}
