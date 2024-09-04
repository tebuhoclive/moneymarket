import { observer } from "mobx-react-lite";

import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import showModalFromId from "../../../../shared/functions/ModalShow";

import { useAppContext } from "../../../../shared/functions/Context";
import { MoneyMarketAccountsGrid } from "./MoneyMarketAccountsGrid";
import Modal from "../../../../shared/components/Modal";

import MODAL_NAMES from "../../dialogs/ModalName";
import TransactionsImportModal from "../../dialogs/money-market-account/import-money-market-account-transactions/TransactionsImportModal";
import MoneyMarketAccountModal from "../../dialogs/money-market-account/MoneyMarketAccountModal";
import AccountImportModalV2 from "../../dialogs/money-market-account/import-client-accounts/AccountImportModalV2";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import UpdateMoneyMarketAccountModal from "../../dialogs/money-market-account/UpdateMoneyMarketAccountModal";
import { useMemo, useState } from "react";

import BackButton from "../../../../shared/components/back-button/BackButton";
import GridFeatureUnderdevelopment from "../../../../shared/components/under-development/GridFeatureUnderdevelopment";

const MoneyMarketAccounts = observer(() => {
  const { store } = useAppContext();

  const [selectedTab, setSelectedTab] = useState("active-accounts-tab");

  const user = store.auth.meJson;
  const hasMoneyMarketAccountManagementPermission = user?.feature.some(
    (feature) =>
      feature.featureName === "Money Market Account Management" &&
      feature.create === true
  );

  const moneyMarketAccounts = store.mma.all;

  const activeAccounts = moneyMarketAccounts.filter(activeAccount => activeAccount.asJson.status === "Active").map((account) => ({
    id: account.asJson.id,
    parentEntity: account.asJson.parentEntity,
    accountNumber: account.asJson.accountNumber,
    accountName: account.asJson.accountName,
    accountType: account.asJson.accountType,
    clientRate: account.asJson.clientRate || 0,
    baseRate: account.asJson.baseRate,
    feeRate: account.asJson.feeRate,
    cession: account.asJson.cession,
    balance: account.asJson.balance,
    runningBalance: account.asJson.runningBalance,
    displayOnEntityStatement: account.asJson.displayOnEntityStatement,
    status: account.asJson.status,
    monthTotalInterest: account.asJson.monthTotalInterest,
    clientComplianceStatus: account.getClientComplianceStatus(account.asJson.parentEntity)
  }));

  const sortedActiveAccounts = useMemo(() => {
    return activeAccounts.sort((a, b) => {
      const accountNumberA = parseInt(a.accountNumber.slice(1), 10);
      const accountNumberB = parseInt(b.accountNumber.slice(1), 10);
      return accountNumberA - accountNumberB;
    });
  }, [activeAccounts]);


  const handleNewAccount = () => {
    showModalFromId(MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL);
  };

  const importAccounts = () => {
    showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ACCOUNTS_MODAL);
  };

  // const importAccountRates = () => {
  //   showModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_ACCOUNT_RATES_MODAL);
  // };

  return (
    <div className="uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Money Market Accounts"
            rightControls={
              <div className="">
                {hasMoneyMarketAccountManagementPermission && (
                  <>
                    <button className="btn btn-primary" onClick={handleNewAccount}>
                      <FontAwesomeIcon className="uk-margin-small-right" icon={faPlusCircle} />
                      New Account
                    </button>
                    <BackButton />
                    {/* <button className="btn btn-danger"
                      onClick={importAccounts}
                      type="button"
                    >
                      <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                      Import Accounts from Tasman
                    </button> */}

                    {/* <button className="btn btn-danger"
                      onClick={importAccountRates}
                      type="button"
                    >
                      <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                      Import Accounts Rates from Tasman
                    </button> */}

                  </>
                )}
              </div>
            }
          />
          <hr />

          {/* <div className="uk-margin-bottom">
            <MoneyMarketAccountTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </div> */}
        </div>

        <div className="page-main-card">
          {selectedTab === "active-accounts-tab" && <MoneyMarketAccountsGrid data={sortedActiveAccounts} />}
          {/* {selectedTab === "active-accounts-tab" && <UnLinkedMoneyMarketAccountsGrid data={sortedActiveAccounts} />} */}
          {selectedTab !== "active-accounts-tab" && <GridFeatureUnderdevelopment />}
        </div>
      </div>

      <Modal modalId={MODAL_NAMES.ADMIN.MONEY_MARKET_ACCOUNT_MODAL}>
        <MoneyMarketAccountModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.UPDATE_MONEY_MARKET_ACCOUNT_MODAL}>
        <UpdateMoneyMarketAccountModal />
      </Modal>
      {/* 
      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ACCOUNTS_MODAL}>
        <AccountImportModalV2 />
      </Modal>

      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_ACCOUNT_RATES_MODAL}>
        <AccountImportModalV2 />
      </Modal> */}

      <Modal modalId={MODAL_NAMES.DATA_MIGRATION.IMPORT_TRANSACTION_MODAL}>
        <TransactionsImportModal />
      </Modal>
    </div>
  );
});

export default MoneyMarketAccounts;
