import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import BondApi from "./instruments/BondApi";
import CallDepositApi from "./instruments/CallDepositApi";
import EquityApi from "./instruments/EquityApi";
import FixedDepositApi from "./instruments/FixedDepositApi";
import TreasuryBillApi from "./instruments/TreasuryBillApi";
import UnitTrustApi from "./instruments/UnitTrustApi";

export default class InstrumentApi {
    treasuryBill: TreasuryBillApi;
    bond: BondApi;
    unitTrust: UnitTrustApi;
    equity: EquityApi;
    fixedDeposit: FixedDepositApi;
    callDeposit: CallDepositApi;
    
    constructor(api: AppApi, store: AppStore) {
        this.treasuryBill = new TreasuryBillApi(api, store);
        this.bond = new BondApi(api, store);
        this.unitTrust = new UnitTrustApi(api, store);
        this.equity = new EquityApi(api, store);
        this.fixedDeposit = new FixedDepositApi(api, store);
        this.callDeposit = new CallDepositApi(api,store);
    }
}