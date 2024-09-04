import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import PurchaseBondApi from "./purchases/PurchaseBondApi";
import PurchaseCallDepositApi from "./purchases/PurchaseCallDepositApi";
import PurchaseEquityApi from "./purchases/PurchaseEquityApi";
import PurchaseFixedDepositApi from "./purchases/PurchaseFixedDepositApi";
import PurchaseTreasuryBillApi from "./purchases/PurchaseTreasuryBillApi";
import PurchaseUnitTrustApi from "./purchases/PurchaseUnitTrustApi";

export default class PurchasesApi {
    treasuryBill: PurchaseTreasuryBillApi;
    bond: PurchaseBondApi;
    unitTrust: PurchaseUnitTrustApi;
    equity: PurchaseEquityApi;
    fixedDeposit: PurchaseFixedDepositApi;
    callDeposit: PurchaseCallDepositApi;
    
    constructor(api: AppApi, store: AppStore) {
        this.treasuryBill = new PurchaseTreasuryBillApi(api, store);
        this.bond = new PurchaseBondApi(api, store);
        this.unitTrust = new PurchaseUnitTrustApi(api, store);
        this.equity = new PurchaseEquityApi(api, store);
        this.fixedDeposit = new PurchaseFixedDepositApi(api, store);
        this.callDeposit = new PurchaseCallDepositApi(api,store);
    }
}