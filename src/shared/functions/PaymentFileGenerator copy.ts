// TestTXTPaymentFile.ts

import { dateFormat_YY_MM_DD } from "../utils/utils";
import { removeHyphensFromDate } from "./DateFunctions";
import { generateSpaceFiller, padNumberStringWithZero, padTextStringWithSpace, splitAndTrimString } from "./StringFunctions";

export interface PaymentTransactions {
    transactionSubBatchNumber: string;
    transactionReferenceNumber: string;
    branchNumber: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    bankReference: string;
    paymentAlertDestinationType: string;
    paymentAlertDestination: string;
}

export function generateNormalValuePaymentFile(transactions: PaymentTransactions[]): void {
    const lines: string[] = [];

    const today = dateFormat_YY_MM_DD(Date.now());
    const todayWithoutHyphens = removeHyphensFromDate(today);

    const batchDescription = `${todayWithoutHyphens}IJGPayments`

    const headerRecord = `SB${todayWithoutHyphens}${padTextStringWithSpace(batchDescription,30)}${generateSpaceFiller(103)}`

    lines.push(headerRecord);

    transactions.forEach(transaction => {
        const amount = `${transaction.amount.toFixed(0)}00`
        const transactionAccountName = transaction.accountName.length > 30 ? splitAndTrimString(' ',transaction.accountName)[0] : transaction.accountName;

        const detailRecord = `SD${transaction.transactionSubBatchNumber}${padNumberStringWithZero(transaction.transactionSubBatchNumber, 10)}C${padTextStringWithSpace(transaction.branchNumber,6)}${padTextStringWithSpace(transaction.accountNumber,13)}${padTextStringWithSpace(transactionAccountName,30)}${generateSpaceFiller(16)}${padNumberStringWithZero(amount, 15)}${padTextStringWithSpace(transaction.bankReference, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(13)}${generateSpaceFiller(3)}${padTextStringWithSpace(transaction.paymentAlertDestinationType, 1)}${padTextStringWithSpace(transaction.paymentAlertDestination, 62)}${generateSpaceFiller(2)}${generateSpaceFiller(2)}`

        lines.push(detailRecord);
    });

    const subBatchDescription = `IJGSecurities24011810070000000`;
    const contraBranchCode = `087373`;
    const contraAccountNumber = `042739330`;
    const contraAccountName = `IJGSecuritiesMoneyMarketTrust`

    const contraRecord = `SC001${padTextStringWithSpace(subBatchDescription, 30)}D${padTextStringWithSpace(contraBranchCode, 6)}${padTextStringWithSpace(contraAccountNumber, 13)}${padTextStringWithSpace(subBatchDescription, 30)}${padTextStringWithSpace(contraAccountName,30)}${generateSpaceFiller(1)}${generateSpaceFiller(12)}${generateSpaceFiller(28)}`;

    lines.push(contraRecord);

    const totalTransactions = transactions.length;
    const totalTransactionsAmount = transactions.reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const totalTransactionAmountConverted = `${totalTransactionsAmount.toFixed(0)}00`;

    const trailerRecord = `ST0000001${padNumberStringWithZero(totalTransactions.toString(), 7)}001${padNumberStringWithZero(totalTransactionAmountConverted, 15)}${padNumberStringWithZero(totalTransactionAmountConverted, 15)}${generateSpaceFiller(94)}`;


    lines.push(trailerRecord);

    // Create a Blob containing the text
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${today} SBN BOL Payment File.txt`;

    // Trigger the download
    downloadLink.click();
}


export function generateHighValueBankPaymentFile(transactions: PaymentTransactions[]): void {
    const lines: string[] = [];

    const today = dateFormat_YY_MM_DD(Date.now());
    const todayWithoutHyphens = removeHyphensFromDate(today);

    const batchDescription = `${todayWithoutHyphens}IJGPayments`

    const headerRecord = `SB${todayWithoutHyphens}${padTextStringWithSpace(batchDescription,30)}${generateSpaceFiller(103)}`

    lines.push(headerRecord);

    transactions.forEach(transaction => {
        const amount = `${transaction.amount.toFixed(0)}00`
        const transactionAccountName = transaction.accountName.length > 30 ? splitAndTrimString(' ',transaction.accountName)[0] : transaction.accountName;

        const detailRecord = `SD${transaction.transactionSubBatchNumber}${padNumberStringWithZero(transaction.transactionSubBatchNumber, 10)}C${padTextStringWithSpace(transaction.branchNumber,6)}${padTextStringWithSpace(transaction.accountNumber,13)}${padTextStringWithSpace(transactionAccountName,30)}${generateSpaceFiller(16)}${padNumberStringWithZero(amount, 15)}${padTextStringWithSpace(transaction.bankReference, 30)}Y${generateSpaceFiller(13)}${generateSpaceFiller(3)}${padTextStringWithSpace(transaction.paymentAlertDestinationType, 1)}${padTextStringWithSpace(transaction.paymentAlertDestination, 62)}${generateSpaceFiller(2)}${generateSpaceFiller(2)}`

        lines.push(detailRecord);
    });

    const subBatchDescription = `IJGSecurities24011810070000000`;
    const contraBranchCode = `087373`;
    const contraAccountNumber = `042739330`;
    const contraAccountName = `IJGSecuritiesMoneyMarketTrust`

    const contraRecord = `SC001${padTextStringWithSpace(subBatchDescription, 30)}D${padTextStringWithSpace(contraBranchCode, 6)}${padTextStringWithSpace(contraAccountNumber, 13)}${padTextStringWithSpace(subBatchDescription, 30)}${padTextStringWithSpace(contraAccountName,30)}${generateSpaceFiller(1)}${generateSpaceFiller(12)}${generateSpaceFiller(28)}`;

    lines.push(contraRecord);

    const totalTransactions = transactions.length;
    const totalTransactionsAmount = transactions.reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const totalTransactionAmountConverted = `${totalTransactionsAmount.toFixed(0)}00`;

    const trailerRecord = `ST0000001${padNumberStringWithZero(totalTransactions.toString(), 7)}001${padNumberStringWithZero(totalTransactionAmountConverted, 15)}${padNumberStringWithZero(totalTransactionAmountConverted, 15)}${generateSpaceFiller(94)}`;


    lines.push(trailerRecord);

    // Create a Blob containing the text
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${today} SBN BOL Payment File.txt`;

    // Trigger the download
    downloadLink.click();
}

