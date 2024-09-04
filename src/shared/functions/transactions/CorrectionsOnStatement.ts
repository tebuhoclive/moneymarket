import { ACTIVE_ENV } from "../../../money-market-management-system/logged-in/CloudEnv";
import AppApi from "../../apis/AppApi";
import { IStatementTransaction } from "../../models/StatementTransactionModel";
import AppStore from "../../stores/AppStore";
import { accountNumber } from "./month-end-report-grid/SimpleFunctions";

export const depositCorrection = async (
  remark: string,
  moneyMarketAccountId: string,
  transactionOnStatement: IStatementTransaction,
  api: AppApi,
  store: AppStore
) => {
  try {
    const statementTransaction: IStatementTransaction = {
      id: `${transactionOnStatement.id}CC`,
      date: transactionOnStatement.date,
      transaction: "deposit",
      balance: transactionOnStatement.previousBalance
        ? transactionOnStatement.previousBalance + transactionOnStatement.amount
        : transactionOnStatement.amount,
      rate: transactionOnStatement.rate,
      remark: remark,
      amount: transactionOnStatement.amount,
      createdAt: Date.now(),
      previousBalance: transactionOnStatement.previousBalance,
      blinded: true,
    };

    await api.mma.createStatementTransaction(moneyMarketAccountId, statementTransaction);

    try {
      const updateStatementTransaction: IStatementTransaction = {
        ...transactionOnStatement,
        blinded: true,
      };

      await api.statementTransaction.update(moneyMarketAccountId, updateStatementTransaction);

      const newAllStatementTransactions = store.statementTransaction.all;

      const includeNew = newAllStatementTransactions.sort((a, b) => {
        const dateA = new Date(a.asJson.date || 0);
        const dateB = new Date(b.asJson.date || 0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateA.getTime() - dateB.getTime();
        } else {
          const createdAtA = new Date(a.asJson.createdAt || 0);
          const createdAtB = new Date(b.asJson.createdAt || 0);

          return createdAtA.getTime() - createdAtB.getTime();
        }
      });

      const modifiedTransactions = [includeNew[0]];

      for (let i = 1; i < includeNew.length; i++) {
        const previousBalance = includeNew[i - 1].asJson.balance;
        const currentTransaction = includeNew[i];
        currentTransaction.asJson.previousBalance = previousBalance;
        if (
          currentTransaction.asJson.transaction === "deposit" ||
          currentTransaction.asJson.transaction === "switchTo"
        ) {
          currentTransaction.asJson.balance =
            previousBalance + currentTransaction.asJson.amount;
        } else if (
          currentTransaction.asJson.transaction === "withdrawal" ||
          currentTransaction.asJson.transaction === "switchFrom"
        ) {
          currentTransaction.asJson.balance =
            previousBalance - currentTransaction.asJson.amount;
        }
        modifiedTransactions.push(currentTransaction);
        api.statementTransaction.update(
          moneyMarketAccountId,
          currentTransaction.asJson
        );
      }

      try {
        const accountId = accountNumber(moneyMarketAccountId, store);
        if (accountId) {
          onReAlign(accountId);
          await api.depositTransaction.updateStatusToDeleted(transactionOnStatement.id);
        }
      } catch (error) { }
    } catch (error) { }
  } catch (error) { }
};

export const onReAlign = async (accountId: string) => {
  const url = `${ACTIVE_ENV.url}reAlignStatement`;

  const _accountToUpdate = { mmaId: accountId };

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

export const switchToCorrection = async (
  remark: string,
  moneyMarketAccountId: string,
  transactionOnStatement: IStatementTransaction,
  api: AppApi,
  store: AppStore
) => {
  try {
    const statementTransaction: IStatementTransaction = {
      id: `${transactionOnStatement.id}CC`,
      date: transactionOnStatement.date,
      transaction: "switchTo",
      balance: transactionOnStatement.previousBalance
        ? transactionOnStatement.previousBalance + transactionOnStatement.amount
        : transactionOnStatement.amount,
      rate: transactionOnStatement.rate,
      remark: remark,
      amount: transactionOnStatement.amount,
      createdAt: Date.now(),
      previousBalance: transactionOnStatement.previousBalance,
      blinded: true,
    };

    await api.mma.createStatementTransaction(
      moneyMarketAccountId,
      statementTransaction
    );

    try {
      const updateStatementTransaction: IStatementTransaction = {
        ...transactionOnStatement,
        blinded: true,
      };

      await api.statementTransaction.update(
        moneyMarketAccountId,
        updateStatementTransaction
      );

      const newAllStatementTransactions = store.statementTransaction.all;

      const includeNew = newAllStatementTransactions.sort((a, b) => {
        const dateA = new Date(a.asJson.date || 0);
        const dateB = new Date(b.asJson.date || 0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateA.getTime() - dateB.getTime();
        } else {
          const createdAtA = new Date(a.asJson.createdAt || 0);
          const createdAtB = new Date(b.asJson.createdAt || 0);

          return createdAtA.getTime() - createdAtB.getTime();
        }
      });

      const modifiedTransactions = [includeNew[0]];

      for (let i = 1; i < includeNew.length; i++) {
        const previousBalance = includeNew[i - 1].asJson.balance;
        const currentTransaction = includeNew[i];
        currentTransaction.asJson.previousBalance = previousBalance;
        if (
          currentTransaction.asJson.transaction === "deposit" ||
          currentTransaction.asJson.transaction === "switchTo"
        ) {
          currentTransaction.asJson.balance =
            previousBalance + currentTransaction.asJson.amount;
        } else if (
          currentTransaction.asJson.transaction === "withdrawal" ||
          currentTransaction.asJson.transaction === "switchFrom"
        ) {
          currentTransaction.asJson.balance =
            previousBalance - currentTransaction.asJson.amount;
        }
        modifiedTransactions.push(currentTransaction);
        api.statementTransaction.update(
          moneyMarketAccountId,
          currentTransaction.asJson
        );
      }
      try {
        const accountId = accountNumber(moneyMarketAccountId, store);
        if (accountId) {
          await onReAlign(accountId);
          await api.switch.updateStatusToDeleted(transactionOnStatement.id);
        }
      } catch (error) { }
    } catch (error) { }
  } catch (error) { }
};

export const withdrawalCorrection = async (
  remark: string,
  moneyMarketAccountId: string,
  transactionOnStatement: IStatementTransaction,
  api: AppApi,
  store: AppStore
) => {
  try {
    const statementTransaction: IStatementTransaction = {
      id: `${transactionOnStatement.id}CC`,
      date: transactionOnStatement.date,
      transaction: "withdrawal",
      balance: transactionOnStatement.previousBalance
        ? transactionOnStatement.previousBalance - transactionOnStatement.amount
        : transactionOnStatement.amount,
      rate: transactionOnStatement.rate,
      remark: remark,
      amount: transactionOnStatement.amount,
      createdAt: Date.now(),
      previousBalance: transactionOnStatement.previousBalance,
      blinded: true,
    };

    await api.mma.createStatementTransaction(
      moneyMarketAccountId,
      statementTransaction
    );

    try {
      const updateStatementTransaction: IStatementTransaction = {
        ...transactionOnStatement,
        blinded: true,
      };

      await api.statementTransaction.update(
        moneyMarketAccountId,
        updateStatementTransaction
      );

      const newAllStatementTransactions = store.statementTransaction.all;

      const includeNew = newAllStatementTransactions.sort((a, b) => {
        const dateA = new Date(a.asJson.date || 0);
        const dateB = new Date(b.asJson.date || 0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateA.getTime() - dateB.getTime();
        } else {
          const createdAtA = new Date(a.asJson.createdAt || 0);
          const createdAtB = new Date(b.asJson.createdAt || 0);

          return createdAtA.getTime() - createdAtB.getTime();
        }
      });

      const modifiedTransactions = [includeNew[0]];

      for (let i = 1; i < includeNew.length; i++) {
        const previousBalance = includeNew[i - 1].asJson.balance;
        const currentTransaction = includeNew[i];
        currentTransaction.asJson.previousBalance = previousBalance;
        if (
          currentTransaction.asJson.transaction === "deposit" ||
          currentTransaction.asJson.transaction === "switchTo"
        ) {
          currentTransaction.asJson.balance =
            previousBalance + currentTransaction.asJson.amount;
        } else if (
          currentTransaction.asJson.transaction === "withdrawal" ||
          currentTransaction.asJson.transaction === "switchFrom"
        ) {
          currentTransaction.asJson.balance =
            previousBalance - currentTransaction.asJson.amount;
        }
        modifiedTransactions.push(currentTransaction);
        api.statementTransaction.update(
          moneyMarketAccountId,
          currentTransaction.asJson
        );
      }
      try {
        const accountId = accountNumber(moneyMarketAccountId, store);
        if (accountId) {
          await onReAlign(accountId);
          await api.withdrawalTransaction.updateStatusToDeleted(
            transactionOnStatement.id
          );
        }
      } catch (error) { }
    } catch (error) { }
  } catch (error) { }
};

export const switchFromCorrection = async (
  remark: string,
  moneyMarketAccountId: string,
  transactionOnStatement: IStatementTransaction,
  api: AppApi,
  store: AppStore
) => {
  try {
    const statementTransaction: IStatementTransaction = {
      id: `${transactionOnStatement.id}CC`,
      date: transactionOnStatement.date,
      transaction: "switchFrom",
      balance: transactionOnStatement.previousBalance
        ? transactionOnStatement.previousBalance - transactionOnStatement.amount
        : transactionOnStatement.amount,
      rate: transactionOnStatement.rate,
      remark: remark,
      amount: transactionOnStatement.amount,
      createdAt: Date.now(),
      previousBalance: transactionOnStatement.previousBalance,
      blinded: true,
    };

    await api.mma.createStatementTransaction(
      moneyMarketAccountId,
      statementTransaction
    );

    try {
      const updateStatementTransaction: IStatementTransaction = {
        ...transactionOnStatement,
        blinded: true,
      };

      await api.statementTransaction.update(
        moneyMarketAccountId,
        updateStatementTransaction
      );

      const newAllStatementTransactions = store.statementTransaction.all;

      const includeNew = newAllStatementTransactions.sort((a, b) => {
        const dateA = new Date(a.asJson.date || 0);
        const dateB = new Date(b.asJson.date || 0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateA.getTime() - dateB.getTime();
        } else {
          const createdAtA = new Date(a.asJson.createdAt || 0);
          const createdAtB = new Date(b.asJson.createdAt || 0);

          return createdAtA.getTime() - createdAtB.getTime();
        }
      });

      const modifiedTransactions = [includeNew[0]];

      for (let i = 1; i < includeNew.length; i++) {
        const previousBalance = includeNew[i - 1].asJson.balance;
        const currentTransaction = includeNew[i];
        currentTransaction.asJson.previousBalance = previousBalance;
        if (
          currentTransaction.asJson.transaction === "deposit" ||
          currentTransaction.asJson.transaction === "switchTo"
        ) {
          currentTransaction.asJson.balance =
            previousBalance + currentTransaction.asJson.amount;
        } else if (
          currentTransaction.asJson.transaction === "withdrawal" ||
          currentTransaction.asJson.transaction === "switchFrom"
        ) {
          currentTransaction.asJson.balance =
            previousBalance - currentTransaction.asJson.amount;
        }
        modifiedTransactions.push(currentTransaction);
        api.statementTransaction.update(
          moneyMarketAccountId,
          currentTransaction.asJson
        );
      }

      try {
        const accountId = accountNumber(moneyMarketAccountId, store);
        if (accountId) {
          await onReAlign(accountId);
          await api.switch.updateStatusToDeleted(transactionOnStatement.id);
        }
      } catch (error) { }
    } catch (error) { }
  } catch (error) { }
};

export const rateChange = async (
  remark: string,
  moneyMarketAccountId: string,
  transactionOnStatement: IStatementTransaction,
  api: AppApi,
  store: AppStore
) => {
  try {
    const statementTransaction: IStatementTransaction = {
      id: `${transactionOnStatement.id}CC`,
      date: transactionOnStatement.date,
      transaction: "rateChange",
      balance: transactionOnStatement.previousBalance
        ? transactionOnStatement.previousBalance
        : 0,
      rate: transactionOnStatement.rate,
      remark: remark,
      amount: transactionOnStatement.amount,
      createdAt: Date.now(),
      previousBalance: transactionOnStatement.previousBalance,
      blinded: true,
    };

    await api.mma.createStatementTransaction(moneyMarketAccountId, statementTransaction);

    try {
      const updateStatementTransaction: IStatementTransaction = {
        ...transactionOnStatement,
        blinded: true,
      };

      await api.statementTransaction.update(moneyMarketAccountId, updateStatementTransaction);

      const newAllStatementTransactions = store.statementTransaction.all;

      const includeNew = newAllStatementTransactions.sort((a, b) => {
        const dateA = new Date(a.asJson.date || 0);
        const dateB = new Date(b.asJson.date || 0);

        if (dateB.getTime() !== dateA.getTime()) {
          return dateA.getTime() - dateB.getTime();
        } else {
          const createdAtA = new Date(a.asJson.createdAt || 0);
          const createdAtB = new Date(b.asJson.createdAt || 0);

          return createdAtA.getTime() - createdAtB.getTime();
        }
      });

      const modifiedTransactions = [includeNew[0]];

      for (let i = 1; i < includeNew.length; i++) {
        const previousBalance = includeNew[i - 1].asJson.balance;
        const currentTransaction = includeNew[i];
        currentTransaction.asJson.previousBalance = previousBalance;
        if (
          currentTransaction.asJson.transaction === "deposit" ||
          currentTransaction.asJson.transaction === "switchTo"
        ) {
          currentTransaction.asJson.balance =
            previousBalance + currentTransaction.asJson.amount;
        } else if (
          currentTransaction.asJson.transaction === "withdrawal" ||
          currentTransaction.asJson.transaction === "switchFrom"
        ) {
          currentTransaction.asJson.balance =
            previousBalance - currentTransaction.asJson.amount;
        }
        modifiedTransactions.push(currentTransaction);
        api.statementTransaction.update(
          moneyMarketAccountId,
          currentTransaction.asJson
        );
      }
      try {
        const accountId = accountNumber(moneyMarketAccountId, store);
        if (accountId) {
          const account = store.mma.all.find(
            (account) => account.asJson.id === accountId
          );

          if (account) {
            await onReAlign(accountId);
            await api.switch.updateStatusToDeleted(transactionOnStatement.id);
          }
        }
      } catch (error) { }
    } catch (error) { }
  } catch (error) { }
};

export const switchCorrection = (fromAccountNumber: string, toAccountNumber: string, api: AppApi,
  store: AppStore, remark: string, statementTransaction: IStatementTransaction) => {

  const moneyMarketAccounts = store.mma.all;

  const fromAccount = moneyMarketAccounts.find(account => account.asJson.accountNumber === fromAccountNumber);
  const toAccount = moneyMarketAccounts.find(account => account.asJson.accountNumber === toAccountNumber);

  if (fromAccount && toAccount) {
  }
}
