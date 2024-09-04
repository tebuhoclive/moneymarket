import AppStore from "../stores/AppStore";

import AuthApi from "./AuthApi";
import UserApi from "./UserApi";
import InstrumentCategoryApi from "./InstrumentCategoryApi";
import IssuerApi from "./IssuerApi";

import CounterPartyApi from "./counter-party/CounterPartyApi";
import AgentApi from "./agent/AgentApi";
import PurchasesApi from "./PurchasesApi";
import SalesApi from "./SalesApi";
import ClientsApi from "./ClientsApi";
import MoneyMarketAccountApi from "./money-market-account/MoneyMarketAccountApi";

import TransactionInflowApi from "./TransactionInflowApi";
import WithdrawalTransactionApi from "./withdrawal-transaction/WithdrawalTransactionApi";

import TransactionOutflowApi from "./TransactionOutflowApi";
import SwitchTransactionApi from "./SwitchTransactionApi";
import ProductApi from "./ProductApi";
import DocFoxApi from './clients/DocFoxApi';
import AssetMangerFlowApi from "./AssetMangerFlowApi";
import ProductDailyPricingApi from "./ProductDailyPricingApi";
import HashCodeApi from "./hash-code-api/HashCodeApi";
import BatchesApi from "./batches/BatchesApi";
import CancelledWithdrawalTransactionApi from "./cancellWithdrawalTransaction/CancelWithdrawalTransactionApi";
import DepositTransactionAuditApi from "./deposit-transaction/DepositTransactionAuditApi";
import ClientWithdrawalPaymentAuditApi from "./withdrawal-transaction/WithdrawalTransactionAuditApi";
import StatementTransactionApi from "./StatementTransactionApi";
import RecurringWithdrawalInstructionApi from './recurring-withdrawal-instruction/RecurringWithdrawalInstructionApi';
import AgentOnboardAuditApi from "./agent/AgentOnboardAuditApi";
import CounterPartyOnboardAuditApi from "./counter-party/CounterPartyOnboardAuditApi";
import CloseOutDistributionApi from "./close-outs/CloseOutApi";
import MonthEndRunApi from "./MonthEndRunApi";
import SwitchAuditApi from "./SwitchAuditApi";
import RecurringWithdrawalBalanceReportApi from "./recurring-withdrawal-instruction/RecurringWithdrawalBalanceReportApi";
import EarlyDistroApi from "./EarlyDistributionApi";
import StatementTrackerApi from "./statement-tracker/StatementTrackerApi";
import StakeholderApi from "./StakeholderApi";
import ProductRateChangeHistoryApi from "./ProductRateChangeHistoryApi";
import AccountRateChangeHistoryApi from "./AccountRateChangeHistoryApi";
import DepositTransactionApi from "./deposit-transaction/DepositTransactionApi";
import InstrumentApi from "./InstrumentApi";
import WithdrawalSettingsApi from "./WithdrawalSettingsApi";
import CessionInstructionApi from "./cession/CessionInstructionApi";
import CessionAuditTrailApi from "./cession/CessionAuditTrailApi";

export default class AppApi {
  /**
   * ! added by Werner, not fully tested
   * */

  auth: AuthApi;
  user: UserApi;
  docfox: DocFoxApi;
  category: InstrumentCategoryApi;
  issuer: IssuerApi;
  instruments: InstrumentApi;
  purchase: PurchasesApi;
  counterParty: CounterPartyApi;
  agent: AgentApi;
  sale: SalesApi;
  client: ClientsApi;
  stakeholder: StakeholderApi;
  hashCode: HashCodeApi; //stanza
  statementTracker: StatementTrackerApi // stanza

  mma: MoneyMarketAccountApi;
  accountRateChangeHistory: AccountRateChangeHistoryApi;


  earlyDistribution: EarlyDistroApi;

  // * I added this
  product: ProductApi;
  productRateChangeHistory: ProductRateChangeHistoryApi;
  productDailyPricing: ProductDailyPricingApi;
  statementTransaction: StatementTransactionApi;

  depositTransaction: DepositTransactionApi;
  depositTransactionAudit: DepositTransactionAuditApi;

  withdrawalTransaction: WithdrawalTransactionApi;
  withdrawalTransactionAudit: ClientWithdrawalPaymentAuditApi;

  counterPartyOnboardAuditApi: CounterPartyOnboardAuditApi;
  agentOnboardAuditApi: AgentOnboardAuditApi;
  recurringWithdrawalInstruction: RecurringWithdrawalInstructionApi;
  closeOutApi: CloseOutDistributionApi;
  monthEndRun: MonthEndRunApi;
  batches: BatchesApi;
  recurringWithdrawalReport: RecurringWithdrawalBalanceReportApi;
  inflow: TransactionInflowApi;
  outflow: TransactionOutflowApi;
  switch: SwitchTransactionApi;
  switchAudit: SwitchAuditApi;

  assetManager: AssetMangerFlowApi;

  cancelledWithdrawals: CancelledWithdrawalTransactionApi;

  withdrawalSettings: WithdrawalSettingsApi;
  cessionInstruction: CessionInstructionApi;
  cessionAuditTrail: CessionAuditTrailApi;

  constructor(store: AppStore) {
    /**
     * ! added by Werner, not fully tested
     * */


    this.auth = new AuthApi(this, store);

    this.user = new UserApi(this, store);
    this.category = new InstrumentCategoryApi(this, store);
    this.issuer = new IssuerApi(this, store);
    this.instruments = new InstrumentApi(this, store);
    this.counterParty = new CounterPartyApi(this, store);
    this.agent = new AgentApi(this, store);
    this.purchase = new PurchasesApi(this, store);
    this.sale = new SalesApi(this, store);
    this.client = new ClientsApi(this, store);
    this.stakeholder = new StakeholderApi(this, store);


    // * I added this
    this.product = new ProductApi(this, store);
    this.productRateChangeHistory = new ProductRateChangeHistoryApi(this, store);
    this.productDailyPricing = new ProductDailyPricingApi(this, store);

    this.counterPartyOnboardAuditApi = new CounterPartyOnboardAuditApi(this, store);
    this.agentOnboardAuditApi = new AgentOnboardAuditApi(this, store);

    this.mma = new MoneyMarketAccountApi(this, store);
    this.accountRateChangeHistory = new AccountRateChangeHistoryApi(this, store);
    this.statementTransaction = new StatementTransactionApi(store);

    this.depositTransaction = new DepositTransactionApi(this, store);
    this.depositTransactionAudit = new DepositTransactionAuditApi(this, store);
    this.withdrawalTransaction = new WithdrawalTransactionApi(this, store);
    this.withdrawalTransactionAudit = new ClientWithdrawalPaymentAuditApi(this, store);
    this.switchAudit = new SwitchAuditApi(this, store);
    this.switch = new SwitchTransactionApi(this, store);
    this.recurringWithdrawalInstruction = new RecurringWithdrawalInstructionApi(this, store);
    this.closeOutApi = new CloseOutDistributionApi(this, store);


    this.monthEndRun = new MonthEndRunApi(this, store)
    this.recurringWithdrawalReport = new RecurringWithdrawalBalanceReportApi(this, store);

    this.earlyDistribution = new EarlyDistroApi(this, store);

    this.batches = new BatchesApi(this, store);

    this.inflow = new TransactionInflowApi(this, store);
    this.outflow = new TransactionOutflowApi(this, store);

    this.docfox = new DocFoxApi(this, store);

    this.assetManager = new AssetMangerFlowApi(this, store);

    this.hashCode = new HashCodeApi(this, store);

    this.statementTracker = new StatementTrackerApi(this, store);

    this.cancelledWithdrawals = new CancelledWithdrawalTransactionApi(this, store);

    this.withdrawalSettings = new WithdrawalSettingsApi(this, store);

    this.cessionInstruction = new CessionInstructionApi(this, store);
    this.cessionAuditTrail = new CessionAuditTrailApi(this, store);
  }
}
