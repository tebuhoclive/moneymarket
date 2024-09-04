import AppApi from "../../../apis/AppApi";
import { IProcessedAccount } from "../../../models/MonthEndRunModel";
import LegalEntityModel from "../../../models/clients/LegalEntityModel";
import NaturalPersonModel from "../../../models/clients/NaturalPersonModel";
import AppStore from "../../../stores/AppStore";
import swal from "sweetalert";

interface MonthEndReportInterface {
  id: string;
  accountNumber: string;
  accountName: string;
  clientName: string;
  entityNumber: string;
  interest: number;
  days: number;
  lastRate: number;
  lastBalance: number;
}

export function accountNumber(accountId: string, store: AppStore): string {
  const accountNumber = store.mma.all.find((mma) => mma.asJson.id === accountId)
    ?.asJson.accountNumber;

  if (accountNumber) {
    return accountNumber;
  } else {
    return "N/A";
  }
}

export function accountType(accountId: string, store: AppStore): string {
  const accountType = store.mma.all.find((mma) => mma.asJson.id === accountId)
    ?.asJson.accountType;

  if (accountType) {
    return accountType;
  } else {
    return "-";
  }
}

export function accountName(accountId: string, store: AppStore): string {
  const accountName = store.mma.all.find((mma) => mma.asJson.id === accountId)
    ?.asJson.accountName;

  if (accountName) {
    return accountName;
  } else {
    return "N/A";
  }
}
export function EntityNumber(accountId: string, store: AppStore): string {
  const enitty = store.mma.all.find((mma) => mma.asJson.id === accountId)
    ?.asJson.parentEntity;

  if (enitty) {
    return enitty;
  } else {
    return "N/A";
  }
}

export function clientName(accountId: string, store: AppStore): string {
  const entityNumber = EntityNumber(accountId, store);

  // Assuming these are correctly defined in the AppStore
  const naturalPerson = store.client.naturalPerson.all;
  const legalEntity = store.client.legalEntity.all;

  // Concatenate arrays of naturalPerson and legalEntity
  const clients: (NaturalPersonModel | LegalEntityModel)[] = [
    ...legalEntity,
    ...naturalPerson,
  ];

  // Find the client based on entityNumber
  const client = clients.find((c) => c.asJson.entityId === entityNumber);

  // Return the client's name if found, otherwise return "N/A"
  return client ? client.asJson.entityDisplayName : "N/A";
}
export function entityNumber(accountId: string, store: AppStore): string {
  const entityNumber = EntityNumber(accountId, store);

  // Assuming these are correctly defined in the AppStore
  const naturalPerson = store.client.naturalPerson.all;
  const legalEntity = store.client.legalEntity.all;

  // Concatenate arrays of naturalPerson and legalEntity
  const clients: (NaturalPersonModel | LegalEntityModel)[] = [
    ...legalEntity,
    ...naturalPerson,
  ];

  // Find the client based on entityNumber
  const client = clients.find((c) => c.asJson.entityId === entityNumber);

  // Return the client's name if found, otherwise return "N/A"
  return client ? client.asJson.entityId : "N/A";
}



export function clientEmail(accountId: string, store: AppStore): string {
  const entityNumber = EntityNumber(accountId, store);

  // Assuming these are correctly defined in the AppStore
  const naturalPerson = store.client.naturalPerson.all;
  const legalEntity = store.client.legalEntity.all;

  // Concatenate arrays of naturalPerson and legalEntity
  const clients: (NaturalPersonModel | LegalEntityModel)[] = [
    ...legalEntity,
    ...naturalPerson,
  ];

  // Find the client based on entityNumber
  const client = clients.find((c) => c.asJson.entityId === entityNumber);

  // Return the client's name if found, otherwise return "N/A"
  return client ? client.asJson.contactDetail.emailAddress : "N/A";
}



export function clientPostalAddress(
  accountId: string,
  store: AppStore
): string {
  const entityNumber = EntityNumber(accountId, store);

  // Assuming these are correctly defined in the AppStore
  const naturalPerson = store.client.naturalPerson.all;
  const legalEntity = store.client.legalEntity.all;

  // Concatenate arrays of naturalPerson and legalEntity
  const clients: (NaturalPersonModel | LegalEntityModel)[] = [
    ...legalEntity,
    ...naturalPerson,
  ];

  // Find the client based on entityNumber
  const client = clients.find((c) => c.asJson.entityId === entityNumber);

  // Return the client's name if found, otherwise return "N/A"
  return client ? client.asJson.contactDetail?.postalAddress || "" : "N/A";
}

export function calculateTotalInterest(
  data: MonthEndReportInterface[]
): number {
  let totalInterest = 0;
  data.forEach((item) => {
    totalInterest += item.interest;
  });
  return totalInterest;
}

export function calculateTotalBalance(data: MonthEndReportInterface[]): number {
  let totalBalance = 0;
  data.forEach((item) => {
    totalBalance += item.lastBalance;
  });
  return totalBalance;
}

export function calculateAverageRate(data: MonthEndReportInterface[]): number {
  let totalRate = 0;
  data.forEach((item) => {
    totalRate += item.lastRate;
  });
  return data.length > 0 ? totalRate / data.length : 0;
}
export function totalAccounts(data: MonthEndReportInterface[]): number {
  return data.length;
}

export async function executeRollBack(
  year: string,
  month: string,
  account: IProcessedAccount,
  setRollingBack: (loading: boolean) => void,
  api: AppApi
) {
  try {
    setRollingBack(true);
    await api.monthEndRun.rollBackAccount(year, month, account);
  } catch (error) {
    console.log("Error rolling back: ", error);
  } finally {
    setRollingBack(false);
    swal("Account Successfully Rolled Back.");
  }
}

export async function executeReInitiate(
  year: string,
  month: string,
  account: IProcessedAccount,
  setReInitiate: (loading: boolean) => void,
  api: AppApi
) {
  try {
    setReInitiate(true);
    await api.monthEndRun.rerunMonthEnd(year, month, account);
  } catch (error) {
    console.log("Error rolling back: ", error);
  } finally {
    setReInitiate(false);
    swal("Account Month End Rerun Completed.");
  }
}
