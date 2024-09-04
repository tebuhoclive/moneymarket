import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";

import Toolbar from "../../shared/components/toolbar/Toolbar";

import MODAL_NAMES from "../../dialogs/ModalName";

import { CounterPartyGrid } from "./CounterPartyGrid";
import CounterPartyTabs from "./CounterPartyTabs";

import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import CounterEditPartyModal from "../../dialogs/counter-party/CounterPartyEditModal";
import CounterPartyModal from "../../dialogs/counter-party/CounterPartyModal";
import ViewCounterPartyTransactionAuditModal from "../../dialogs/counter-party/ViewCounterPartyOnboardAuditModal";
import Modal from "../../../../shared/components/Modal";

const CounterParties = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pending-tab");
  const counterPartiesPending = store.counterParty.all
    .map((party) => {
      return party.asJson;
    })
    .filter((party) => party.status === "Pending");

  const counterPartiesVerified = store.counterParty.all
    .map((party) => {
      return party.asJson;
    })
    .filter((party) => party.status === "Verified");

  const newCounterParty = () => {
    showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
  };


  return (
    <>
      <div className="page-main-card uk-card uk-card-default uk-card-body uk-padding-small">
        <Toolbar
          title="Counter Parties"
          rightControls={
            <div>
              <button className="btn btn-primary" onClick={newCounterParty} type="button">
                New Counter Party
              </button>
            </div>
          }
        />
        <hr />

        <Toolbar
          rightControls={
            <CounterPartyTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          }
        />

        <div className="uk-margin-top">
          {selectedTab === "pending-tab" && (
            <CounterPartyGrid data={counterPartiesPending} />
          )}
          {selectedTab === "verified-tab" && (
            <CounterPartyGrid data={counterPartiesVerified} />
          )}
        </div>

      </div>
      <Modal modalId={MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL}>
        <CounterPartyModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.COUNTER_PARTY_EDIT_MODAL}>
        <CounterEditPartyModal />
      </Modal>
      <Modal modalId={MODAL_NAMES.ADMIN.COUNTER_PARTY_AUDIT_MODAL}>
        <ViewCounterPartyTransactionAuditModal />
      </Modal>
    </>
  );
});

export default CounterParties;
