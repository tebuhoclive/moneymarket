import { dateFormat_YY_MM_DD } from "../utils/utils";
import { removeHyphensFromDate } from "./DateFunctions";
import { generateSpaceFiller, padNumberStringWithZero, padTextStringWithSpace } from "./StringFunctions";

export interface PaymentTransactions {
    transactionSubBatchNumber: string; // 3 char
    transactionReferenceNumber: string;// 10 char
    branchNumber: string;// 6 char
    accountNumber: string;// 13 char
    accountName: string;// 30 char
    amount: number;// 15 digits
    bankReference: string;// 30 char
    paymentAlertDestinationType: string; // 1 char
    paymentAlertDestination: string; // 62 char
    // classOfEntry:number;
    streetName: string; // 35 char
    townName: string; // 35 char
    province: string; // 35 char
    postalCode: string; // 10 char
    countryCode: string; // 2 char
    balanceOfPaymentCodes: string; // 5 char
    balanceOfPaymentCodeEntityType: string; // 1 char
}

export function generateNormalValuePaymentFile(transactions: PaymentTransactions[]): void {
    const lines: string[] = [];

    const today = dateFormat_YY_MM_DD(Date.now());
    const todayWithoutHyphens = removeHyphensFromDate(today);

    const batchDescription = `${todayWithoutHyphens}IJGPayments`

    const headerRecord = `SB${todayWithoutHyphens}${padTextStringWithSpace(batchDescription, 30)}${generateSpaceFiller(103)}`

    lines.push(headerRecord);

    transactions.forEach(transaction => {
        const amount = `${transaction.amount.toFixed(0)}00`
        // const transactionAccountName = transaction.accountName.length > 30 ? splitAndTrimString(' ', transaction.accountName)[0] : transaction.accountName;
        const transactionAccountName = transaction.accountName.length > 30 ? transaction.accountName.substring(0, 31) : transaction.accountName;
        const streetName = transaction.streetName.length > 30 ? transaction.streetName.substring(0, 36) : transaction.accountName;

        const detailRecord = `SD${transaction.transactionSubBatchNumber}${padNumberStringWithZero(transaction.transactionSubBatchNumber, 10)}C${padTextStringWithSpace(transaction.branchNumber, 6)}${padTextStringWithSpace(transaction.accountNumber, 13)}${padTextStringWithSpace(transactionAccountName, 30)}${generateSpaceFiller(16)}${padNumberStringWithZero(amount, 15)}${padTextStringWithSpace(transaction.bankReference, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(13)}${generateSpaceFiller(3)}${padTextStringWithSpace(transaction.paymentAlertDestinationType, 1)}${padTextStringWithSpace(transaction.paymentAlertDestination, 62)}${generateSpaceFiller(2)}${generateSpaceFiller(2)}${padTextStringWithSpace(streetName, 35)}${padTextStringWithSpace(transaction.townName, 35)}${padTextStringWithSpace(transaction.province, 35)}${padTextStringWithSpace(transaction.postalCode, 10)}${padTextStringWithSpace(transaction.countryCode, 2)}${padTextStringWithSpace(transaction.balanceOfPaymentCodes, 5)}${padTextStringWithSpace(transaction.balanceOfPaymentCodeEntityType, 1)}`

        lines.push(detailRecord);
    });

    const subBatchDescription = `IJGSecurities24011810070000000`;
    const contraBranchCode = `087373`;
    const contraAccountNumber = `042739330`;
    const contraAccountName = `IJGSecuritiesMoneyMarketTrust`

    const contraRecord = `SC001${padTextStringWithSpace(subBatchDescription, 30)}D${padTextStringWithSpace(contraBranchCode, 6)}${padTextStringWithSpace(contraAccountNumber, 13)}${padTextStringWithSpace(subBatchDescription, 30)}${padTextStringWithSpace(contraAccountName, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(12)}${generateSpaceFiller(28)}`;

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
    downloadLink.download = `${today} SBN BOL Normal Value Payment File.txt`;

    // Trigger the download
    downloadLink.click();
}

export function generateZarPaymentFile(transactions: PaymentTransactions[]): void {
    const lines: string[] = [];

    const today = dateFormat_YY_MM_DD(Date.now());
    const todayWithoutHyphens = removeHyphensFromDate(today);

    const batchDescription = `${todayWithoutHyphens}IJGPayments`

    const headerRecord = `SB${todayWithoutHyphens}${padTextStringWithSpace(batchDescription, 30)}${generateSpaceFiller(103)}`

    lines.push(headerRecord);

    transactions.forEach(transaction => {

        const amount = `${transaction.amount.toFixed(0)}00`
        // const transactionAccountName = transaction.accountName.length > 30 ? splitAndTrimString(' ', transaction.accountName)[0] : transaction.accountName;

        const transactionAccountName = transaction.accountName.length > 30 ? transaction.accountName.substring(0, 31) : transaction.accountName;
        const streetName = transaction.streetName.length > 30 ? transaction.streetName.substring(0, 36) : transaction.accountName;

        const detailRecord = `SD${transaction.transactionSubBatchNumber}${padNumberStringWithZero(transaction.transactionSubBatchNumber, 10)}C${padTextStringWithSpace(transaction.branchNumber, 6)}${padTextStringWithSpace(transaction.accountNumber, 13)}${padTextStringWithSpace(transactionAccountName, 30)}${generateSpaceFiller(16)}${padNumberStringWithZero(amount, 15)}${padTextStringWithSpace(transaction.bankReference, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(13)}${generateSpaceFiller(3)}${padTextStringWithSpace(transaction.paymentAlertDestinationType, 1)}${padTextStringWithSpace(transaction.paymentAlertDestination, 62)}${generateSpaceFiller(2)}${generateSpaceFiller(2)}${padTextStringWithSpace(streetName, 35)}${padTextStringWithSpace(transaction.townName, 35)}${padTextStringWithSpace(transaction.province, 35)}${padTextStringWithSpace(transaction.postalCode, 10)}ZA${padTextStringWithSpace(transaction.balanceOfPaymentCodes, 5)}${padTextStringWithSpace(transaction.balanceOfPaymentCodeEntityType, 1)}`

        lines.push(detailRecord);
    });

    const subBatchDescription = `IJGSecurities24011810070000000`;
    const contraBranchCode = `087373`;
    const contraAccountNumber = `042739330`;
    const contraAccountName = `IJGSecuritiesMoneyMarketTrust`

    const contraRecord = `SC001${padTextStringWithSpace(subBatchDescription, 30)}D${padTextStringWithSpace(contraBranchCode, 6)}${padTextStringWithSpace(contraAccountNumber, 13)}${padTextStringWithSpace(subBatchDescription, 30)}${padTextStringWithSpace(contraAccountName, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(12)}ZAR${generateSpaceFiller(25)}`;

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
    downloadLink.download = `${today} SBN BOL ZAR Payment File.txt`;

    // Trigger the download
    downloadLink.click();
}

export function generateHighValueBankPaymentFile(transactions: PaymentTransactions[]): void {
    const lines: string[] = [];

    const today = dateFormat_YY_MM_DD(Date.now());
    const todayWithoutHyphens = removeHyphensFromDate(today);

    const batchDescription = `${todayWithoutHyphens}IJGPayments`

    const headerRecord = `SB${todayWithoutHyphens}${padTextStringWithSpace(batchDescription, 30)}${generateSpaceFiller(103)}`

    lines.push(headerRecord);

    transactions.forEach(transaction => {
        const amount = `${transaction.amount.toFixed(0)}00`
        // const transactionAccountName = transaction.accountName.length > 30 ? splitAndTrimString(' ', transaction.accountName)[0] : transaction.accountName;

        const transactionAccountName = transaction.accountName.length > 30 ? transaction.accountName.substring(0, 31) : transaction.accountName;
        const streetName = transaction.streetName.length > 30 ? transaction.streetName.substring(0, 36) : transaction.accountName;

        const detailRecord = `SD${transaction.transactionSubBatchNumber}${padNumberStringWithZero(transaction.transactionSubBatchNumber, 10)}C${padTextStringWithSpace(transaction.branchNumber, 6)}${padTextStringWithSpace(transaction.accountNumber, 13)}${padTextStringWithSpace(transactionAccountName, 30)}${generateSpaceFiller(16)}${padNumberStringWithZero(amount, 15)}${padTextStringWithSpace(transaction.bankReference, 30)}Y${generateSpaceFiller(13)}${generateSpaceFiller(3)}${padTextStringWithSpace(transaction.paymentAlertDestinationType, 1)}${padTextStringWithSpace(transaction.paymentAlertDestination, 62)}${generateSpaceFiller(2)}${generateSpaceFiller(2)}${padTextStringWithSpace(streetName, 35)}${padTextStringWithSpace(transaction.townName, 35)}${padTextStringWithSpace(transaction.province, 35)}${padTextStringWithSpace(transaction.postalCode, 10)}${padTextStringWithSpace(transaction.countryCode, 2)}${padTextStringWithSpace(transaction.balanceOfPaymentCodes, 5)}${padTextStringWithSpace(transaction.balanceOfPaymentCodeEntityType, 1)}`

        lines.push(detailRecord);
    });

    const subBatchDescription = `IJGSecurities24011810070000000`;
    const contraBranchCode = `087373`;
    const contraAccountNumber = `042739330`;
    const contraAccountName = `IJGSecuritiesMoneyMarketTrust`

    const contraRecord = `SC001${padTextStringWithSpace(subBatchDescription, 30)}D${padTextStringWithSpace(contraBranchCode, 6)}${padTextStringWithSpace(contraAccountNumber, 13)}${padTextStringWithSpace(subBatchDescription, 30)}${padTextStringWithSpace(contraAccountName, 30)}${generateSpaceFiller(1)}${generateSpaceFiller(12)}${generateSpaceFiller(28)}`;

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
    downloadLink.download = `${today} SBN BOL High Value Payment File.txt`;

    // Trigger the download
    downloadLink.click();
}

