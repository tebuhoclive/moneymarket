import { observer } from "mobx-react-lite";

import { useAppContext } from "../../../../../shared/functions/Context";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

import Toolbar, { ToolbarNew } from "../../../shared/components/toolbar/Toolbar";
import GridFeatureUnderdevelopment from "../../../../../shared/components/under-development/GridFeatureUnderdevelopment";
import AccountStatement from "./account-statements/AccountStatements";
import CommunicationAndFiling from "../communication-filing/CommunicationAndFiling";
import AccountTransactionHistory from "./account-transaction-history/AccountTransactionHistory";
import Cession from "./cessions/Cession";

const ViewClientMoneyMarketAccount = observer(() => {
  const { api, store } = useAppContext();
  const { accountId } = useParams<{ accountId: string }>();

  const [selectedTab, setSelectedTab] = useState("general-information");
  const [loading, setLoading] = useState(false);

  const account = store.mma.getItemById(accountId || "");
  const accountSession = store.cessionInstruction.all.map(t => { return t.asJson });

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([
          api.mma.getById(accountId || ""),
          api.depositTransaction.getAll(),
          api.withdrawalTransaction.getAll(),
          api.switch.getAll(),
          api.cessionInstruction.getAll(accountId || "")
        ]);
        setLoading(false);
      } catch (error) { }
    };
    loadAll();
  }, [accountId, api.depositTransaction, api.withdrawalTransaction, api.mma, api.switch, api.cessionInstruction]);


  return (
    <>
      {account && (
        <div className="uk-section uk-section-small">
          {loading ? (
            <LoadingEllipsis />
          ) : (
            <div className="uk-container uk-container-expand">
              <div className="sticky-top">
                <ToolbarNew
                  title={
                    <>
                      <h4 className="main-title-md">{`Money Market Account: ${account.asJson.accountNumber}`}</h4>
                      <h4 className="main-title-sm uk-margin-remove">{account.getEntityDisplayName(account.asJson.parentEntity) || 'Unlinked Account'}</h4>
                    </>
                  }
                  rightControls={
                    <>
                      <button className={`btn ${selectedTab === "statements" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("statements")}>
                        Statement
                      </button>
                      <button className={`btn ${selectedTab === "tax-certificate" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("tax-certificate")}>
                        Tax Certificate
                      </button>
                      <button className={`btn ${selectedTab === "transactions" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("transactions")}>
                        Transactions
                      </button>
                    </>
                  }
                />
                <hr />

                <div className="uk-margin-bottom">
                  <button className={`btn ${selectedTab === "general-information" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("general-information")}>
                    General Information
                  </button>

                  <button className={`btn ${selectedTab === "income-distribution" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("income-distribution")}>
                    Income Distribution
                  </button>

                  <button className={`btn ${selectedTab === "Statement" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Statement")}>
                    Transaction Limitation
                  </button>

                  <button className={`btn ${selectedTab === "withholding-tax" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("withholding-tax")}>
                    Withholding Tax
                  </button>
                  <button className={`btn ${selectedTab === "cession" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("cession")}>
                    Cession
                  </button>
                  <button className={`btn ${selectedTab === "transaction-history" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("transaction-history")}>
                    Transaction History
                  </button>
                  <button className={`btn ${selectedTab === "communication-filling" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("communication-filling")}>
                    Communication & Filing
                  </button>
                  <button className={`btn ${selectedTab === "audit-trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("audit-trail")}>
                    Audit Trail
                  </button>
                </div>

                <hr />

              </div>

              <div className="page-main-card">
                {selectedTab === "general-information" &&
                  <div className="uk-grid uk-grid-small uk-child-width-1-1 uk-margin-left" data-uk-grid>
                    <Toolbar leftControls={<h4 className="main-title-md">General Information</h4>} />
                    <hr className="uk-margin-top-remove" />
                    <div className="view-modal uk-width-1-2">
                      <div className="uk-grid uk-grid-match uk-grid-small" data-uk-grid>
                        <div className="uk-width-1-2">
                          <div className="uk-margin-bottom" >
                            <h4 className="main-title-sm uk-margin-remove">Balance</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {(account.asJson.balance)}
                            </h4>
                          </div>

                          <div className="uk-margin-bottom">
                            <h4 className="main-title-sm uk-margin-remove">Cession</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {(account.asJson.cession)}
                            </h4>
                          </div>

                          <div className="uk-margin-bottom">
                            <h4 className="main-title-sm uk-margin-remove">Available Balance</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {(
                                account.asJson.balance -
                                account.asJson.cession
                              )}
                            </h4>
                          </div>
                        </div>

                        <div className="uk-width-1-2">
                          <div className="uk-margin-bottom">
                            <h4 className="main-title-sm uk-margin-remove">Base Rate</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {account.asJson.baseRate}
                            </h4>
                          </div>
                          <div className="uk-margin-bottom">
                            <h4 className="main-title-sm uk-margin-remove">Fee</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {account.asJson.feeRate}
                            </h4>
                          </div>
                          <div className="uk-margin-bottom">
                            <h4 className="main-title-sm uk-margin-remove">Client Rate</h4>
                            <h4 className="main-title-md uk-margin-remove">
                              {(account.asJson.clientRate || 0)}
                            </h4>
                          </div>
                        </div>

                      </div>


                    </div>

                    <div className="view-modal uk-width-1-2">
                      <h4 className="main-title-md">Account Details</h4>
                      <div className="uk-grid uk-grid-small uk-padding-small">
                        <div className="uk-width-1-3">
                          <p className="uk-text-bold">Account Number:</p>
                        </div>
                        <div className="uk-width-2-3">
                          <p>{account.asJson.accountNumber}</p>
                        </div>
                        <div className="uk-width-1-3">
                          <p className="uk-text-bold">Account Name:</p>
                        </div>
                        <div className="uk-width-2-3">
                          <p>{account.asJson.accountName}</p>
                        </div>
                        <div className="uk-width-1-3">
                          <p className="uk-text-bold">Account Type:</p>
                        </div>
                        <div className="uk-width-2-3">
                          <p>
                            {account.asJson.accountType}
                          </p>
                        </div>
                        <div className="uk-width-1-3">
                          <p className="uk-text-bold">
                            Client Entity Number:
                          </p>
                        </div>
                        <div className="uk-width-2-3">
                          <p>{account.asJson.parentEntity}</p>
                        </div>
                        <div className="uk-width-1-3">
                          <p className="uk-text-bold">Client Name:</p>
                        </div>
                        <div className="uk-width-2-3">
                          <p>{account.getEntityDisplayName(account.asJson.parentEntity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {
                  selectedTab === "income-distribution" &&
                  <>
                    <Toolbar leftControls={<h4 className="main-title-md">Income Distribution</h4>} />
                    <hr className="uk-margin-top-remove" />
                    <div className="uk-margin uk-grid-small uk-child-width-auto uk-grid">
                      <label className="uk-form-label"><input className="uk-radio" type="radio" name="radio2" checked /> Re-invest</label>
                      <label className="uk-form-label"><input className="uk-radio" type="radio" name="radio2" /> Payout</label>
                    </div>
                    <button className="btn btn-danger">Edit</button>
                    <hr />
                    <Toolbar leftControls={
                      <div className="uk-form-controls">
                        <label className="uk-form-label">Distribution Period</label>
                        <input className="uk-input" type="month" name="distribution-period" />
                      </div>
                    }
                    />
                    <GridFeatureUnderdevelopment />
                  </>
                }

                {
                  selectedTab === "cession" &&
                  <Cession data={accountSession} account={account.asJson} />
                }

                {
                  selectedTab === "statements" &&
                  <AccountStatement accountId={accountId || ""} />
                }

                {
                  selectedTab === "transaction-history" &&
                  <AccountTransactionHistory account={account} />
                }
                {
                  selectedTab === "communication-filing" &&
                  <CommunicationAndFiling />
                }
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
});

export default ViewClientMoneyMarketAccount;

