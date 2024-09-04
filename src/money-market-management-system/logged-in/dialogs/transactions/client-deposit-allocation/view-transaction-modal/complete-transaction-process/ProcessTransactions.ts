import AppApi from "../../../../../../../shared/apis/AppApi";
import { IDepositTransaction } from "../../../../../../../shared/models/deposit-transaction/DepositTransactionModel";
import AppStore from "../../../../../../../shared/stores/AppStore";
import { IStatementTransaction } from "../../../../../../../shared/models/StatementTransactionModel";
import { ACTIVE_ENV } from "../../../../../CloudEnv";
import { IWithdrawalTransaction } from "../../../../../../../shared/models/withdrawal-transaction/WithdrawalTransactionModel";
import { dateFormat_YY_MM_DD } from "../../../../../../../shared/utils/utils";
import { ISwitchTransaction } from "../../../../../../../shared/models/SwitchTransactionModel";
import { IMoneyMarketAccount } from "../../../../../../../shared/models/money-market-account/MoneyMarketAccount";
import {
  getAccountId,
  getAccountRate,
} from "../../../../../../../shared/functions/MyFunctions";
import { update } from "lodash";

export async function completeTransaction(
  transaction: IDepositTransaction,
  store: AppStore,
  api: AppApi,
  setLoader: (value: boolean) => void
) {
  // Enable the loader
  setLoader(true);

  // Fetch the account details
  const mma = store.mma.all.find(
    (mma) => mma.asJson.accountNumber === transaction.accountNumber
  )?.asJson;

  if (!mma) {
    setLoader(false);
    return;
  }

  const {
    balance: mmaCurrentAccountBalance,
    clientRate: mmaCurrentRate,
    id: mmaAccountId,
  } = mma;

  // Check if balance and rate are available
  if (mmaCurrentAccountBalance == null || mmaCurrentRate == null) {
    setLoader(false);
    return;
  }

  // Calculate new balance
  const mmaNewAccountBalance = mmaCurrentAccountBalance + transaction.amount;

  // Create a new statement transaction
  const statementTransaction: IStatementTransaction = {
    id: transaction.id,
    date: Date.parse(dateFormat_YY_MM_DD(transaction.valueDate)),
    transaction: "deposit",
    amount: transaction.amount,
    balance: mmaNewAccountBalance,
    rate: mmaCurrentRate,
    remark: transaction.bankReference,
    createdAt: Date.now(),
  };

  try {
    if (mmaAccountId) {
      // Create statement transaction
      await api.mma.createStatementTransaction(
        mmaAccountId,
        statementTransaction
      );

      // Update deposit transaction status
      await api.depositTransaction.update(transaction);
      await onReAlign(mma.id);
      await api.statementTransaction.getAll(mma.id);
    } else {
      setLoader(false);
      return;
    }
  } catch (error) {
    setLoader(false);
    return;
  }
  // Disable the loader
  setLoader(false);
}

export async function completeWithdrawalTransaction(
  transaction: IWithdrawalTransaction,
  store: AppStore,
  api: AppApi,
  setLoader: (value: boolean) => void
) {
  // Enable the loader
  setLoader(true);

  // Fetch the account details
  const mma = store.mma.all.find(
    (mma) => mma.asJson.accountNumber === transaction.accountNumber
  )?.asJson;

  if (!mma) {
    setLoader(false);
    return;
  }

  const {
    balance: mmaCurrentAccountBalance,
    clientRate: mmaCurrentRate,
    id: mmaAccountId,
  } = mma;

  // Check if balance and rate are available
  if (mmaCurrentAccountBalance == null || mmaCurrentRate == null) {
    setLoader(false);
    return;
  }

  // Calculate new balance
  const mmaNewAccountBalance = mmaCurrentAccountBalance + transaction.amount;

  // Create a new statement transaction
  const statementTransaction: IStatementTransaction = {
    id: transaction.id,
    date: transaction.valueDate,
    transaction: "withdrawal",
    amount: transaction.amount,
    balance: mmaNewAccountBalance,
    rate: mmaCurrentRate,
    remark: transaction.bankReference,
    createdAt: Date.now(),
  };

  try {
    if (mmaAccountId) {
      // Create statement transaction
      await api.mma.createStatementTransaction(
        mmaAccountId,
        statementTransaction
      );

      // Update deposit transaction status
      await api.withdrawalTransaction.update(transaction);
      await onReAlign(mma.id);
      await api.statementTransaction.getAll(mma.id);
    } else {
      setLoader(false);
      return;
    }
  } catch (error) {
    setLoader(false);
    return;
  }
  // Disable the loader
  setLoader(false);
}

export const onReAlign = async (accountId: string) => {
  const url = `${ACTIVE_ENV.url}reAlignStatement`;

  const _accountToUpdate = {
    mmaId: accountId,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_accountToUpdate),
    });

    if (response.ok) {
      return true; // Indicate success
    } else {
      return false; // Indicate failure
    }
  } catch (error) {
    return false;
  }
};

export const onCompletedSwitch = async (
  switchTransaction: ISwitchTransaction,
  api: AppApi,
  store: AppStore
) => {
  // Set loading to true when operation begins

  const moneyMarketAccounts = store.mma.all;

  const update = async (newTransaction: ISwitchTransaction) => {
    try {
      try {
        const fromAccount = moneyMarketAccounts.find(
          (account) =>
            account.asJson.accountNumber === newTransaction.fromAccount
        );
        const toAccount = moneyMarketAccounts.find(
          (account) => account.asJson.accountNumber === newTransaction.toAccount
        );

        if (fromAccount) {
          const newBalance = fromAccount.asJson.balance - newTransaction.amount;
          const runningBalance =
            fromAccount.asJson.balance - newTransaction.amount;

          // update balance in MM account
          const accountUpdate: IMoneyMarketAccount = {
            ...fromAccount.asJson,
            balance: newBalance,
            runningBalance: runningBalance,
          };

          try {
            await api.mma.update(accountUpdate);

            const statementTransactionFrom: IStatementTransaction = {
              id: newTransaction.id,
              date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
              transaction: "switchTo",
              balance: newBalance,
              rate: getAccountRate(newTransaction.fromAccount, store) || 0,
              remark: `Switch to ${newTransaction.toAccount}`,
              amount: newTransaction.amount,
              createdAt: Date.now(),
            };
            try {
              await api.mma.createStatementTransaction(
                getAccountId(newTransaction.fromAccount, store) || "",
                statementTransactionFrom
              );
            } catch (error) {}
          } catch (error) {}
        }

        if (toAccount) {
          const newBalance = toAccount.asJson.balance + newTransaction.amount;
          const runningBalance =
            toAccount.asJson.balance + newTransaction.amount;
          // update balance in MM account
          const accountUpdate: IMoneyMarketAccount = {
            ...toAccount.asJson,
            balance: newBalance,
            runningBalance: runningBalance,
          };
          try {
            await api.mma.update(accountUpdate);
            const statementTransactionTo: IStatementTransaction = {
              id: newTransaction.id,
              date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
              transaction: "switchFrom",
              balance: newBalance,
              rate: getAccountRate(newTransaction.toAccount, store) || 0,
              remark: `Switch from ${newTransaction.fromAccount}`,
              amount: newTransaction.amount,
              createdAt: Date.now(),
            };
            try {
              await api.mma.createStatementTransaction(
                getAccountId(newTransaction.toAccount, store) || "",
                statementTransactionTo
              );
            } catch (error) {}
          } catch (error) {}
        }

        await api.switch.update(newTransaction);
      } catch (error) {}
    } catch (error) {}
  };
  update(switchTransaction);
};
const processCloseOutTransactionCapitalisation = async (
  transaction: ISwitchTransaction,
  store: AppStore,
  api: AppApi
) => {
  //!Capitalisation on from account and statement creation for from account
  const transactionId = transaction.id;
  const moneyMarketAccounts = store.mma.all;
  const moneyMarketAccount = moneyMarketAccounts.find(
    (account) => account.asJson.accountNumber === transaction.fromAccount
  )?.asJson;
  const switchTransaction = store.switch.all.find(
    (transaction) => transaction.asJson.id === transactionId
  )?.asJson;

  if (
    moneyMarketAccount &&
    switchTransaction &&
    switchTransaction.closeOutInterest
  ) {
    const statementTransactionCapitalise: IStatementTransaction = {
      id: `${switchTransaction.id}CC`,
      date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
      transaction: "switchFrom",
      balance:
      moneyMarketAccount.balance + switchTransaction.closeOutInterest || 0,
      previousBalance: moneyMarketAccount.balance,
      rate: moneyMarketAccount.clientRate || 0,
      remark: `Capitalise`,
      amount: switchTransaction.closeOutInterest || 0,
      createdAt: Date.now(),
    };
    try {
      await api.mma.createStatementTransaction(
        moneyMarketAccount.id,
        statementTransactionCapitalise
      );
      const statementTransaction: IStatementTransaction = {
        id: transaction.id,
        date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
        transaction: "switchFrom",
        balance: moneyMarketAccount.balance - switchTransaction.amount,
        previousBalance: moneyMarketAccount.balance,
        rate: moneyMarketAccount.balance || 0,
        remark: `Close Out: Switch to account ${transaction.toAccount}`,
        amount: transaction.amount,
        createdAt: Date.now() + 1,
      };
      await api.mma.createStatementTransaction(
        moneyMarketAccount.id || "",
        statementTransaction
      );
      await onReAlign(moneyMarketAccount.id);
    } catch (error) {}
    const toAccount = moneyMarketAccounts.find(
      (account) => account.asJson.accountNumber === switchTransaction.toAccount
    );
    if (toAccount) {
      const newBalance = toAccount.asJson.balance + switchTransaction.amount;
      const runningBalance =
        toAccount.asJson.balance + switchTransaction.amount;
      // update balance in MM account
      const accountUpdate: IMoneyMarketAccount = {
        ...toAccount.asJson,
        balance: newBalance,
        runningBalance: runningBalance,
      };
      try {
        await api.mma.update(accountUpdate);
        const statementTransactionTo: IStatementTransaction = {
          id: switchTransaction.id,
          date: Date.parse(dateFormat_YY_MM_DD(Date.now())),
          transaction: "switchFrom",
          balance: newBalance,
          rate: getAccountRate(switchTransaction.toAccount, store) || 0,
          remark: `Switch from ${switchTransaction.fromAccount}`,
          amount: switchTransaction.amount,
          createdAt: Date.now(),
        };
        try {
          await api.mma.createStatementTransaction(
            getAccountId(switchTransaction.toAccount, store) || "",
            statementTransactionTo
          );
        } catch (error) {}
      } catch (error) {}
    }
  }
};
export const onCompletedSwitchCloseOut = async (
  switchTransaction: ISwitchTransaction,
  api: AppApi,
  store: AppStore
) => {
  const update = async (newTransaction: ISwitchTransaction) => {
    try {
      processCloseOutTransactionCapitalisation(newTransaction, store, api);
      await api.switch.update(newTransaction);
    } catch (error) {
      console.log("Error processing close out " + error);
    }
  };
  update(switchTransaction);
};
