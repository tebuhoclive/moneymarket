import MoneyMarketAccountModel from "../models/money-market-account/MoneyMarketAccount";

export interface IProductUpdate {
    newBaseRate: number,
    accounts: MoneyMarketAccountModel[] 
}