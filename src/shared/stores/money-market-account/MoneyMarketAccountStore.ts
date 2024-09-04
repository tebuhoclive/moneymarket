import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction } from "mobx";
import MoneyMarketAccountModel, {
  IMoneyMarketAccount,
} from "../../models/money-market-account/MoneyMarketAccount";

export default class MoneyMarketAccountStore extends Store<
  IMoneyMarketAccount,
  MoneyMarketAccountModel
> {
  items = new Map<string, MoneyMarketAccountModel>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IMoneyMarketAccount[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new MoneyMarketAccountModel(this.store, item))
      );
    });
  }

  allEntityAccounts(entityId: string) {
    const list = Array.from(this.items.values());
    return list.filter((item) => item.asJson.parentEntity === entityId);
  }



  allProductAccounts(accountId: string) {
    const list = Array.from(this.items.values());
    return list.filter((item) => item.asJson.accountType === accountId);
  }

  allLiabilityAccounts(accountType: string) {
    const list = Array.from(this.items.values());
    const liabilities = list.filter((item) => item.asJson.accountType);
    return liabilities
  }

  getAllLiabilityAccounts() {
    // Filter products to get liabilities
    const liabilities = this.store.product.all.filter(
      (product) => product.asJson.assetLiability === "Liability"
    );

    // Initialize an array to store liability accounts
    const liabilityAccounts: MoneyMarketAccountModel[] = [];

    // Iterate through each liability product
    liabilities.forEach((liability) => {
      // Filter money market accounts with matching accountType
      const accounts = this.store.mma.all.filter((account) => {
        return account.asJson.accountType === liability.asJson.productCode;
      });

      // Push filtered accounts into the liabilityAccounts array
      liabilityAccounts.push(
        ...accounts.filter((a) => a.asJson.status === "Active")
      );
    });

    // Return the filtered liability accounts
    return liabilityAccounts;
  }

  getAllAssetsAccounts() {
    // Filter products to get liabilities
    const liabilities = this.store.product.all.filter(
      (product) => product.asJson.assetLiability !== "Liability"
    );

    // Initialize an array to store liability accounts
    const liabilityAccounts: MoneyMarketAccountModel[] = [];

    // Iterate through each liability product
    liabilities.forEach((liability) => {
      // Filter money market accounts with matching accountType
      const accounts = this.store.mma.all.filter((account) => {
        return account.asJson.accountType === liability.asJson.productCode;
      });

      // Push filtered accounts into the liabilityAccounts array
      liabilityAccounts.push(
        ...accounts.filter((a) => a.asJson.status === "Active")
      );
    });

    // Return the filtered liability accounts
    return liabilityAccounts;
  }

  getAllLiabilityAccountsNoZeroBalances() {
    // Filter products to get liabilities
    const liabilities = this.store.product.all.filter(
      (product) => product.asJson.assetLiability === "Liability"
    );

    // Initialize an array to store liability accounts
    const liabilityAccounts: MoneyMarketAccountModel[] = [];

    // Iterate through each liability product
    liabilities.forEach((liability) => {
      // Filter money market accounts with matching accountType
      const accounts = this.store.mma.all.filter((account) => {
        return account.asJson.accountType === liability.asJson.productCode;
      });

      // Push filtered accounts into the liabilityAccounts array
      liabilityAccounts.push(
        ...accounts.filter(
          (a) => a.asJson.status === "Active" && a.asJson.balance !== 0
        )
      );
    });

    // Return the filtered liability accounts
    return liabilityAccounts;
  }

  
}
