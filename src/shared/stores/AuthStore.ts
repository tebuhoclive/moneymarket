import { makeObservable, runInAction } from "mobx";
import AppStore from "./AppStore";
import User, { IUser } from "../models/User";

export default class AuthStore {
  protected store: AppStore;
  me: User | null = null;
  loading: boolean = true;

  constructor(store: AppStore) {
    makeObservable(this, {
      me: true,
      loading: true,
      meJson: true,
    });

    this.store = store;
  }

  // get uid
  get meJson() {
    return this.me ? this.me.asJson : null;
  }

  // get role
  get role() {
    const _role = this.me ? this.me.asJson.role : "Employee";
    return _role as
      | "Employee"
      | "Manager"
      | "General Manager"
      | "Executive"
      | "HR"
      | "Super"
      | "Admin"
      | "MD"
      | "Guest";
  }

  // get department
  get department() {
    return this.me ? this.me.asJson.department : null;
  }
  // get uid
  get meUID() {
    return this.me ? this.me.asJson.uid : null;
  }

  setLoading(loading: boolean) {
    runInAction(() => {
      this.loading = loading;
    });
  }

  logIn(item: IUser) {
    runInAction(() => {
      this.me = new User(this.store, item);
    });
  }

  logOut() {
    runInAction(() => {
      this.me = null;
    });
  }
}
