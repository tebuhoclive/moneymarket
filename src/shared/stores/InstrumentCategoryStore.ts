import Store from "./Store";
import AppStore from "./AppStore";
import { runInAction } from "mobx";
import InstrumentCategory, { IInstrumentCategory } from "../models/InstrumentCategory";

export default class InstrumentCategoryStore extends Store<IInstrumentCategory, InstrumentCategory> {
  items = new Map<string, InstrumentCategory>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IInstrumentCategory[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new InstrumentCategory(this.store, item))
      );
    });
  }
}
