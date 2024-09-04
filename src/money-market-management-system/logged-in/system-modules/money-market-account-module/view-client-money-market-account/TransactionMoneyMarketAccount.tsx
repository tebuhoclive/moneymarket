import { observer } from "mobx-react-lite";

import { useAppContext } from "../../../../../shared/functions/Context";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";

import Toolbar from "../../../shared/components/toolbar/Toolbar";
import BackButton from "../../../../../shared/components/back-button/BackButton";
import AccountModuleTabs from "./ViewClientMoneyMarketAccountTabs";

const TransactionMoneyMarketAccount = observer(() => {
  const { api, store } = useAppContext();
  const { accountId } = useParams<{ accountId: string }>();

  const [selectedTab, setSelectedTab] = useState("general-information-tab");
  const [loading, setLoading] = useState(false);

  const account = store.mma.getItemById(accountId || "");

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([
          api.mma.getById(accountId || ""),
          api.depositTransaction.getAll(),
          api.withdrawalTransaction.getAll(),
          api.switch.getAll()
        ]);
        setLoading(false);
      } catch (error) { }
    };
    loadAll();
  }, [accountId, api.depositTransaction, api.withdrawalTransaction, api.mma, api.switch]);


  return (
    <>
      {account && (
        <div className="page uk-section uk-section-small">
          {loading ? (
            <LoadingEllipsis />
          ) : (
            <div className="uk-container uk-container-expand">
              <div className="sticky-top">
                <Toolbar
                  title={`Money Market Account: ${account.asJson.accountNumber}`}
                  rightControls={
                    <div className="">
                      <BackButton />
                    </div>
                  }
                />
                <hr />
                <Toolbar
                  leftControls={
                    <h4 className="main-title-md">{account.getEntityDisplayName(account.asJson.parentEntity) || 'Unlinked Account'}</h4>
                  }
                  rightControls={
                    <>
                      <button onClick={() => setSelectedTab("statements")} className="btn btn-primary">Statement</button>
                      <button className="btn btn-primary">Tax Certificate</button>
                      <button onClick={() => setSelectedTab("transactions")} className="btn btn-primary">Transactions</button>
                    </>
                  }
                />
                <hr />
                <div className="uk-margin-top uk-margin-bottom">
                  <AccountModuleTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                </div>

              </div>

              <div className="page-main-card uk-card uk-card-default uk-card-body mma-view">
                {selectedTab === "general-information-tab" &&
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
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
});

export default TransactionMoneyMarketAccount;

