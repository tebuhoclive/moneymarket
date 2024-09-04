import AppApi from "../../apis/AppApi";
import AppStore from "../../stores/AppStore";

import {
  getFilteredStatementCloseOutTransactions,
  getStatementTotalDays,
  getStatementTotalDistribution,
} from "./Statement";

export async function getCloseData(
  accountId: string,
  store: AppStore,
  api: AppApi,
  startDate: Date,
  endDate: Date,
  closeOutDate: number
) {
  try {
    await updateCloseData(accountId, store, api, startDate, endDate, closeOutDate);
  } catch (error) {
  }
}

export async function updateCloseData(
  accountId: string,
  store: AppStore,
  api: AppApi,
  startDate: Date,
  endDate: Date,
  closeOutDate: number,
  setLoader?: (loading: boolean) => void
) {
  try {

    await api.statementTransaction.getAll(accountId);
  } catch (error) { }

  const statementTransactions = store.statementTransaction.all.filter(notBlinded => notBlinded.asJson.blinded !== true);

  const statementTransactionsAsJson = statementTransactions.map(
    (transaction) => {
      return transaction.asJson;
    }
  );

  const filteredStatementTransactions = getFilteredStatementCloseOutTransactions(
    startDate,
    endDate,
    statementTransactionsAsJson,
    closeOutDate
  );

  const totalDays = getStatementTotalDays(filteredStatementTransactions);
  const totalDistribution = getStatementTotalDistribution(
    filteredStatementTransactions
  );

  try {
    await api.mma.updateCloseOutDaysAndInterest(
      accountId,
      totalDays,
      totalDistribution
    );
  } catch (error) {
  } finally {
  }
}
