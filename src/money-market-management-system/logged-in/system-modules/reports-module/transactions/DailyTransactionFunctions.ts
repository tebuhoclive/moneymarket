import { dateFormat_YY_MM_DD, dateFormat_YY_MM_DD_NEW } from "../../../../../shared/utils/utils";

interface AggregatedTransaction {
    account: string;
    clientName: string;
    productCode: string;
    totalDeposit: number;
    totalWithdrawal: number;
    totalSwitchFrom: number;
    totalSwitchTo: number;
    transactionDate: number;
    valueDate: number;
}

interface IDailyTransactionReport {
    clientName: string;
    accountNumber: string;
    productCode: string;
    transactionType: string;
    transactionDate: number;
    valueDate: number;
    capturedDate: number;
    transactionAmount: number;
    transactionStatus: string;
}


export function backDatedTransactionFlag(transaction: AggregatedTransaction): boolean {
    const tDate = dateFormat_YY_MM_DD_NEW(transaction.transactionDate);
    const vDate = dateFormat_YY_MM_DD(transaction.valueDate);

    const _parseTDate = Date.parse(tDate);
    const _parseVDate = Date.parse(vDate);

    if (new Date(_parseTDate).getTime() > new Date(_parseVDate).getTime()) {
        return true
    }

    return false;
}



export function flagBackDatedTransaction(transaction: IDailyTransactionReport): boolean {
    const tDate = dateFormat_YY_MM_DD_NEW(transaction.transactionDate);
    const vDate = dateFormat_YY_MM_DD(transaction.valueDate);

    const _parseTDate = Date.parse(tDate);
    const _parseVDate = Date.parse(vDate);

    if (new Date(_parseTDate).getTime() > new Date(_parseVDate).getTime()) {
        return true
    }

    return false;
}

export function flagDeletedTransaction(transaction: IDailyTransactionReport): boolean {

    if (transaction.transactionStatus === "Corrected") {
        return true
    }

    return false;
}
