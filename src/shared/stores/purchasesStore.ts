import AppStore from "./AppStore";
import PurchaseEquityStore from "./purchases/equity/PurchaseEquityStore";
import PurchaseFixedDepositStore from "./purchases/fixed-deposit/PurchaseFixedDepositStore";
import PurchaseUnitTrustStore from "./purchases/unit-trust/PurchaseUnitTrustStore";
import MoneyMarketPurchaseStore from "./purchases/MoneyMarketPurchaseStore";
import BondDeskDealingStore from "./purchases/bonds/BondDeskDealingStore";
import PurchaseBondAllocationStore from "./purchases/bonds/PurchaseBondAllocationStore";
import PurchaseBondTransactionStore from "./purchases/bonds/PurchaseBondTransactionStore";
import PurchaseBondHoldingStore from "./purchases/bonds/PurchaseBondHoldingStore";
import PurchaseBondExecutionStore from "./purchases/bonds/PurchaseBondExecutionStore";
import TreasuryBillDeskDealingStore from "./instruments/treasury-bill/TreasuryBillDeskDealingStore";
import PurchaseBondStore from "./purchases/bonds/PurchaseBondStore";
import PurchaseTreasuryBillAllocationStore from "./purchases/treasury-bill/PurchaseTreasuryBillAllocationStore";
import PurchaseTreasuryBillExecutionStore from "./purchases/treasury-bill/PurchaseTreasuryBillExecutionStore";
import PurchaseTreasuryBillHoldingStore from "./purchases/treasury-bill/PurchaseTreasuryBillHoldingStore";
import PurchaseTreasuryBillStore from "./purchases/treasury-bill/PurchaseTreasuryBillStore";
import PurchaseTreasuryBillTransactionStore from "./purchases/treasury-bill/PurchaseTreasuryBillTransactionStore";
import PurchaseUnitTrustAllocationStore from "./purchases/unit-trust/PurchaseUnitTrustAllocationStore";
import UnitTrustDeskDealingStore from "./purchases/unit-trust/UnitTrustDeskDealingStore";
import PurchaseUnitTrustExecutionStore from "./purchases/unit-trust/UnitTrustExecutionStore";
import PurchaseUnitTrustHoldingStore from "./purchases/unit-trust/UnitTrustHoldingStore";
import PurchaseUnitTrustTransactionStore from "./purchases/unit-trust/UnitTrustTransactionStore";
import EquityDeskDealingStore from "./purchases/equity/EquityDeskDealingStore";
import PurchaseEquityExecutionStore from "./purchases/equity/EquityExecutionStore";
import PurchaseEquityHoldingStore from "./purchases/equity/EquityHoldingStore";
import PurchaseEquityTransactionStore from "./purchases/equity/EquityTransactionStore";
import PurchaseEquityAllocationStore from "./purchases/equity/PurchaseEquityAllocationStore";
import FixedDepositDeskDealingStore from "./purchases/fixed-deposit/FixedDepositDeskDealingStore";
import PurchaseFixedDepositAllocationStore from "./purchases/fixed-deposit/PurchaseFixedDepositAllocationStore";
import PurchaseFixedDepositExecutionStore from "./purchases/fixed-deposit/PurchaseFixedDepositExecutionStore";
import PurchaseFixedDepositHoldingStore from "./purchases/fixed-deposit/PurchaseFixedDepositHoldingStore";
import PurchaseFixedDepositTransactionStore from "./purchases/fixed-deposit/PurchaseFixedDepositTransactionStore";
import PurchaseCallDepositStore from "./purchases/call-deposit/PurchaseCallDepositStore";
import CallDepositDeskDealingStore from "./purchases/call-deposit/CallDepositDealingStore";
import PurchaseCallDepositAllocationStore from "./purchases/call-deposit/PurchaseCallDepositAllocationStore";
import PurchaseCallDepositExecutionStore from "./purchases/call-deposit/PurchaseCallDepositExecutionStore";
import PurchaseCallDepositHoldingStore from "./purchases/call-deposit/PurchaseCallDepositHoldingStore";
import PurchaseCallDepositTransactionStore from "./purchases/call-deposit/PurchaseCallDepositTransactionStore";

export default class PurchasesStore {
    treasuryBill: PurchaseTreasuryBillStore;
    treasuryBillDeskDealingSheet: TreasuryBillDeskDealingStore;
    treasuryBillAllocation: PurchaseTreasuryBillAllocationStore;
    treasuryBillTransaction: PurchaseTreasuryBillTransactionStore;
    treasuryBillHolding: PurchaseTreasuryBillHoldingStore;
    treasuryBillExecution: PurchaseTreasuryBillExecutionStore;

    bond: PurchaseBondStore;
    bondDeskDealingSheet:BondDeskDealingStore;
    bondAllocation: PurchaseBondAllocationStore;
    bondTransaction: PurchaseBondTransactionStore;
    bondHolding: PurchaseBondHoldingStore;
    bondExecution: PurchaseBondExecutionStore;

    unitTrust: PurchaseUnitTrustStore;
    unitTrustDeskDealingSheet:UnitTrustDeskDealingStore;
    unitTrustAllocation: PurchaseUnitTrustAllocationStore;
    unitTrustTransaction: PurchaseUnitTrustTransactionStore;
    unitTrustHolding: PurchaseUnitTrustHoldingStore;
    unitTrustExecution: PurchaseUnitTrustExecutionStore;

    equity: PurchaseEquityStore;
    equityDeskDealingSheet:EquityDeskDealingStore;
    equityAllocation: PurchaseEquityAllocationStore;
    equityTransaction: PurchaseEquityTransactionStore;
    equityHolding: PurchaseEquityHoldingStore;
    equityExecution: PurchaseEquityExecutionStore;

    fixedDeposit: PurchaseFixedDepositStore;
    fixedDepositDeskDealingSheet:FixedDepositDeskDealingStore;
    fixedDepositAllocation: PurchaseFixedDepositAllocationStore;
    fixedDepositTransaction: PurchaseFixedDepositTransactionStore;
    fixedDepositHolding: PurchaseFixedDepositHoldingStore;
    fixedDepositExecution: PurchaseFixedDepositExecutionStore;

    callDeposit: PurchaseCallDepositStore;
    callDepositDeskDealingSheet:CallDepositDeskDealingStore;
    callDepositAllocation: PurchaseCallDepositAllocationStore;
    callDepositTransaction: PurchaseCallDepositTransactionStore;
    callDepositHolding: PurchaseCallDepositHoldingStore;
    callDepositExecution: PurchaseCallDepositExecutionStore;


    moneyMarket: MoneyMarketPurchaseStore;

    constructor(store: AppStore) {
        this.treasuryBill = new PurchaseTreasuryBillStore(store);
        this.treasuryBillDeskDealingSheet= new TreasuryBillDeskDealingStore(store);
        this.treasuryBillAllocation = new PurchaseTreasuryBillAllocationStore(store);
        this.treasuryBillTransaction = new PurchaseTreasuryBillTransactionStore(store);
        this.treasuryBillHolding = new PurchaseTreasuryBillHoldingStore(store);
        this.treasuryBillExecution = new PurchaseTreasuryBillExecutionStore(store);

        this.bond = new PurchaseBondStore(store);
        this.bondDeskDealingSheet = new BondDeskDealingStore(store);
        this.bondAllocation = new PurchaseBondAllocationStore(store);
        this.bondTransaction = new PurchaseBondTransactionStore(store);
        this.bondHolding = new PurchaseBondHoldingStore(store);
        this.bondExecution = new PurchaseBondExecutionStore(store);
        
        this.unitTrust = new PurchaseUnitTrustStore(store);
        this.unitTrustDeskDealingSheet = new UnitTrustDeskDealingStore(store);
        this.unitTrustAllocation = new PurchaseUnitTrustAllocationStore(store);
        this.unitTrustTransaction = new PurchaseUnitTrustTransactionStore(store);
        this.unitTrustHolding = new PurchaseUnitTrustHoldingStore(store);
        this.unitTrustExecution = new PurchaseUnitTrustExecutionStore(store);
        
        this.equity = new PurchaseEquityStore(store);
        this.equityDeskDealingSheet = new EquityDeskDealingStore(store);
        this.equityAllocation = new PurchaseEquityAllocationStore(store);
        this.equityTransaction = new PurchaseEquityTransactionStore(store);
        this.equityHolding = new PurchaseEquityHoldingStore(store);
        this.equityExecution = new PurchaseEquityExecutionStore(store);

        this.fixedDeposit = new PurchaseFixedDepositStore(store);
        this.fixedDepositDeskDealingSheet = new FixedDepositDeskDealingStore(store);
        this.fixedDepositAllocation = new PurchaseFixedDepositAllocationStore(store);
        this.fixedDepositTransaction = new PurchaseFixedDepositTransactionStore(store);
        this.fixedDepositHolding = new PurchaseFixedDepositHoldingStore(store);
        this.fixedDepositExecution = new PurchaseFixedDepositExecutionStore(store);

        this.callDeposit = new PurchaseCallDepositStore(store);
        this.callDepositDeskDealingSheet = new CallDepositDeskDealingStore(store);
        this.callDepositAllocation = new PurchaseCallDepositAllocationStore(store);
        this.callDepositTransaction = new PurchaseCallDepositTransactionStore(store);
        this.callDepositHolding = new PurchaseCallDepositHoldingStore(store);
        this.callDepositExecution = new PurchaseCallDepositExecutionStore(store);


        this.moneyMarket = new MoneyMarketPurchaseStore(store);
    }
}