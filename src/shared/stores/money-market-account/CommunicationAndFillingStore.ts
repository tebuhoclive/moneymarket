import { runInAction } from "mobx";
import CommunicationAndFilingModel, { ICommunicationAndFiling } from "../../models/money-market-account/CommunicationAndFiling";
import AppStore from "../AppStore";
import Store from "../Store";

export default class CommunicationAndFilingStore extends Store<
ICommunicationAndFiling,
  CommunicationAndFilingModel
> {
  items = new Map<string, CommunicationAndFilingModel>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: ICommunicationAndFiling[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new CommunicationAndFilingModel(this.store, item))
      );
    });
  }
}
