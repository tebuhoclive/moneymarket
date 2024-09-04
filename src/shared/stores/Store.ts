import { makeObservable, runInAction, toJS } from "mobx";
import AppStore from "./AppStore";

export default abstract class Store<Type, Model> {
  items = new Map<string, Model>();
  selected: Type | null = null;
  protected store: AppStore;

  constructor(store: AppStore) {
    this.store = store;

    makeObservable(this, {
      items: true,
      selected: true,
      all: true,
      isEmpty: true,
    });
  }

  load(items: Type[] = []) { }

  remove(id: string) {
    runInAction(() => {
      if (toJS(this.items.has(id))) this.items.delete(id);
    });
  }

  removeAll() {
    runInAction(() => {
      this.items.clear();
    });
  }
  
  getItemById(id: string) {
    const item = this.items.get(id);
    if (toJS(item)) return item;
    return undefined;
  }

  get all() {
    return Array.from(toJS(this.items.values()));
  }

  get isEmpty() {
    return toJS(this.items.size) === 0;
  }

  select(item: Type) {
    runInAction(() => {
      this.selected = item;
    });
  }

  clearSelected() {
    runInAction(() => {
      this.selected = null;
    });
  }
}
