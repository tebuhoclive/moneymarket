import AppStore from "./AppStore";
import BondStore from "./instruments/BondStore";
import CallDepositStore from "./instruments/CallDepositStore";
import EquityStore from "./instruments/EquityStore";
import FixedDepositStore from "./instruments/FixedDepositStore";
import TreasuryBillStore from "./instruments/TreasuryBillStore";
import UnitTrustStore from "./instruments/UnitTrustStore";

export default class InstrumentsStore {
    treasuryBill: TreasuryBillStore;
    bond: BondStore;
    unitTrust: UnitTrustStore;
    equity: EquityStore;
    fixedDeposit: FixedDepositStore;
    callDeposit:CallDepositStore;
    constructor(store: AppStore) {
        this.treasuryBill = new TreasuryBillStore(store);
        this.bond = new BondStore(store);
        this.unitTrust = new UnitTrustStore(store);
        this.equity = new EquityStore(store);
        this.fixedDeposit = new FixedDepositStore(store);
        this.callDeposit = new CallDepositStore(store)
    }
}