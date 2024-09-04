import AppApi from "../../../../../shared/apis/AppApi";

import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";

import swal from "sweetalert";
import { ACTIVE_ENV } from "../../../CloudEnv";
import { IMonthEndRun } from "../../../../../shared/models/MonthEndRunModel";

export async function rollBackMonthEnd(
  moneyMarketAccounts: IMoneyMarketAccount[],
  year: string,
  month: string,
  setLoader: (loading: boolean) => void,
  monthRunData: IMonthEndRun,
  api: AppApi
) {

  const confirmAction = await swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: ["Cancel", "Roll Back"],
    dangerMode: true,
  });

  if (!confirmAction) return;

  const monthEndData = {
    moneyMarketAccounts: moneyMarketAccounts
      .filter((a) => a.accountType === monthRunData.productCode),
    year: year,
    month: month,
  };

  setLoader(true);

  const url = `${ACTIVE_ENV.url}rollBackMonthEnd`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(monthEndData),
    });

    if (response.ok) {
      await onReAlign(monthEndData.moneyMarketAccounts);
      await api.monthEndRun.updateMonthEndRunStatusPending(year, month);
      setLoader(false);
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {

    throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
  }
}

export async function rollBackMonthEndSingleAccount(
  moneyMarketAccounts: IMoneyMarketAccount[],
  setLoader: (loading: boolean) => void,
) {

  const confirmAction = await swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: ["Cancel", "Roll Back"],
    dangerMode: true,
  });

  if (!confirmAction) return;

  const monthEndData = {
    moneyMarketAccounts: moneyMarketAccounts
  };

  setLoader(true);

  console.log("Data: ", monthEndData);

  const url = `${ACTIVE_ENV.url}rollBackSingleAccounts`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(monthEndData),
    });

    if (response.ok) {
      await onReAlign(monthEndData.moneyMarketAccounts);
      setLoader(false);
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
  }
}

export async function reRunMonthEnd(
  moneyMarketAccounts: IMoneyMarketAccount[],
  setLoader: (loading: boolean) => void,
) {

  const confirmAction = await swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: ["Cancel", "Re Run"],
    dangerMode: true,
  });

  if (!confirmAction) return;

  const monthEndData = {
    accounts: moneyMarketAccounts
  };

  setLoader(true);
  const url = `${ACTIVE_ENV.url}reRunCreateStatementTransactionSecondVersion`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(monthEndData),
    });

    if (response.ok) {
      await onReAlign(monthEndData.accounts);
      setLoader(false);
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    throw error; // Re-throw the error to be caught in handleInitiateMonthEndRun
  }


}

const onReAlign = async (accounts: IMoneyMarketAccount[]) => {
  console.log(accounts.length);

  const concurrencyLimit = 100; // Adjust the concurrency limit as needed
  const url = `${ACTIVE_ENV.url}reAlignStatement`;

  const processAccount = async (account: any) => {
    const _accountToUpdate = {
      mmaId: account.id,
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

  const processAccountsInChunks = async (accounts: any, limit: number) => {
    const chunks = [];
    for (let i = 0; i < accounts.length; i += limit) {
      chunks.push(accounts.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map((account: any) => processAccount(account)));
    }
  };

  await processAccountsInChunks(accounts, concurrencyLimit);
}
