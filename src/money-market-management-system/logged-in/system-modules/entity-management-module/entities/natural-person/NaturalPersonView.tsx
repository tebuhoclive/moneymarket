import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import NaturalPersonViewTabs from "./NaturalPersonViewTabs";
import { LoadingEllipsis } from "../../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../../shared/functions/Context";
import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import { PersonalDetails } from "./info-groups/PersonalDetails";
import { BankAccountDetails, ClientAddressContactDetail, ClientRelatedParty } from "./info-groups/OtherClientForms";
import BackButton from "../../../../../../shared/components/back-button/BackButton";
import Modal from "../../../../../../shared/components/Modal";
import MODAL_NAMES from "../../../../dialogs/ModalName";
import UpdateClientInformationModal from "../../../../dialogs/natural-person/natural-person-update/UpdateClientInformation";
import { NaturalPersonAuditTrailGrid } from "./NaturalPersonAuditTrailGrid";
import { MoneyMarketAccountsGrid } from "../../../money-market-account-module/MoneyMarketAccountsGrid";

const NaturalPersonView = observer(() => {

  const { api, store } = useAppContext();
  const { entityId } = useParams<{ entityId: string }>();

  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general-information-tab");

  const client = store.client.naturalPerson.getItemById(entityId || "");

  const moneyMarketAccounts = store.mma.all;

  const clientAccounts = moneyMarketAccounts.filter(activeAccount => activeAccount.asJson.parentEntity === entityId).map((account) => ({
    id: account.asJson.id,
    parentEntity: account.asJson.parentEntity,
    accountNumber: account.asJson.accountNumber,
    accountName: account.asJson.accountName,
    accountType: account.asJson.accountType,
    clientRate: account.asJson.clientRate,
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
    return clientAccounts.sort((a, b) => {
      const accountNumberA = parseInt(a.accountNumber.slice(1), 10);
      const accountNumberB = parseInt(b.accountNumber.slice(1), 10);
      return accountNumberA - accountNumberB;
    });
  }, [clientAccounts]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await api.client.naturalPerson.getById(entityId || "");
        setLoading(false);
      } catch (error) { }
      setLoading(false);
    };
    loadAll();
  }, [api.client.naturalPerson, entityId]);

  return (
    <div className="purchases view-modal uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title={client?.asJson.entityDisplayName}
            rightControls={
              <div className="">
                <BackButton />
              </div>
            }
          />
          <Toolbar
            rightControls={
              <NaturalPersonViewTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            }
          />
          <hr />
        </div>
        <div className="page-main-card uk-card uk-card-body">
          {!loading &&
            <>
              {
                selectedTab === "general-information-tab" && client &&
                <PersonalDetails
                  client={client.asJson}
                />
              }

              {
                selectedTab === "contact-details-tab" && client &&
                <ClientAddressContactDetail
                  client={client.asJson}
                />
              }
              {
                selectedTab === "banking-details-tab" && client &&
                <BankAccountDetails
                  client={client.asJson}
                />
              }
              {
                selectedTab === "related-parties-tab" && client &&
                <ClientRelatedParty
                  client={client.asJson}
                />
              }
              {
                selectedTab === "money-market-account-tab" && client &&
                <MoneyMarketAccountsGrid data={sortedActiveAccounts}/>
              }
              {
                selectedTab === "audit-trail-tab" && client &&
                <NaturalPersonAuditTrailGrid data={[]} />
              }
            </>
          }
          {
            loading && <LoadingEllipsis />
          }
        </div>
      </div>
      <Modal modalId={MODAL_NAMES.ADMIN.UPDATE_NATURAL_PERSON_CLIENT_INFORMATION_MODAL}>
        <UpdateClientInformationModal />
      </Modal>
    </div>
  );
});

export default NaturalPersonView;