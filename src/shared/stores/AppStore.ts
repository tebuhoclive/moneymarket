//TODO: Check all the stores and clean up
import AuthStore from "./AuthStore";
import UserStore from "./UserStore";
import { MainApp } from "../models/App";
// import InstrumentStore from "./InstrumentStore";
import InstrumentCategoryStore from "./InstrumentCategoryStore";
import IssuerStore from "./IssuerStore";
import InstrumentsStore from "./InstrumentsStore";
import CounterPartyStore from "./counter-party/CounterPartyStore";
import AgentStore from "./agent/AgentStore";
import PurchasesStore from "./purchasesStore";
import SalesStore from "./SalesStore";
import ClientsStore from "./ClientsStore";
import EntityIdStore from "./EntityIdStore";
import MoneyMarketAccountStore from "./money-market-account/MoneyMarketAccountStore";
import FolderFileStore from "./FolderFileStore";
import TransactionInflowStore from "./TransactionInflowStore";
import WithdrawalTransactionStore from "./withdrawal-transaction/WithdrawalTransactionStore";
import TransactionOutflowStore from "./TransactionOutflowStore";
import SwitchTransactionStore from "./SwitchTransaction";
import ProductStore from "./ProductStore";
import DocFoxNaturalPersonStore from "./DocFoxNaturalPersonStore";
import DocFoxApplicationStore from './DocFoxApplicationsStore';
import DocFoxProfileNamesStore from "./DocFoxProfileNamesStore";
import DocFoxProfileContactsStore from "./docfox-profile/DocFoxProfileContactsStore";
import DocFoxProfileNumbersStore from "./docfox-profile/DocFoxProfileNumbersStore";
import DocFoxProfileAdditionalDetailsStore from "./docfox-profile/DocFoxProfileAdditionalDetailsStore";
import DocFoxProfileAddressesStore from "./docfox-profile/DocFoxProfileAddressesStore";
import AssetManagerFlowStore from "./AssetManagerFlowStore";
import ProductDailyInflowStore from "./ProductDailyInflowStore";
import ProductDailyInflowTransactionStore from "./ProductDailyInflowTransactionStore";
import MoneyMarketAccountInterestLogStore from "./MoneyMarketAccountInterestLogStore";
import ProductDailyPricingStore from "./ProductDailyPricingStore";
import HashCodeStore from "./hash-code-store/HashCodeStore";
import DocFoxApplicationRiskRatingsStore from "./DocFoxApplicationRiskRatingsStore";
import BatchStore from "./batches/BatchStore";
import CancelledWithdrawalTransactionStore from "./cancelled-withdrawal-transaction/CancelledWithdrawalTransactionStore";
import depositTransactionAuditStore from "./deposit-transaction/ClientDepositAllocationAuditStore";
import WithdrawalTransactionAuditStore from "./withdrawal-transaction/WithdrawalTransactionAuditStore";
import DailyStatementStore from "./DailyStatementStore";
import RecurringWithdrawalInstructionStore from "./recurring-withdrawal-instruction/RecurringWithdrawalInstructionStore";
import CounterPartyOnboardAuditStore from "./counter-party/CounterPartyAuditStore";
import AgentOnboardAuditStore from "./agent/AgentOnboardAuditStore";
import StatementTransactionStore from "./StatementTransactionStore";
import MonthEndRunStore from "./MonthEndRunStore";
import CloseOutDistributionStore from "./close-outs/CloseOutStore";
import SwitchAuditStore from "./SwitchAuditStore";
import RecurringWithdrawalBalanceReportStore from "./recurring-withdrawal-instruction/RecurringBalanceReportStore";
import EarlyDistributionStore from "./EarlyDistributionStore";
import StatementTrackerStore from "./statement-tracker/StatementTrackerStore";
import StakeholderStore from "./StakeholderStore";
import StakeholderIdStore from "./StakeholderIdStore";
import CommunicationAndFillingStore from "./money-market-account/CommunicationAndFillingStore";
import ProductRateChangeHistoryStore from "./ProductRateChangeHistoryStore";
import AccountRateChangeHistoryStore from "./AccountRateChangeHistoryStore";
import DepositTransactionStore from "./deposit-transaction/DepositTransactionStore";
import WithdrawalSettingsStore from './WithdrawalSettingsStore';
import CessionStore from "./cession/CessionStore";
import CessionAuditTrailStore from "./cession/CessionAuditTrailStore";


export default class AppStore {
  app: MainApp;

  //! Started by Werner, but not fully tested
  auth = new AuthStore(this);
  user = new UserStore(this);
  category = new InstrumentCategoryStore(this);
  issuer = new IssuerStore(this);
  instruments = new InstrumentsStore(this);
  purchase = new PurchasesStore(this);


  client = new ClientsStore(this);
  stakeholder = new StakeholderStore(this);

  counterParty = new CounterPartyStore(this);
  agent = new AgentStore(this);
  entityId = new EntityIdStore(this);
  stakeholderId = new StakeholderIdStore(this);

  dailyStatement = new DailyStatementStore(this);
  recuralWithdrawalBalanceReport = new RecurringWithdrawalBalanceReportStore(this);
  folderFile = new FolderFileStore(this);
  earlyDistribution = new EarlyDistributionStore(this);

  //! Started by Werner, but not done
  sale = new SalesStore(this);

  //* What I added
  product = new ProductStore(this);
  productRateChangeHistory = new ProductRateChangeHistoryStore(this);
  productDailyPricing = new ProductDailyPricingStore(this);
  productDailyInFlow = new ProductDailyInflowStore(this);
  productDailyInFlowTransaction = new ProductDailyInflowTransactionStore(this);

  mma = new MoneyMarketAccountStore(this);
  accountRateChangeHistory = new AccountRateChangeHistoryStore(this);
  statementTransaction = new StatementTransactionStore(this);
  monthEndRun = new MonthEndRunStore(this);
  mmaInterestLog = new MoneyMarketAccountInterestLogStore(this);

  depositTransaction = new DepositTransactionStore(this);
  depositTransactionAudit = new depositTransactionAuditStore(this);
  counterPartyOnboardAuditStore = new CounterPartyOnboardAuditStore(this);
  agentOnboardAuditStore = new AgentOnboardAuditStore(this);
  closeOutStore = new CloseOutDistributionStore(this);

  communication = new CommunicationAndFillingStore(this);

  withdrawalTransaction = new WithdrawalTransactionStore(this);
  withdrawalTransactionAudit = new WithdrawalTransactionAuditStore(this);

  recurringWithdrawalInstruction = new RecurringWithdrawalInstructionStore(this);

  batches = new BatchStore(this);

  inflow = new TransactionInflowStore(this);
  outflow = new TransactionOutflowStore(this);

  switch = new SwitchTransactionStore(this);
  switchAudit = new SwitchAuditStore(this);

  docFoxApplication = new DocFoxApplicationStore(this);
  docFoxApplicationRiskRating = new DocFoxApplicationRiskRatingsStore(this);

  docFoxProfile = new DocFoxProfileNamesStore(this);
  docFoxProfileContacts = new DocFoxProfileContactsStore(this);
  docFoxProfileNumbers = new DocFoxProfileNumbersStore(this);
  docFoxProfileAdditionalDetails = new DocFoxProfileAdditionalDetailsStore(this);
  docFoxProfileAddresses = new DocFoxProfileAddressesStore(this);

  docFox = new DocFoxNaturalPersonStore(this);

  assetManager = new AssetManagerFlowStore(this);
  //cancelled Withdrawal Transactions
  cancelledWithdrawal = new CancelledWithdrawalTransactionStore(this);

  //hash code for csv files uploaded to handle constraints on uploading the same file (stanza)
  hashCode = new HashCodeStore(this);
  statementTracker = new StatementTrackerStore(this);

  withdrawalSettings = new WithdrawalSettingsStore(this);

  cessionInstruction = new CessionStore(this);
  cessionInstructionAuditTrail = new CessionAuditTrailStore(this);

  constructor(app: MainApp) {
    this.app = app;
  }
}
