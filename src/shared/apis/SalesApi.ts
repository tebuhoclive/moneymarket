import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import SaleBondApi from "./sales/SaleBondApi";
import SaleEquityApi from "./sales/SaleEquityApi";
import SaleFixedDepositApi from "./sales/SaleFixedDepositApi";
import SaleTreasuryBillApi from "./sales/SaleTreasuryBillApi";
import SaleUnitTrustApi from "./sales/SaleUnitTrustApi";

export default class SalesApi {
    treasuryBill: SaleTreasuryBillApi;
    bond: SaleBondApi;
    unitTrust: SaleUnitTrustApi;
    equity: SaleEquityApi;
    fixedDeposit: SaleFixedDepositApi;

    constructor(api: AppApi, store: AppStore) {
        this.treasuryBill = new SaleTreasuryBillApi(api, store);
        this.bond = new SaleBondApi(api, store);
        this.unitTrust = new SaleUnitTrustApi(api, store);
        this.equity = new SaleEquityApi(api, store);
        this.fixedDeposit = new SaleFixedDepositApi(api, store);
    }
}