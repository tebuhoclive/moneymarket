import AppStore from "./AppStore";
import SaleBondStore from "./sales/SaleBondStore";
import SaleEquityStore from "./sales/SaleEquityStore";
import SaleFixedDepositStore from "./sales/SaleFixedDepositStore";
import SaleTreasuryBillStore from "./sales/SaleTreasuryBillStore";
import SaleUnitTrustStore from "./sales/SaleUnitTrustStore";

export default class SalesStore {
    treasuryBill: SaleTreasuryBillStore;
    bond: SaleBondStore;
    unitTrust: SaleUnitTrustStore;
    equity: SaleEquityStore;
    fixedDeposit: SaleFixedDepositStore;

    constructor(store: AppStore) {
        this.treasuryBill = new SaleTreasuryBillStore(store);
        this.bond = new SaleBondStore(store);
        this.unitTrust = new SaleUnitTrustStore(store);
        this.equity = new SaleEquityStore(store);
        this.fixedDeposit = new SaleFixedDepositStore(store);
    }
}