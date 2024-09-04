export type CSVRow = Array<string | undefined>;


export interface IBankStatementTransaction {
    transactionDate: number | null,
    valueDate: number | null,
    bankReference: string,
    amount: string,
    balance: string,
    statementIdentifier: string;
}

export interface IMatchedTransaction {
    matchedAccount: string;
    transactionDate: number | null;
    valueDate: number | null;
    bankReference: string;
    amount: number;
    balance: string;
    matchType: string;
    statementIdentifier: string;
    isAlreadyUploaded: boolean;
    isIndexed?:boolean;
}

export interface ISuggestedMatchedTransaction {
    matchedAccount: string;
    transactionDate: number | null;
    valueDate: number | null;
    bankReference: string;
    amount: number;
    balance: string;
    matchType: string;
    isAlreadyUploaded: boolean;
    statementIdentifier: string;
    suggestionRemark: string;
    isIndexed?:boolean;
}


export interface IUnMatchedTransaction {
    transactionDate: number | null;
    valueDate: number | null;
    bankReference: string;
    amount: number;
    balance: string;
    matchType?: string;
    statementIdentifier: string;
    isAlreadyUploaded: boolean;
    suggestionRemark: string;
    isIndexed?:boolean;
}

export interface IIndexedTransaction {
    matchedAccount?: string;
    transactionDate: number | null;
    valueDate: number | null;
    bankReference: string;
    amount: number;
    balance: string;
    matchType: string;
    remark: IndexedTransactionRemark;
    statementIdentifier: string;
    isAlreadyUploaded: boolean;
    suggestionRemark: string;
    isIndexed?:boolean
}

type IndexedTransactionRemark = "To be processed" 
| "To be saved on the Transaction Queue" 
| "To be saved on the Non Deposit Queue"

export interface IStandardBankStatement {
    Date: string;
    "Value Date": string;
    "Originator Reference": string;
    "Customer Reference": string;
    "Statement Number": string;
    Description: string;
    Amount: string;
    Balance: string;
    Type: string;

}


export interface INedBankStatement {
    "Transaction Date": string;
    "Value Date": string;
    "Transaction Reference No.": string;
    "Description": string;
    "*VAT Charge Indicator": string;
    Debit: string;
    Credit: string;
    Balance: string;
}

