import {
  clientEmail,
  clientName,
  clientPostalAddress,
  entityNumber,
} from "../../../../../shared/functions/transactions/month-end-report-grid/SimpleFunctions";
import { getProductName } from "../../../system-modules/money-market-account-module/smallFunctions";

// worker.ts
export {};

// eslint-disable-next-line no-restricted-globals
self.onmessage = (event: MessageEvent) => {
  const { moneyMarketAccounts, store } = event.data;
  const statementData = moneyMarketAccounts.map((account: any) => ({
    id: account.id,
    entityNumber: entityNumber(account.id, store),
    clientName: clientName(account.id, store),
    accountNumber: account.accountNumber,
    product: account.accountType,
    emailAddress: clientEmail(account.id, store),
    rate: account.clientRate,
    postalAddress: clientPostalAddress(account.id, store),
    instrumentName: getProductName(store, account.accountType),
  }));

  // eslint-disable-next-line no-restricted-globals
  self.postMessage(statementData);
};
