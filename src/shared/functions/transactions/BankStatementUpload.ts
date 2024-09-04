import Papa from "papaparse";
import AppApi from "../../apis/AppApi";
import { CSVRow, IBankStatementTransaction, IMatchedTransaction, INedBankStatement, IStandardBankStatement, IUnMatchedTransaction } from "../../interfaces/BankStatements";

import AppStore from "../../stores/AppStore";
import { BANK_STATEMENT_CONFIGURATIONS } from "../CONSTANTS";
import { convertDateStringToTimestampMonth, convertDateStringToTimestampSlash } from "../DateToTimestamp";
import { padNumberStringWithZero } from "../StringFunctions";
import { IMoneyMarketAccount } from "../../models/money-market-account/MoneyMarketAccount";
import { ILegalEntity } from "../../models/clients/LegalEntityModel";
import { INaturalPerson } from "../../models/clients/NaturalPersonModel";

export function getAccountOwner(accNumber: string, store: AppStore): string {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);
    if (mmAccount) {
        return mmAccount.asJson.parentEntity;
    } else {
        return "";
    }
}

export function getAccount(accNumber: string, store: AppStore): IMoneyMarketAccount | undefined {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);

    if (mmAccount) {
        return mmAccount.asJson;
    } else {
        return undefined;
    }
}


export function getEntity(entityNumber: string, store: AppStore): ILegalEntity | INaturalPerson | undefined {
    const clients = [
        ...store.client.naturalPerson.all,
        ...store.client.legalEntity.all,
      ];

      
    const client = clients.find((m) => m.asJson.entityId === entityNumber);

    if (client && entityNumber !=="") {
        return client.asJson;
    } else {
        return undefined;
    }
}

export function getAccountType(accNumber: string, store: AppStore): string {
    const mmAccount = store.mma.all.find((m) => m.asJson.accountNumber === accNumber);

    if (mmAccount) {
        return mmAccount.asJson.accountType;
    } else {
        return "";
    }
}

export const bankConfiguration = (bankName: string) => {
    switch (bankName) {
        case "Standard Bank":
            return BANK_STATEMENT_CONFIGURATIONS.STANDARD_BANK;
        case "Ned Bank":
            return BANK_STATEMENT_CONFIGURATIONS.NED_BANK;
        default:
            break;
    }
}

//file upload

interface IFileData {
    accountNumber: string;
    transactionsRaw: CSVRow[];
    transactions: IBankStatementTransaction[];
}

export const convertFileToJson = (bankName: string, file: File, api: AppApi, store: AppStore): Promise<IFileData> => {
    return new Promise((resolve, reject) => {

        let statementData: IFileData = {
            accountNumber: "",
            transactionsRaw: [],
            transactions: []
        };

        Papa.parse(file, {
            complete: (result) => {
                const parsedData: CSVRow[] = result.data as CSVRow[];

                const config = bankConfiguration(bankName);

                if (config) {
                    const _bankName = parsedData[config.bankNameConfig.startRow][config.bankNameConfig.endRow];
                    const _accountNumber = parsedData[config.accountNumberConfig.startRow][config.accountNumberConfig.endRow];

                    if (_bankName === config.bankName) {
                        const closingBalanceIndex = parsedData.findIndex((row) =>
                            row.includes(config.statementEnd)
                        );

                        const statementDataRaw = parsedData.slice(config.statementStart - 1, closingBalanceIndex);
                        const statementDataForProcessing = parsedData.slice(config.statementStart, closingBalanceIndex);

                        switch (bankName) {
                            case "Standard Bank":
                                const standardBankTransactions: IStandardBankStatement[] = statementDataForProcessing.map((data) => {
                                    const [
                                        Date = "",
                                        ValueDate = "",
                                        StatementNumber = "",
                                        Description = "",
                                        Amount = "",
                                        Balance = "",
                                        Type = "",
                                        OriginatorReference = "",
                                        CustomerReference = "",
                                    ] = data;

                                    return {
                                        Date,
                                        "Value Date": ValueDate,
                                        "Statement Number": StatementNumber,
                                        Description,
                                        Amount,
                                        Balance,
                                        Type,
                                        "Originator Reference": OriginatorReference,
                                        "Customer Reference": CustomerReference,
                                    };
                                });

                                const standardBankTransactionsClean: IBankStatementTransaction[] = standardBankTransactions.map((data) => ({
                                    transactionDate: convertDateStringToTimestampSlash(data.Date),
                                    valueDate: convertDateStringToTimestampSlash(data["Value Date"]),
                                    bankReference: data["Originator Reference"].trim(),
                                    amount: data.Amount,
                                    balance: data.Balance,
                                    statementIdentifier: `${(data["Value Date"])}-${data["Originator Reference"].trim()}-${data.Date}-${data.Amount}-${data.Balance}`,
                                }));

                                statementData = {
                                    accountNumber: _accountNumber || "",
                                    transactionsRaw: statementDataRaw,
                                    transactions: standardBankTransactionsClean
                                };


                                break;

                            case "Ned Bank":
                                const nedBankTransactions: INedBankStatement[] = statementDataRaw.map((data) => {
                                    const [
                                        TransactionDate = "",
                                        ValueDate = "",
                                        TransactionReferenceNo = "",
                                        Description = "",
                                        VatChargeIndicator = "",
                                        Debit = "",
                                        Credit = "",
                                        Balance = "",
                                    ] = data;

                                    return {
                                        "Transaction Date": TransactionDate,
                                        "Value Date": ValueDate,
                                        "Transaction Reference No.": TransactionReferenceNo,
                                        Description,
                                        "*VAT Charge Indicator": VatChargeIndicator,
                                        Debit,
                                        Credit,
                                        Balance,
                                    };
                                });


                                const nedTBankTransactionsClean: IBankStatementTransaction[] = nedBankTransactions.map((data) => ({
                                    transactionDate: convertDateStringToTimestampMonth(data["Transaction Date"]) || null,
                                    valueDate: convertDateStringToTimestampMonth(data["Value Date"]),
                                    bankReference: data.Description,
                                    amount: data.Credit,
                                    balance: data.Balance,
                                    statementIdentifier: `${(data["Value Date"])}-${data.Description}-${(data["Transaction Date"])}-${data.Credit}-${data.Balance}`,
                                }));

                                statementData = {
                                    accountNumber: _accountNumber || "",
                                    transactionsRaw: statementDataRaw,
                                    transactions: nedTBankTransactionsClean
                                };
                                break;
                            default:
                                break;
                        }
                        resolve(statementData);
                    } else {
                        reject(new Error(`Invalid file selected for ${bankName}`));
                    }
                } else {
                    reject(new Error('Bank configuration not found'));
                }
            },
            header: false, // Set this to true if the first row contains headers
        });
    });
};

export const matchTransactions = (bankName: string, transactions: IBankStatementTransaction[], store: AppStore) => {
    const accounts = store.mma.all;

    const config = bankConfiguration(bankName);

    const matchedItems: IMatchedTransaction[] = [];
    const unmatchedItems: IUnMatchedTransaction[] = [];

    let counter = 0;

    if (config) {
        transactions.forEach(transaction => {
            const regex = /(?<!\d)0*([1-9]\d{0,3})(?!\d)/;
            const matches = transaction.bankReference.match(regex);

            const capturedNumber = parseInt(matches ? matches[1] : "", 10);
            const searchAccount = `${capturedNumber}`;

            const match = accounts.find(
                (mmaAccount) => mmaAccount.asJson.accountNumber === transaction.bankReference
            );

            const matchSuggestion = accounts.find(
                (mmaAccount) => mmaAccount.asJson.accountNumber === `A${padNumberStringWithZero(searchAccount, 5)}`
            );

            const statementTrackers = store.statementTracker.all;

            const checkIfTransactionIsAlreadyRecorded = (transaction: IBankStatementTransaction) => {
                const result = statementTrackers.some((item) => {

                    return item.asJson.trackerCode === transaction.statementIdentifier;;
                });
                counter++; // Increment the counter each time the function is called
                return result;
            };

            const formattedNumber = transaction.amount;
            const sanitizedValue = formattedNumber.replace(/,/g, "");
            const convertedValue = parseFloat(sanitizedValue);

            if ((match || matchSuggestion) && convertedValue > 0) {
                const _item = {
                    matchedAccount: match ? transaction.bankReference : `A${padNumberStringWithZero(searchAccount, 5)}`,
                    transactionDate: transaction.transactionDate,
                    valueDate: transaction.valueDate,
                    bankReference: transaction.bankReference,
                    amount: convertedValue,
                    balance: transaction.balance,
                    matchType: match ? 'Used Client Reference' : 'System Suggested',
                    statementIdentifier: transaction.statementIdentifier,
                    isAlreadyUploaded: checkIfTransactionIsAlreadyRecorded(transaction)
                };

                matchedItems.push(_item);

            } else if (!match && convertedValue > 0 && transaction.transactionDate) {
                const _item = {
                    transactionDate: transaction.transactionDate,
                    valueDate: transaction.valueDate,
                    bankReference: transaction.bankReference,
                    amount: convertedValue,
                    balance: transaction.balance,
                    statementIdentifier: transaction.statementIdentifier,
                    isAlreadyUploaded: checkIfTransactionIsAlreadyRecorded(transaction),
                    suggestionRemark: ""
                };

                unmatchedItems.push(_item);
            }
        });
        return { matchedItems: matchedItems, unmatchedItems: unmatchedItems, counter: counter };
        // return { matchedItems: matchedItems, unmatchedItems: unmatchedItems };
    }
    return { matchedItems: matchedItems, unmatchedItems: unmatchedItems, counter: counter };
}

