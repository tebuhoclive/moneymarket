const MODAL_NAMES = {
  ADMIN: {
    CESSION_LOADING: "cession-loading-modal",
    ASSET_PRODUCT_MODAL: "asset-product-modal",
    UPDATE_LEGAL_BANK_MODAL: "update-legal-entity-bank",
    LIABILITY_PRODUCT_MODAL: "liability-product-modal",
    LIABILITY_PRODUCT_RATE_HIKE_MODAL: "liability-product-rate-hike-modal",
    LIABILITY_PRODUCT_RATE_DROP_MODAL: "liability-product-rate-drop-modal",
    PRODUCT_RATE_CHANGE_MODAL: "product-rate-change-modal",
    PRODUCT_MODAL: "product-modal",
    VERIFY_PRODUCT_MODAL: "verify-product-modal",
    IMPORT_PRODUCTS_MODAL: "import-products-modal",
    USER_MODAL: "user-modal",
    CLIENT_MODAL: "client-modal",
    CATEGORY_MODAL: "category-modal",
    //
    INSTRUMENT_MODAL: "instrument-modal",
    VIEW_INSTRUMENT_MODAL: "view-instrument-modal",
    INSTRUMENT_CATEGORY_MODAL: "instrument-category-modal",
    ISSUER_MODAL: "issuer-modal",

    COUNT_BATCHES: "count-batches",
    CANCEL_TRANSACTION_MODAL: "cancel-transaction-modal",

    // instruments
    FIXED_DEPOSIT_MODAL: "fixed-deposit-modal",
    EQUITY_MODAL: "equity-modal",
    UNIT_TRUST_MODAL: "unit-trust-modal",
    TREASURY_BILL_MODAL: "treasury-bill-modal",
    TREASURY_BILL_REPLACEMENT_MODAL: "treasury-bill-replacement-modal",
    BOND_REPLACEMENT_MODAL: "bond-replacement-modal",
    FIXED_DEPOSIT_REPLACEMENT_MODAL: "fixed-deposit-replacement-modal",
    BOND_MODAL: "bond-modal",

    // views
    VIEW_FIXED_DEPOSIT_MODAL: "view-fixed-deposit-modal",
    VIEW_EQUITY_MODAL: "view-equity-modal",
    VIEW_UNIT_TRUST_MODAL: "view-unit-trust-modal",
    VIEW_TREASURY_BILL_MODAL: "view-treasury-bill-modal",
    VIEW_BOND_MODAL: "view-bond-modal",

    // Instrument Holdings
    TREASURY_BILL_HOLDINGS_MODAL: "treasury-bill-holdings-modal",

    // Purchases
    PURCHASE_FIXED_DEPOSIT_MODAL: "purchase-fixed-deposit-modal",
    PURCHASE_EQUITY_MODAL: "purchase-equity-modal",
    PURCHASE_UNIT_TRUST_MODAL: "purchase-unit-trust-modal",
    PURCHASE_TREASURY_BILL_MODAL: "purchase-treasury-bill-modal",
    PURCHASE_BOND_MODAL: "purchase-bond-modal",

    // Sales
    SALE_FIXED_DEPOSIT_MODAL: "sale-fixed-deposit-modal",
    SALE_EQUITY_MODAL: "sale-equity-modal",
    SALE_UNIT_TRUST_MODAL: "sale-unit-trust-modal",
    SALE_TREASURY_BILL_MODAL: "sale-treasury-bill-modal",
    SALE_BOND_MODAL: "sale-bond-modal",
    //
    COUNTER_PARTY_MODAL: "counter-party-modal",
    COUNTER_PARTY_EDIT_MODAL: "counter-party-edit-modal",
    COUNTER_PARTY_AUDIT_MODAL: "counter-party-audit-modal",
    AGENT_MODAL: "agent-modal",
    AGENT_EDIT_MODAL: "agent-edit-modal",
    AGENT_AUDIT_MODAL: "agent-audit-modal",

    // Clients
    ENTITY_TYPE_MODAL: "entity-type-modal",
    NATURAL_PERSON_MODAL: "natural-person-entity-modal",

    LEGAL_ENTITY_MODAL: "legal-entity-modal",

    RISK_RATE_NATURAL_PERSON_MODAL: "risk-natural-person-entity-modal",
    ENTITY_APPROVAL_MODAL: "entity-approval-modal",
    UPDATE_NATURAL_PERSON_CLIENT_INFORMATION_MODAL: "update-natural-person-client-information-modal",
    UPDATE_NATURAL_PERSON_BANK_MODAL: "update-natural-person-bank-modal",

    //Stakeholders
    STAKEHOLDER_TYPE_MODAL: "stakeholder-type-modal",
    RELATED_PARTY_MODAL: "related-party-modal",

    // Accounts
    MONEY_MARKET_ACCOUNT_MODAL: "money-market-account-modal",
    UPDATE_MONEY_MARKET_ACCOUNT_MODAL: "update-money-market-account-modal",

    //
    FILE_READER_MODAL: "file-reader-modal",
  },

  BACK_OFFICE: {
    // Products
    ALL_PRODUCT_ACCOUNTS_MODAL: "all-products-accounts",
    UPDATE_PRODUCT_BASE_RATE_MODAL: "update-product-base-rate-modal",
    FIX_PRODUCT_BASE_RATE_MODAL: "fix-product-base-rate-modal",
    UPLOAD_DAILY_PRICING_MODAL: "upload-daily-pricing-modal",
    //Early distro
    CREATE_ED_ACCOUNT_MODAL: "create_ed_account-modal",
    UPDATE_INTEREST_MODAL: "update-interest-modal",
    NORMAL_STATEMENT_MODAL: "update-normal-statement-modal",
    EDIT_NORMAL_STATEMENT_MODAL: "edit-update-normal-statement-modal",
    UPDATE_INTEREST_MODAL_PROCESSED: "update-interest-modal-processed",


    // Clients
    DOC_FOX_ENTITY_TYPE_MODAL: "docfox-entity-type-modal",
    DOC_FOX_NATURAL_PERSON_MODAL: "docfox-natural-person-entity-modal",
    DOC_FOX_LEGAL_ENTITY_MODAL: "docfox-legal-entity-modal",
    DOC_FOX_SELECT_NATURAL_PERSON_MODAL: "docfox-select-natural-person-modal",

    //DEPOSITS
    BANK_STATEMENT_UPLOAD_MODAL: "bank-statement-upload-modal",
    RECORD_DEPOSIT_MODAL: "record-deposit-modal",
    RECORD_SPLIT_DEPOSIT_MODAL: "record-split-deposit-modal",
    SPLIT_DEPOSIT_MODAL: "split-deposit-modal",
    DEPOSIT_AMEND_MODAL: "amend-deposit-modal",
    RECORD_UPLOAD_MODAL: "record-upload-modal",
    RECORD_NEW_DEPOSIT_FORM_MODAL: "record-new-deposit-form-modal",
    DEPOSIT_APPROVE_FIRST_LEVEL_MODAL: "deposit-first-level-approval-modal",
    DEPOSIT_APPROVE_SECOND_LEVEL_MODAL: "deposit-second-level-approval-modal",
    VIEW_DAILY_TRANSACTION_STATEMENT_REPORT: "view-daily-transaction-statement-report",

    TRANSACTIONS: {
      SPLIT_AMEND_MODAL: "split-amend-modal",
      DEPOSIT_UNALLOCATED_TRANSACTION_VIEW: "view-unallocated-transaction-modal",
      VIEW_NON_DEPOSIT_TRANSACTION_MODAL: "view-non-deposit-transaction-modal",
      RETURN_FOR_AMENDMENT_MODAL: "return-for-amendment-modal",
      RETURN_FOR_AMENDMENT_SPLIT_MODAL: "return-for-amendment-split-modal",
      AMEND_SPLIT_TRANSACTION_MODAL: "amend-split-transaction-modal",
      AMEND_SPLIT_WITHDRAWAL_TRANSACTION_MODAL: "amend-split-withdrawal-transaction-modal",
      VIEW_SPLIT_TRANSACTION_MODAL: "view-split-transaction-modal",
      VIEW_ARCHIVE_TRANSACTION_MODAL: "view-archive-transaction-modal",
      VIEW_TRANSACTION_MODAL: "view-transaction-modal",
    },

    MONTH_END_INITIATION_MODAL: "month-end-initiation-modal",
    MONTH_END_COMPLETE_MODAL: "month-end-complete-modal",
    MONTH_END_REPORT_MODAL: "month-end-report-modal",
    MONTH_END_REPORT_MODAL_COMPLETE: "month-end-report-modal-complete",
    MONTH_END_ROLLED_BACK_MODAL: "month-end-rolled-back-modal",
    MONTH_END_BACK_MODAL: "month-end-back-modal",
    VIEW_MONTH_END_INITIATION_MODAL: "view-month-end-initiation-modal",
    VIEW_MONTH_END_ROLL_BACK: "view-month-end-roll-back",
    VIEW_MONTH_END_ROLL_SINGLE_BACK: "view-month-end-roll-single-back",
    STATEMENT_RUN: "statement-run",


    RECORD_WITHDRAWAL_RECURRING_MODAL: "record-withdrawal-recurring-modal",
    RECORD_RECURRING_WITHDRAWAL_MODAL: "record-recurring-withdrawal-modal",
    RECORD_RECURRING_EDIT_WITHDRAWAL_MODAL: "record-recurring-withdrawal-edit-modal",
    RECORD_RECURRING_VIEW_MODAL: "record-recurring-view-modal",

    TREASURY_BILL_PURCHASE_PROCESSING_MODAL: "treasury-bill-purchase-processing-modal",

    SWITCH_BETWEEN_ACCOUNTS_MODAL: "switch-between-accounts-modal",
    SWITCH_BETWEEN_ENTITIES_MODAL: "switch-between-entities-modal",
    SWITCH_BETWEEN_ENTITIES_MODAL_CLOSE_OUT: "switch-between-entities-modal-close-out",
    SWITCH_BETWEEN_ENTITIES_AMEND_MODAL: "switch-between-entities-amend-modal",
    SWITCH_BETWEEN_ENTITIES_AMEND_MODAL_CLOSE_OUT: "switch-between-entities-amend-modal-close-out",
    VIEW_SWITCH_TRANSACTION_MODAL: "view-switch-transactions-modal",
    VIEW_SWITCH_CLOSE_OUT_TRANSACTION_MODAL: "view-switch-close-out-modal",
    AMEND_SWITCH_MODAL: "amend-switch-transaction",
    RETURN_SWITCH_FOR_AMENDMENT_MODAL: "return-switch-for-amendment",
    RETURN_SWITCH_CLOSE_OUTS_FOR_AMENDMENT:"return-switch-close-out",
    BACK_DATE_SWITCH_TRANSACTION: "back-date-switch-transaction",
    DELETE_SWITCH_ENTITIES_MODAL:"delete-switch-entities-modal",
    DELETE_SWITCH_CLOSE_OUT_ENTITIES_MODAL:"delete-switch-entities-close-out-modal",
    // NEW WITHDRAWAL MODAL ID'S
    RECORD_WITHDRAWAL_MODAL: "record-withdrawal-modal",
    RECORD_WITHDRAWAL_LANDING_MODAL: "record-withdrawal-landing-modal",
    RECORD_SPLIT_WITHDRAWAL_MODAL: "record-split-withdrawal-modal",
    RETURN_WITHDRAWAL_FOR_AMENDMENT_MODAL: "return-withdrawal-for-amendment-modal",
    WITHDRAWAL_AMEND_MODAL: "amend-withdrawal-modal",
    WITHDRAWAL_TRANSACTION_FIRST_LEVEL_VIEW: "withdrawal-transaction-first-level-view",
    WITHDRAWAL_TRANSACTION_SECOND_LEVEL_VIEW: "withdrawal-transaction-second-level-view",
    WITHDRAWAL_TRANSACTION_PAYMENT_QUEUE_VIEW: "withdrawal-transaction-payment-queue-view",
    WITHDRAWAL_TRANSACTION_BATCHED_TRANSACTIONS_MODAL: "withdrawal-transaction-batched-transactions-modal",
    WITHDRAWAL_TRANSACTION_COMPLETED_VIEW: "withdrawal-transaction-completed-view",
    WITHDRAWAL_TRANSACTION_DELETED_VIEW: "withdrawal-transaction-deleted-view",
    DELETE_WITHDRAWAL_TRANSACTION_MODAL: "delete-withdrawal-transaction-modal",
    DELETE_SPLIT_WITHDRAWAL_TRANSACTION_MODAL: "delete-split-withdrawal-transaction-modal",
    // NEW WITHDRAWAL MODAL ID'S

    EXPORT_REPORT_DATA: "export-report-data",
    //new(stanza)

    //close-outs
    CLOSE_MM_ACCOUNT: "close-mm-account", //stanza
    CLOSE_MM_ACCOUNT_SWITCH: "close-mm-account-switch", //naftal
    CLOSE_OUT_VIEW__MODAL: "view-close-out-modal",
    CLOSE_OUT_EDIT__MODAL: "edit-close-out-modal",

    //switches
    DEPOSIT_TO_ASSET_MANAGER: {
      INDIVIDUAL_CORPORATE_MODAL: "deposit-individual-corporate-modal",
      CORPORATE_MODAL: "deposit-corporate-modal",
      TAX_FREE_MODAL: "deposit-individual-corporate-modal",
    },

    WITHDRAW_FROM_ASSET_MANAGER: {
      INDIVIDUAL_CORPORATE_MODAL: "withdraw-individual-corporate-modal",
      CORPORATE_MODAL: "corporate-modal",
      TAX_FREE_MODAL: "withdraw-individual-corporate-modal",
    },

    VIEW_DAILY_FLOWS_MODAL: "view-asset-manager-daily-flows-modal",
  },

  INFLOWS: {
    INDIVIDUAL_INFLOW_TRANSACTIONS_MODAL: "individual-inflow-transaction-modal",
    CORPORATE_INFLOW_TRANSACTIONS_MODAL: "corporate-inflow-transaction-modal",
    TAX_FREE_INFLOW_TRANSACTIONS_MODAL: "tax-free-inflow-transaction-modal",
  },

  OUTFLOWS: {
    INDIVIDUAL_OUTFLOW_TRANSACTIONS_MODAL: "individual-outflow-transaction-modal",
    CORPORATE_OUTFLOW_TRANSACTIONS_MODAL: "corporate-outflow-transaction-modal",
    TAX_FREE_OUTFLOW_TRANSACTIONS_MODAL: "tax-free-outflow-transaction-modal",
  },

  DATA_MIGRATION: {
    IMPORT_CLIENT_ENTITY_MODAL: "import-client-entity-modal",
    IMPORT_LEGAL_ENTITY_MODAL: "import-legal-entity-modal",
    IMPORT_CLIENT_ACCOUNTS_MODAL: "import-client-accounts-modal",
    IMPORT_TRANSACTIONS_MODAL: "import-transactions-modal",
    IMPORT_ANALYSE_MODAL: "import-analyse-modal",
    IMPORT_ACCOUNT_RATES_MODAL: "import-account-rates-modal",
    IMPORT_NATURAL_CLIENT_BANK_ACCOUNTS_MODAL: "import-natural-client-accounts-modal",
    IMPORT_TRANSACTION_MODAL: "import-transactions-modal",
  },

  OFFLINE: {
    OFFLINE_MODAL: "offline-modal",
  },
};

export default MODAL_NAMES;
