import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";

import Toolbar from "../../shared/components/toolbar/Toolbar";
import EmptyError from "./EmptyError";
import { IssuerItem } from "./ItemCards";
import Modal from "../../../../shared/components/Modal";
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import IssuerModal from "../../dialogs/issuer/IssuerModal";


const IssuerList = observer(() => {

  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  const newIssuer = () => {
    showModalFromId(MODAL_NAMES.ADMIN.ISSUER_MODAL);
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await api.issuer.getAll();
        setLoading(false);
      } catch (error) { }
      setLoading(false);
    };
    loadAll();
  }, [api.issuer]);

  return (
    <div className="settings uk-section uk-section-small">
      <div className="uk-container uk-container-xlarge">
        <div className="settings-main-card uk-card uk-card-default uk-card-body">
          <ErrorBoundary>
            <Toolbar
              rightControls={
                <ErrorBoundary>
                  <div className="uk-flex">
                    <div>
                      <button className="btn btn-primary" onClick={newIssuer} type="button" >
                        <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                        New
                      </button>
                    </div>
                  </div>
                </ErrorBoundary>
              }
            />
            <div className="settings-list">
              <ErrorBoundary>
                {store.issuer.all.map((issuer) => (
                  <div key={issuer.asJson.id}>
                    <IssuerItem issuer={issuer.asJson} />
                  </div>
                ))}
                <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>
              </ErrorBoundary>
              <ErrorBoundary>
                {!store.issuer.all.length && <EmptyError errorMessage="Looks empty here" />}
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </div>
      </div>
      <ErrorBoundary>
        <Modal modalId={MODAL_NAMES.ADMIN.ISSUER_MODAL}>
          <IssuerModal />
        </Modal>
      </ErrorBoundary>
    </div>
  );
});

export default IssuerList;