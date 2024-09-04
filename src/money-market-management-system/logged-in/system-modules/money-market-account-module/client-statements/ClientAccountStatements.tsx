import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";

import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { IMoneyMarketAccount } from "../../../../../shared/models/money-market-account/MoneyMarketAccount";
import { ILegalEntity } from "../../../../../shared/models/clients/LegalEntityModel";
import { INaturalPerson } from "../../../../../shared/models/clients/NaturalPersonModel";
import SingleSelect from "../../../../../shared/components/single-select/SingleSelect";

import ClientAccountStatementTabs from "./ClientAccountStatementTabs";
import CorrectedClientStatement from "./client-statement-tab-items/CorrectedClientStatement";
import { CustomOpenAccordion } from "../../../../../shared/components/accordion/Accordion";
import NormalClientStatement from "./client-statement-tab-items/NormalClientStatement";
import MonthEndClientStatement from "./client-statement-tab-items/month-end-view/MonthEndClientStatement";
import NormalClientFeeStatement from "../../../../../shared/functions/transactions/month-end-report-grid/rolled-back/NormalClientFeeStatement";

const ClientAccountStatements = observer(() => {
  const { api, store } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("client-view-tab");

  const [selectedClientAccount, setSelectedClientAccount] = useState<IMoneyMarketAccount>();
  const [selectedClientProfile, setSelectedClientProfile] = useState<INaturalPerson | ILegalEntity>();

  const clients = [
    ...store.client.naturalPerson.all,
    ...store.client.legalEntity.all,
  ];

  const clientAccountOptions = store.mma.all.map((cli) => ({
    label: `${cli.asJson.accountNumber} - ${cli.asJson.accountName}`,
    value: cli.asJson.accountNumber,
  }));

  const handleClientAccountChange = (accountNumber: string) => {
    store.statementTransaction.removeAll();
    const selectedAccount = store.mma.all.find(
      (mma) => mma.asJson.accountNumber === accountNumber
    );

    if (selectedAccount) {
      store.mma.select(selectedAccount.asJson);
      const account = store.mma.selected;

      if (account) {
        setSelectedClientAccount(account);
        const client = clients.find(
          (client) => client.asJson.entityId === account.parentEntity
        );
        if (client) {
          setSelectedClientProfile(client.asJson);
        }
        return "";
      }

    }
  };

  useEffect(() => {
    const loadStatement = async () => {
      if (selectedClientAccount) {
        try {
          await Promise.all([
            api.statementTransaction.getAll(selectedClientAccount.id),
          ]);
        } catch (error) { }
      } else {
      }
    };

    loadStatement();
  }, [api.statementTransaction, selectedClientAccount]);

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title={`Client Statements`}
            rightControls={
              <div className="uk-form-controls">
                <label className="uk-form-label" htmlFor="">Client Name/Account Number</label>
                <SingleSelect
                  options={clientAccountOptions}
                  name="clientNameAccountNumber"
                  value={selectedClientAccount?.accountNumber ??""}
                  onChange={(value) => handleClientAccountChange(value)}
                  placeholder=""
                  required
                />
              </div>
            }
          />
          <hr className="uk-margin-small" />
          <CustomOpenAccordion title={`${selectedClientAccount ? `${selectedClientAccount?.accountNumber}-${selectedClientAccount?.accountName}` : 'Please Select a client account'}`}>
            <div className="uk-grid uk-grid-small" data-uk-grid>
              <hr className="uk-width-1-1" />
              <div className="uk-width-1-2">
                {selectedClientProfile && selectedClientAccount &&
                  <div className="uk-grid uk-grid-small uk-child-width-1-3" data-uk-grid>
                    <p>{selectedClientProfile.contactDetail.postalAddress}</p>
                    <p>{selectedClientProfile.contactDetail.emailAddress}</p>
                  </div>
                }
              </div>
              <div className="uk-width-1-2">
                {selectedClientProfile && selectedClientAccount &&
                  <div className="uk-grid uk-grid-small uk-child-width-1-3" data-uk-grid>
                    <p><b>Account Number:</b> {selectedClientAccount.accountNumber} </p>
                    <p><b>Product Code:</b> {selectedClientAccount.accountType} </p>
                    <p><b>Client Rate:</b> {selectedClientAccount.clientRate}</p>
                  </div>
                }
              </div>
              <hr className="uk-width-1-1" />
            </div>
          </CustomOpenAccordion>
        </div>

        <div>
          <Toolbar
            leftControls={
              <>
                {selectedTab === "client-view-tab" && <h4 className="main-title-lg">Client View</h4>}
                {selectedTab === "correction-view-tab" && <h4 className="main-title-lg">Adjusted Client View</h4>}
                {selectedTab === "fee-view-tab" && <h4 className="main-title-lg">IJG Fee View</h4>}
                {selectedTab === "month-end-view-tab" && <h4 className="main-title-lg">Month End View</h4>}
              </>

            }
            rightControls={
              <ClientAccountStatementTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            }
          />
          <hr />
          {
            selectedTab === "client-view-tab" && selectedClientAccount &&
            <NormalClientStatement moneyMarketAccountId={selectedClientAccount.id} />
          }
          {
            selectedTab === "correction-view-tab" && selectedClientAccount &&
            <CorrectedClientStatement moneyMarketAccountId={selectedClientAccount.id} />
          }

          {
            selectedTab === "fee-view-tab" && selectedClientAccount &&
            <NormalClientFeeStatement moneyMarketAccountId={selectedClientAccount.id} account={selectedClientAccount} />
          }
          {
            selectedTab === "month-end-view-tab" && selectedClientAccount &&
            <MonthEndClientStatement moneyMarketAccountId={selectedClientAccount.id} />
          }
        </div>
      </div>
    </div>
  );
});

export default ClientAccountStatements;
