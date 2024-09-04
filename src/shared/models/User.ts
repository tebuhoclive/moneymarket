import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultUser: IUser = {
  uid: "",
  firstName: "",
  lastName: "",
  email: "",
  displayName: "",
  phoneNumber: "",
  emailVerified: false,
  userVerified: false,
  photoURL: "",
  createdAt: "",
  lastLoginAt: "",
  jobTitle: null,
  department: "",
  role: "User",
  password: "",
  feature: [
    {
      featureName: "Dashboard",
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    {
      featureName: "User Management",
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    {
      featureName: "Client On-Boarding",
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    {
      featureName: "Client Profile Management",
      create: false,
      read: true,
      update: false,
      delete: false,
    },

    {
      featureName: "Money Market Account Management",
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    {
      featureName: "Product Management",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Asset Manager Flows",
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    {
      featureName: "Instrument Management",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Counterparty Management",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Pricing",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Bank Reconciliation",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Client Deposits and Allocations",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Client Withdrawals and Payments",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },

    {
      featureName: "Switches",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Transfers",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Instrument Tendering/Purchase/Sales",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Instrument Purchase/Sales Processing",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Transfer to Third Parties",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Process Transfer to Third Party",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Capture Batch Transactions",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Process Batch Transactions",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "View Client Statements",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Email Client Statements",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Transaction Monitoring",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Capture Dividends/Distributions",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Process Dividends/Distributions",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
  ],
};

export interface IUser {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  userVerified: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
  department: string;
  role: string;
  jobTitle: string | null;
  devUser?: boolean;
  feature: IFeatureAccess[];
  password: string;
  linkedEntityAccount?: string;
  currentAccount?:string
}

export interface IFeatureAccess {
  featureName: SystemFeatures;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  verify?: boolean;
  authorise?: boolean;
}

export type UserRoles = "User" | "Admin" | "Super-User" | "Guest";

export type SystemFeatures =
  | "Dashboard"
  | "User Management"
  | "Client On-Boarding"
  | "Client Profile Management"
  | "Money Market Account Management"
  | "Product Management"
  | "Asset Manager Flows"
  | "Instrument Management"
  | "Counterparty Management"
  | "Pricing"
  | "Bank Reconciliation"
  | "Client Deposits and Allocations"
  | "Client Withdrawals and Payments"
  | "Switches"
  | "Transfers"
  | "Instrument Tendering/Purchase/Sales"
  | "Instrument Purchase/Sales Processing"
  | "Transfer to Third Parties"
  | "Process Transfer to Third Party"
  | "Capture Batch Transactions"
  | "Process Batch Transactions"
  | "Email Client Statements"
  | "View Client Statements"
  | "Transaction Monitoring"
  | "Capture Dividends/Distributions"
  | "Process Dividends/Distributions";

export default class User {
  private _user: IUser;

  constructor(private store: AppStore, user: IUser) {
    makeAutoObservable(this);
    this._user = user;
  }

  get asJson(): IUser {
    return toJS(this._user);
  }
}
