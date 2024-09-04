import MODAL_NAMES from "../../money-market-management-system/logged-in/dialogs/ModalName";
import { ISwitchTransaction } from "../models/SwitchTransactionModel";
import { IWithdrawalTransaction } from "../models/withdrawal-transaction/WithdrawalTransactionModel";
import { IHashCode } from "../models/hash-codes/HashCodeModel";
import AppStore from "../stores/AppStore";
import showModalFromId, { hideModalFromId } from "./ModalShow";
import AppApi from "../apis/AppApi";
import { IMoneyMarketAccount } from "../models/money-market-account/MoneyMarketAccount";
import { IWithdrawalPaymentBatch } from "../models/batches/BatchesModel";
import { INaturalPerson } from "../models/clients/NaturalPersonModel";
import { ILegalEntity } from "../models/clients/LegalEntityModel";
import { IDailyStatement } from "../models/Statement";
import { IStatementTransaction } from "../models/StatementTransactionModel";
import { numberCurrencyFormat, roundOff } from "./Directives";
import { IDepositTransaction } from "../models/deposit-transaction/DepositTransactionModel";

export const getBase64ImageFromURL = (url: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = url;
  });
};

export const formatDate = (inputCode: string): string => {
  // Check if the input code starts with "GT"
  if (!inputCode.startsWith("GT")) {
    return "Invalid input code. It should start with 'GT'.";
  }

  // Extract the relevant parts from the input code
  const [, daysToMaturity, settlementDateStr, maturityDateStr] =
    inputCode.match(
      /^GT(\d+)(\/\d{2}[A-Za-z]{3}\d{2})-(\d{2}[A-Za-z]{3}\d{2})$/
    ) || [];

  if (!daysToMaturity || !settlementDateStr || !maturityDateStr) {
    return "Invalid input code.";
  }

  // Parse the days to maturity as a number
  const daysToMaturityNum = parseInt(daysToMaturity, 10);

  // Parse the settlement and maturity dates using the 'Date' object

  const maturityDate = new Date(maturityDateStr);

  // Add the days to maturity to the maturity date
  maturityDate.setDate(maturityDate.getDate() + daysToMaturityNum);

  // Custom date formatting function
  const formatDateToString = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}${month}${year}`;
  };

  // Format the dates to match the desired output format
  const formattedMaturityDate = formatDateToString(maturityDate);

  // Combine the parts to create the final output
  const outputCode = `GT${daysToMaturity}/${maturityDateStr}-${formattedMaturityDate}`;

  return outputCode;
};

export const calculateFileHash = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export function cannotSaveStatement(
  hashCodes: IHashCode[],
  fileHash: string | null
): boolean {
  const findHash = hashCodes.find((h) => h.hashCode === fileHash);
  if (findHash) {
    return false;
  } else {
    return true;
  }
}

export const canVerify = (transactionId: string, store: AppStore) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );
  if (selectedTransaction) {
    if (store.depositTransaction.getItemById(transactionId)) {
      if (selectedTransaction.asJson.transactionStatus === "Draft") {
        return true;
      }
    }
  } else {
    return false;
  }
};

export const onEditTransaction = (transactionId: string, store: AppStore) => {
  const selectedTransaction = store.depositTransaction.getItemById(
    transactionId
  );

  if (selectedTransaction) {
    store.depositTransaction.select(selectedTransaction.asJson);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
  } else {
  }
};


export function getMMA(accNumber: string, store: AppStore): string {
  const mmAccount = store.mma.all.find(
    (m) => m.asJson.accountNumber === accNumber
  )?.asJson.parentEntity;
  if (mmAccount) {
    return mmAccount;
  } else {
    return "";
  }
}

export function getMMAProduct(accNumber: string, store: AppStore): string {
  const mmAccount = store.mma.all.find(
    (m) => m.asJson.accountNumber === accNumber
  )?.asJson.accountType;

  if (mmAccount) {
    return mmAccount;
  } else {
    return "";
  }
}

export function getClientRate(accNumber: string, store: AppStore): number {
  const mmAccount =
    store.mma.all.find((m) => m.asJson.accountNumber === accNumber)?.asJson
      .clientRate || 0;

  if (mmAccount) {
    return mmAccount;
  } else {
    return 0;
  }
}

export function getNaturalPersonsName(
  entityId: string,
  store: AppStore
): string {
  const naturalPersons = store.client.naturalPerson.all.map((n) => {
    return n.asJson;
  });
  const legalEntities = store.client.legalEntity.all.map((n) => {
    return n.asJson;
  });

  const combinedArray = [...naturalPersons, ...legalEntities];

  const personName = combinedArray.find((p) => p.entityId === entityId)
    ?.entityDisplayName;
  if (personName) {
    return personName;
  } else {
    return "N/A";
  }
}
export const getClientName = (transaction: | IWithdrawalTransaction, store: AppStore) => {
  const mmAccounts = store.mma.all;

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === transaction.accountNumber
  );

  if (account) {
    const client = clients.find(
      (client) => client.asJson.entityId === account.asJson.parentEntity
    );
    if (client) {
      const clientName = client.asJson.entityDisplayName;
      return clientName;
    }
  } else {
    return "";
  }
};
export const getClientFromName = (transaction: ISwitchTransaction, store: AppStore) => {
  const mmAccounts = store.mma.all;

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === transaction.fromAccount
  );

  if (account) {
    const client = clients.find(
      (client) => client.asJson.entityId === account.asJson.parentEntity
    );
    if (client) {
      const clientName = client.asJson.entityDisplayName;
      return clientName;
    }
  } else {
    return "";
  }
};
export const getClientToName = (transaction: ISwitchTransaction, store: AppStore) => {
  const mmAccounts = store.mma.all;

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === transaction.toAccount
  );

  if (account) {
    const client = clients.find(
      (client) => client.asJson.entityId === account.asJson.parentEntity
    );
    if (client) {
      const clientName = client.asJson.entityDisplayName;
      return clientName;
    }
  } else {
    return "";
  }
};
export const getClientEmail = (transaction: | IWithdrawalTransaction, store: AppStore) => {
  const mmAccounts = store.mma.all;

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === transaction.accountNumber
  );

  if (account) {
    const client = clients.find(
      (client) => client.asJson.entityId === account.asJson.parentEntity
    );
    if (client) {
      const clientName = client.asJson.contactDetail.emailAddress;
      return clientName;
    }
  } else {
    return "";
  }
};
export function getPersonNameMMA(
  entityId: string,
  store: AppStore
): string | undefined {
  const person = store.client.naturalPerson.all.find(
    (p) => p.asJson.entityId === entityId
  )?.asJson.clientName;
  if (person) {
    return person;
  }
  return "";
}
export function getAccountType(
  id: string,
  store: AppStore
): string | undefined {
  const account = store.product.all.find((a) => a.asJson.id === id)?.asJson
    .productCode;
  if (account) {
    return account;
  }
  return "";
}

export const getAccountId = (accountId: string, store: AppStore) => {
  const mmAccounts = store.mma.all;
  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === accountId
  );
  if (account) {
    const entityId = account.asJson.id;
    return entityId;
  } else {
    return "";
  }
};

export const getAccountNumber = (accountId: string, store: AppStore) => {
  const mmAccounts = store.mma.all;
  const account = mmAccounts.find((account) => account.asJson.id === accountId);
  if (account) {
    const $number = account.asJson.accountNumber;
    return $number;
  } else {
    return "";
  }
};

export const getAccountRate = (accountId: string, store: AppStore) => {
  const mmAccounts = store.mma.all;
  const account = mmAccounts.find(
    (account) => account.asJson.accountNumber === accountId
  );
  if (account) {
    const entityId = account.asJson.clientRate;
    return entityId;
  } else {
    return 0;
  }
};

export const getAccountTypeWithAccountNumber = (
  accountNumber: string,
  store: AppStore
): string | undefined => {
  const account = store.mma.all.find(
    (a) => a.asJson.accountNumber === accountNumber
  );
  if (account) {
    const accountType = account.asJson.accountType;
    return accountType;
  }
  return "";
};



export function getEntityId(store: AppStore, fromAccount: string): string {
  const entityId = store.mma.all.find(
    (m) => m.asJson.accountNumber === fromAccount
  )?.asJson.parentEntity;
  console.log("account number: ", fromAccount);
  console.log("entity number: ", entityId);

  if (entityId) {
    return entityId;
  } else {
    return "-";
  }
}

export function getAllocatedBy(uid: string, store: AppStore): string {
  const user = store.user.all.find((u) => u.asJson.uid === uid)?.asJson
    .displayName;
  if (user) {
    return user;
  } else {
    return "";
  }
}

export function getClientNameSwitch(
  transaction: ISwitchTransaction,
  store: AppStore
) {
  // Get all MM accounts and clients
  const mmAccounts = store.mma.all;
  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  // Find the account based on the transaction details
  const account = mmAccounts.find(
    (account) =>
      account.asJson.accountNumber === transaction.fromAccount ||
      account.asJson.accountNumber === transaction.toAccount
  );

  if (account) {
    // Find the client based on the parent entity of the account
    const client = clients.find(
      (client) => client.asJson.entityId === account.asJson.parentEntity
    );

    if (client) {
      // Return the client's display name
      const clientName = client.asJson.entityDisplayName;
      return clientName;
    }
  }

  // Return an empty string if no matching account or client is found
  return "";
}

export const onViewAccount = (accountId: string, store: AppStore) => {
  const selectedAccount = store.mma.getItemById(accountId);

  if (selectedAccount) {
    store.mma.select(selectedAccount.asJson);
    showModalFromId(MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL);
  }
};

export function getTimeAllocated(timeAllocated: string): boolean {
  if (!timeAllocated) {
    return false;
  }
  const currentDate = Date.now();
  const allocatedTime = new Date(timeAllocated).getTime(); // Convert timeAllocated to milliseconds
  const isTimeExceeded = currentDate - allocatedTime > 30000; // 30000 milliseconds = 30 seconds
  return !isTimeExceeded;
}

//check deposit or withdraw for excel file

export function getTransactionType(type: string): string {
  switch (type) {
    case "AC":
    case "AE":
      return "Deposit";
    case "RW":
    case "MA":
      return "Withdrawal";
    default:
      throw new Error(`Unsupported transaction type: ${type}`);
  }
}

export function getDateTimestamp(dateStr: string) {
  const dateArr = dateStr.split(/\/|\s|:/);
  const dateObj = new Date(
    Date.UTC(
      +dateArr[2],
      +dateArr[1] - 1,
      +dateArr[0],
      +dateArr[3] || 0,
      +dateArr[4] || 0,
      +dateArr[5] || 0
    )
  );
  const timestamp = dateObj.getTime() / 1000;
  return timestamp;
}

export function excelDateToMilliseconds(excelDate: number) {
  // Excel epoch starts from January 1, 1900
  var excelEpoch = new Date("1900-01-01T00:00:00Z").getTime();

  // Convert days to milliseconds
  var millisecondsPerDay = 24 * 60 * 60 * 1000;

  // Convert Excel date to milliseconds
  var milliseconds = (excelDate - 1) * millisecondsPerDay + excelEpoch;

  return milliseconds;
}

//
export function getClientBalance(
  store: AppStore,
  accountNumber: string
): number {
  const currentBalance = store.mma.all.find(
    (acc) => acc.asJson.accountNumber === accountNumber
  )?.asJson.balance;

  if (currentBalance) {
    return currentBalance;
  }
  return 0;
}


export function getMMADocId(
  accountNumber: string | undefined,
  store: AppStore
): string | undefined {
  const mmaDocId = store.mma.all.find(
    (m) => m.asJson.accountNumber === accountNumber
  )?.asJson.id;
  // alert(mmaDocId);

  if (mmaDocId) {
    return mmaDocId;
  } else {
    return;
  }
}

export function findLatestAccount(accounts: IMoneyMarketAccount[]) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    // Handle cases where the input is not an array or is an empty array
    return null;
  }

  return accounts.reduce((latest, account) => {
    const currentNumber = parseInt(account.accountNumber.replace("A", ""), 10);
    const latestNumber = parseInt(latest.accountNumber.replace("A", ""), 10);

    return currentNumber > latestNumber ? account : latest;
  }, accounts[0]);
}

// //update closing money market accouunt status to pending
// export async function updateMMAClosingStatus(
//   accountNumber: string,
//   store: AppStore,
//   api: AppApi
// ) {
//   const mmaAccount = store.mma.all.find(
//     (mma) => mma.asJson.accountNumber === accountNumber
//   )?.asJson;
//   if (mmaAccount) {
//     try {
//       await api.mma.updateBalanceStatus(mmaAccount, "Pending");
//     } catch (error) { }
//   }
// }

export async function updateRecurringStatus(
  accountNumber: string,
  store: AppStore,
  api: AppApi
) {
  const recurringWithdrawal = store.recurringWithdrawalInstruction.all.find(
    (mma) => mma.asJson.allocation === accountNumber
  )?.asJson;
  if (recurringWithdrawal) {
    try {
      await api.recurringWithdrawalInstruction.updateRecurringWithdrawalStatus(
        recurringWithdrawal,
        "Pending"
      );
    } catch (error) { }
  }
}

export async function updateCloseOutStatus(
  id: string,
  store: AppStore,
  api: AppApi
) {
  const closeOut = store.closeOutStore.all.find(
    (account) => account.asJson.id === id
  )?.asJson;
  if (closeOut) {
    try {
      await api.closeOutApi.updateStatus(closeOut);
    } catch (error) { }
  }
}

// export async function updateMMAClosingStatusClose(
//   accountNumber: string,
//   store: AppStore,
//   api: AppApi
// ) {
//   const mmaAccount = store.mma.all.find(
//     (mma) => mma.asJson.accountNumber === accountNumber
//   )?.asJson;
//   if (mmaAccount) {
//     try {
//       if (mmaAccount.status === "Pending") {
//         await api.mma.updateBalanceStatus(mmaAccount, "Closed");
//       }
//     } catch (error) { }
//   }
// }

export function generateNextAccountNumber(
  currentAccountNumber: string
): string {
  const prefix = currentAccountNumber.charAt(0);
  const currentNumber = parseInt(currentAccountNumber.substring(1));
  const nextNumber = currentNumber + 1;
  // Assuming you want the account number to have a fixed width of 6 digits
  const nextAccountNumber = `${prefix}${nextNumber
    .toString()
    .padStart(6, "0")}`;
  return nextAccountNumber;
}

export function generateBatchFileReference(): string {
  const getRandomDigits = (length: number): string => {
    const randomDigits = Math.floor(
      Math.random() * Math.pow(10, length)
    ).toString();
    return randomDigits.padStart(length, "0");
  };
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 as months are zero-indexed
  const day = currentDate.getDate().toString().padStart(2, "0");

  const reference = `BA${getRandomDigits(9)}-${year}-${month}-${day}`;
  return reference;
}

// export async function cancelWithdrawalTransaction(
//   store: AppStore,
//   api: AppApi,
//   stage: string,
//   transactionId: string,
//   comment: string
// ) {
//   const transaction = store.withdrawalTransaction.all.find(
//     (t) => t.asJson.id === transactionId
//   )?.asJson as IWithdrawalTransaction;

//   //create cancelled transaction
//   const cancelledTransaction: ICancelledWithdrawalTransaction = {
//     id: "",
//     amount: transaction?.amount || 0,
//     reference: transaction?.reference || "",
//     transactionDate: transaction?.transactionDate || 0,
//     valueDate: transaction?.valueDate || 0,
//     entity: transaction?.entity || "",
//     allocation: transaction?.allocation || "",
//     allocationStatus: transaction?.allocationStatus || "Pending",
//     transactionStatus: transaction?.transactionStatus || "Pending",
//     bank: transaction?.bank || "",
//     instruction: transaction?.instruction || "",
//     reasonForNoInstruction: transaction?.reasonForNoInstruction || "",
//     isRecurring: false,
//     timeCreated: transaction?.timeCreated || "",
//     timeVerified: transaction?.timeVerified || "",
//     timeAuthorized: transaction?.timeAuthorized || "",
//     timeProcessPayment: transaction?.timeProcessPayment || "",
//     executionTime: transaction?.executionTime || "",
//     previousBalance: transaction?.previousBalance || 0,
//     batchStatus: false,
//     stageCancelledFrom: stage,
//     cancellationComment: comment,
//   };

//   try {
//     await api.cancelledWithdrawals.create(cancelledTransaction);
//   } catch (error) {
//     console.log(error);
//   }

//   //update account balance
//   const accountId = store.mma.all.find(
//     (m) => m.asJson.accountNumber === transaction?.accountNumber
//   )?.asJson.id;

//   try {
//     await api.mma.reverseBalanceUpdate(
//       accountId || "",
//       transaction?.amount || 0
//     );
//   } catch (error) { }

//   // delete record from transaction
//   try {
//     await api.withdrawalTransaction.delete(transaction);
//   } catch (error) { }
// }

export async function batchTransactionRevert(
  api: AppApi,
  store: AppStore,
  transactionId: string,
  batch: IWithdrawalPaymentBatch,
  transactions: IWithdrawalTransaction[]
) {
  const transaction = store.withdrawalTransaction.all.find(
    (t) => t.asJson.id === transactionId
  );

  if (transaction) {
    try {
      await api.withdrawalTransaction.updateBatchStatusToFalse(transaction.asJson.id);
      await api.batches.deleteBatchTransaction(batch, transaction.asJson.id);

      if (batch.paymentBatchFileTransactions.length === 0) {
        await api.batches.delete(batch);
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_BATCHED_TRANSACTIONS_MODAL);
      }
    } catch (error) {
    }
  }
}

export function getClientEntity(
  linkedEntity: string,
  entities: (INaturalPerson | ILegalEntity)[]
): INaturalPerson | ILegalEntity | string {
  const naturalPerson = entities.find(
    (person) => person?.entityId === linkedEntity
  ) as INaturalPerson | undefined; // Use type assertion here

  if (naturalPerson) {
    return naturalPerson;
  } else {
    return "Natural Person not found";
  }
}

export function getBankDetails(
  person: INaturalPerson | ILegalEntity | undefined,
  acc: { label: string; value: string }
): string {
  // Find banking details for the given account number
  const findDetails = person?.bankingDetail?.find(
    (b) => b.accountNumber === acc.value
  );

  if (findDetails) {
    // Return a formatted string with bank details
    return `${findDetails.bankName} | ${findDetails.accountHolder} | ${findDetails.accountNumber} | ${findDetails.branchNumber}`;
  } else {
    // Return an empty string if details are not found
    return "";
  }
}

export function getStatementClientRate(
  store: AppStore,
  accountNumber: string
): number | null {
  const mma = store.mma.all.find(
    (mma) => mma.asJson.accountNumber === accountNumber
  )?.asJson;
  if (mma) {
    const clientRate = mma.baseRate - mma.feeRate;
    if (clientRate || clientRate === 0) {
      return clientRate;
    } else {
      return null;
    }
  } else {
    return null; // Handle the case where mma is not found
  }
}

export function getNumberOfDays(
  store: AppStore,
  accountNumber: string
): number | null {
  const mma = store.mma.all.find(
    (m) => m.asJson.accountNumber === accountNumber
  )?.asJson.accountType;
  const products = store.product.all;

  if (mma) {
    const useProduct = products.find((p) => p.asJson.id === mma)?.asJson
      .lastUpdated;

    if (useProduct) {
      // Get the current Unix timestamp
      const currentTimestamp = Math.floor(new Date().getTime() / 1000);

      // Calculate the difference in seconds
      const differenceInSeconds = currentTimestamp - useProduct;

      // Convert seconds to days
      const daysDifference = Math.floor(differenceInSeconds / (24 * 60 * 60));

      return daysDifference;
    } else {
      // Handle the case where lastUpdated is not available
      return null;
    }
  } else {
    // Handle the case where mma is not found
    return null;
  }
}

export function getRemark(
  statement: IDailyStatement[],
  targetId: string
): string {
  const targetIndex = statement.findIndex((entry) => entry.id === targetId);

  if (targetIndex === -1) {
    return "Record not found";
  }

  const targetEntry = statement[targetIndex];
  const hasDeposits = targetEntry.totalDeposits > 0;
  const hasWithdrawals = targetEntry.totalWithdrawals > 0;
  const rateChanged =
    targetIndex > 0 && statement[targetIndex - 1].rate !== targetEntry.rate;

  let remark = "";

  if (hasDeposits && hasWithdrawals) {
    remark = "Deposit(s)/Withdrawal(s)";
  } else if (hasDeposits) {
    remark = "Deposit(s)";
  } else if (hasWithdrawals) {
    remark = "Withdrawal(s)";
  } else {
    remark = " - ";
  }

  if (rateChanged) {
    remark += " - Rate Changed";
  }

  return remark;
}

export function getTotalDaysInMonth(statement: IDailyStatement[]): number {
  const uniqueDays = new Set<string>();

  for (const entry of statement) {
    const date = new Date(entry.date);
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1
      }-${date.getDate()}`;
    uniqueDays.add(formattedDate);
  }

  return uniqueDays.size;
}

export function getClosingBalance(statement: IStatementTransaction[]): number {
  if (statement.length === 0) {
    return 0; // Return 0 if the statement is empty
  }

  // Find the latest record based on the date
  const latestRecord = statement.reduce(
    (latest, entry) => (entry.date > latest.date ? entry : latest),
    statement[0]
  );

  // Calculate the closing balance
  const closingBalance = latestRecord.balance;

  return closingBalance;
}
interface DailyInterestStatement {
  id: string;
  date: number;
  transaction: number;
  balance: number;
  rate: number;
  days: number;
  distribution: number;
  remark: string;
  pBalance: number;
  pDate: number;
}

export function getInterestBalance(
  statement: DailyInterestStatement[],
  id: string
): number {
  const record = statement.find((s) => s.id === id);

  if (record) {
    const interestBalance = (((record.balance * record.rate) / 100) * 1) / 365;
    return interestBalance;
  }
  return 0;
}
export function getInterestBalanceV2(
  balance: number,
  rate: number,
  days: number
): number {
  const interestBalance = (((balance * rate) / 100) * days) / 365;
  return interestBalance;
}

export function getDaysInterest(
  previousDate: number,
  currentDate: number
): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000; // milliseconds per day

  // Convert the timestamps to Date objects
  const previousDateTime = new Date(previousDate);
  const currentDateTime = new Date(currentDate);

  // Calculate the difference in milliseconds
  const timeDifference = currentDateTime.getTime() - previousDateTime.getTime();

  // Calculate the number of days by dividing the difference by the milliseconds per day
  const daysDifference = Math.ceil(timeDifference / MS_PER_DAY);

  return daysDifference;
}

export function getBalanceV2(
  amount: number,
  previousBalance: number,
  remark: string
): number {
  const lowercasedRemark = remark.toLowerCase();

  if (lowercasedRemark.includes("deposit")) {
    // If the remark contains the word 'deposit', add the amount to the previous balance
    return previousBalance + amount;
  } else if (lowercasedRemark.includes("withdrawal")) {
    // If the remark contains the word 'withdrawal', subtract the amount from the previous balance
    return previousBalance - amount;
  } else {
    // If the remark does not contain 'deposit' or 'withdrawal', return the previous balance
    return previousBalance;
  }
}

export function getTotalInterest(monthData: DailyInterestStatement[]): number {
  return monthData.reduce((totalInterest, transaction) => {
    // Assuming that 'distribution' is the property representing the interest in each transaction
    const transactionInterest = transaction.distribution || 0;
    return totalInterest + transactionInterest;
  }, 0);
}

export function getTotalDays(monthData: DailyInterestStatement[]): number {
  return monthData.reduce((totalInterest, transaction) => {
    // Assuming that 'distribution' is the property representing the interest in each transaction
    const transactionInterest = transaction.days || 0;
    return totalInterest + transactionInterest;
  }, 0);
}

export function getLatestBalanceFromTransaction(
  monthData: DailyInterestStatement[]
): number {
  // Ensure the monthData is not empty
  if (monthData.length === 0) {
    return 0; // or return an appropriate default value
  }

  // Sort transactions by date in descending order
  const sortedTransactions = monthData.slice().sort((a, b) => b.date - a.date);

  // Return the balance from the first (latest) transaction
  return sortedTransactions[0].balance;
}

export function getOpeningBalance(monthData: DailyInterestStatement[]): number {
  // Ensure monthData is not empty
  if (monthData.length === 0) {
    return 0; // or return an appropriate default value
  }

  // Get the first transaction of the month
  const firstTransaction = monthData[0];

  // Calculate the opening balance using the first transaction
  const openingBalance =
    firstTransaction.balance - firstTransaction.transaction;

  return openingBalance;
}

export async function updateInterestBalance(
  accountId: string,
  store: AppStore,
  api: AppApi,
  startDate: Date,
  endDate: Date
) {
  // const convertedEndDate = new Date(endDate.toLocaleString());
  try {
    await updateInterestAccruedAndTotalDays(
      accountId,
      store,
      api,
      startDate,
      endDate
    );
  } catch (error) { }
  // const data = {
  //   accountNumber: accNumber,
  // };

  // const response = await fetch(
  //   "https://us-central1-ijgmms.cloudfunctions.net/onActionMonthTotalInterest",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   }
  // );

  // if (response.ok) {

  // } else {
  // }
}

export async function updateInterestAccruedAndTotalDays(
  accountId: string,
  store: AppStore,
  api: AppApi,
  startDate: Date,
  endDate: Date,
  setLoader?: (loading: boolean) => void,
  monthEndDate?: number
) {
  try {
    await api.statementTransaction.getAll(accountId);
  } catch (error) { }

  const transactionStatements = store.statementTransaction.all;
  const statementTransactionsAsJson = transactionStatements.map(
    (transaction) => {
      return transaction.asJson;
    }
  );

  const filteredStatementTransactions = statementTransactionsAsJson
    .filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);

      // First, sort by date
      if (dateB.getTime() !== dateA.getTime()) {
        return dateA.getTime() - dateB.getTime();
      } else {
        // If dates are equal, sort by createdAt
        const createdAtA = new Date(a.createdAt || 0);
        const createdAtB = new Date(b.createdAt || 0);

        return createdAtA.getTime() - createdAtB.getTime();
      }
    });

  filteredStatementTransactions.forEach((transaction, index) => {
    transaction.days =
      index === filteredStatementTransactions.length - 1
        ? calculateDays(transaction.date, undefined, monthEndDate)
        : calculateDays(
          transaction.date,
          filteredStatementTransactions[index + 1].date,
          undefined
        );
    transaction.distribution = Number(
      ((transaction.balance * transaction.rate) / 100) *
      (transaction.days ? transaction.days / 365 : 0 / 365)
    );
  });

  const totalDays = filteredStatementTransactions.reduce(
    (acc, curr) => acc + (curr.days || 0),
    0
  );
  const totalDistribution = filteredStatementTransactions.reduce(
    (acc, curr) => acc + (curr.distribution || 0),
    0
  );

  console.log(`days: ${totalDays}`, "Distribution: ", totalDistribution);
  try {
    await api.mma.updateDaysAndInterest(
      accountId,
      totalDays,
      totalDistribution
    );
  } catch (error) {
    console.log("Error: ", error);
  } finally {
  }
}

const calculateDays = (
  transactionDate: number,
  nextTransactionDate?: number,
  monthEnd?: number
): number => {
  const currentDate = new Date();
  const transactionDateTime = new Date(transactionDate);

  if (nextTransactionDate) {
    const nextTransactionDateTime = new Date(nextTransactionDate);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil(
      (nextTransactionDateTime.getTime() - transactionDateTime.getTime()) /
      millisecondsPerDay
    ); // Add 1 to include both start and end dates
  } else if (monthEnd) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays =
      Math.ceil(
        (monthEnd - transactionDateTime.getTime()) / millisecondsPerDay
      ) + 1; // Add 1 to include both start and end dates
    return remainingDays;
  } else {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
      Math.ceil(
        (currentDate.getTime() - transactionDateTime.getTime()) /
        millisecondsPerDay
      ) - 1
    ); // Add 1 to include both start and end dates
  }
};

export function getStatementBalance(
  amount: number,
  previousBalance: number,
  transaction: string
): number {
  if (transaction === "withdrawal") {
    // Subtract the amount for withdrawal
    return previousBalance;
  } else if (transaction === "deposit") {
    // Add the amount for deposit
    return previousBalance + amount;
  } else {
    // Handle other types of transactions (optional)
    console.error("Invalid transaction type");
    return previousBalance;
  }
}

export function daysLogic(days: number): number | string {
  if (days < 0) {
    return "-";
  } else if (!days) {
    return "-";
  } else {
    return days;
  }
}

export function interestLogic(interest: number): number | string {
  if (interest < 0) {
    return "-";
  } else if (!interest) {
    return "-";
  } else {
    return interest;
  }
}

export function capitaliseTransactionLogicAmount(
  transaction: IStatementTransaction
) {
  if (
    transaction.remark === "Capitalise" ||
    transaction.remark === "Capitalize"
  ) {
    return "-";
  } else if ((transaction.distribution || 0) < 0) {
    return "-";
  }
  return numberCurrencyFormat(roundOff(transaction?.distribution || 0) || 0);
}
export function capitaliseTransactionLogicDays(
  transaction: IStatementTransaction
) {
  if (
    transaction.remark === "Capitalise" ||
    transaction.remark === "Capitalize"
  ) {
    return "-";
  } else if ((transaction.days || 0) < 0) {
    return "-";
  }
  return transaction.days;
}

export function getUser(userId: string, store: AppStore) {
  const user = store.user.all.find((u) => u.asJson.uid === userId);
  if (user) {
    return `${user.asJson.firstName} ${user.asJson.lastName}`;
  }
  return "-";
}

export const onViewTransaction = (
  transaction: IDepositTransaction,
  store: AppStore,
  setShowOnSubmitModal: (value: boolean) => void
) => {
  if (transaction.transactionType !== "Split") {
    setShowOnSubmitModal(true);
    store.depositTransaction.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL
    );
  } else if (transaction.transactionType === "Split") {
    setShowOnSubmitModal(true);
    store.depositTransaction.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL
    );
  }
};

export const onViewDeletedTransaction = (
  transaction: IWithdrawalTransaction,
  store: AppStore,
  setShowOnSubmitModal: (value: boolean) => void
) => {
  if (transaction.transactionType !== "Split") {
    setShowOnSubmitModal(true);
    store.withdrawalTransaction.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_TRANSACTION_MODAL
    );
  } else if (transaction.transactionType === "Split") {
    setShowOnSubmitModal(true);
    store.withdrawalTransaction.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL
    );
  }
};
export const onViewWithdrawalTransaction = (
  transaction: IWithdrawalTransaction,
  store: AppStore,
  setShowOnSubmitModal: (value: boolean) => void
) => {
  const _transaction = store.withdrawalTransaction.getItemById(transaction.id);

  if (_transaction) {
    store.withdrawalTransaction.select(_transaction.asJson);
    setShowOnSubmitModal(true);

    if (_transaction.asJson.transactionType !== "Split") {
      showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW);
    } else if (_transaction.asJson.transactionType === "Split" && _transaction) {
      showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.VIEW_SPLIT_TRANSACTION_MODAL);
    }
  }
};

export const onViewSwitchTransaction = (
  transaction: ISwitchTransaction,
  store: AppStore,
  setShowOnSubmitModal: (value: boolean) => void
) => {
  if (transaction.transactionType === "Manual Switch") {
    setShowOnSubmitModal(true);
    store.switch.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_TRANSACTION_MODAL
    );
  } else if (transaction.transactionType === "Manual Switch Close Out") {
    setShowOnSubmitModal(true);
    store.switch.select(transaction);
    showModalFromId(
      MODAL_NAMES.BACK_OFFICE.VIEW_SWITCH_CLOSE_OUT_TRANSACTION_MODAL
    );
  }
};

export const onAmendDepositTransaction = (transaction: IDepositTransaction, store: AppStore, setShowOnAmendModal: (value: boolean) => void) => {

  store.depositTransaction.select(transaction);

  if (transaction.transactionType !== "Split" && store.depositTransaction.selected) {
    setShowOnAmendModal(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.DEPOSIT_AMEND_MODAL);
  }
  if (transaction.transactionType === "Split" && store.depositTransaction.selected) {
    setShowOnAmendModal(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_TRANSACTION_MODAL);
  }
};

export const onAmendWithdrawalTransaction = (transaction: IWithdrawalTransaction, store: AppStore, setShowOnAmendModal: (value: boolean) => void) => {

  store.withdrawalTransaction.select(transaction);

  if (transaction.transactionType !== "Split" && store.withdrawalTransaction.selected) {
    setShowOnAmendModal(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAWAL_AMEND_MODAL);
  }

  if (transaction.transactionType === "Split" && store.withdrawalTransaction.selected) {
    setShowOnAmendModal(true);
    showModalFromId(MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.AMEND_SPLIT_WITHDRAWAL_TRANSACTION_MODAL);
  }
};

export const onAmendSwitchTransaction = (
  transaction: ISwitchTransaction,
  store: AppStore,
  setShowOnAmendModal: (value: boolean) => void
) => {
  if (transaction.transactionType === "Manual Switch") {
    store.switch.select(transaction);
    if (store.switch.selected) {
      console.log("Transaction", store.switch.selected);
      setShowOnAmendModal(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_AMEND_MODAL);
    }

  } else if (transaction.transactionType === "Manual Switch Close Out") {
    store.switch.select(transaction);
    if (store.switch.selected) {
      console.log("Transaction", store.switch.selected);
      setShowOnAmendModal(true);
      showModalFromId(MODAL_NAMES.BACK_OFFICE.SWITCH_BETWEEN_ENTITIES_AMEND_MODAL_CLOSE_OUT);
    }
  }
};
export function getDepositTransactionProcess(
  backDatingTransaction: boolean,
  futureDatingTransaction: boolean
): string {
  switch (true) {
    case backDatingTransaction:
      return "Back-Dated";
    case futureDatingTransaction:
      return "Future-Dated";
    default:
      return "Normal";
  }
}


