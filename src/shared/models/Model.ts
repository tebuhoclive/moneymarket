import { toJS } from "mobx";
import AppApi from "../apis/AppApi";
import AppStore from "../stores/AppStore";

export default abstract class Model<T> {
  protected store: AppStore;
  item: T;
  api: AppApi;

  constructor(store: AppStore, item: T) {
    this.store = store;
    this.item = item;
    this.api = store.app.api;
  }

  get asJson(): T {
    return toJS(this.item);
  }

  edit(): void {
  }

  remove(): void {
  }
}

