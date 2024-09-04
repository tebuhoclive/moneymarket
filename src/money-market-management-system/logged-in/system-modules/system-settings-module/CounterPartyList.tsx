import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";

import MODAL_NAMES from "../../dialogs/ModalName";

import Toolbar from "../../shared/components/toolbar/Toolbar";
import EmptyError from "./EmptyError";
import { CounterPartyItem } from "./ItemCards";

import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import CounterPartyModal from "../../dialogs/counter-party/CounterPartyModal";
import Modal from "../../../../shared/components/Modal";

const CounterPartyList = observer(() => {

  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  const newCounterParty = () => {
    showModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
  };

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Products"
            rightControls={
              <button className="btn btn-primary" onClick={newCounterParty} type="button" >
                <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                New
              </button>
            }
          />
          <hr />
        </div>
        <div className="page-main-card uk-card uk-card-default uk-card-body">
          <div className="settings-list">
            {store.counterParty.all.map((counter) => (
              <div key={counter.asJson.id}>
                <CounterPartyItem counter={counter.asJson} />
              </div>
            ))}
            {loading && <LoadingEllipsis />}
            {!store.counterParty.all.length &&
              <EmptyError errorMessage="Looks empty here" />}
          </div>
        </div>
      </div>
      <ErrorBoundary>
        <Modal modalId={MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL}>
          <CounterPartyModal />
        </Modal>
      </ErrorBoundary>
    </div>
  );
});

export default CounterPartyList;