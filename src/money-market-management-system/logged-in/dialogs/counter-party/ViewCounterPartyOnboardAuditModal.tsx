import {
  useEffect,
  useState,
} from "react";
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";

import { observer } from "mobx-react-lite";
import { ICounterParty, defaultCounterParty } from "../../../../shared/models/clients/counter-party/CounterPartyModel";
import { CounterPartyOnboardAuditTrailGrid } from "../../system-modules/counter-party-management-module/CounterPartyOnboardAuditGrid";

const ViewCounterPartyTransactionAuditModal = observer(() => {
  const { api, store } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [counterParty, setCounterParty] = useState<ICounterParty>({ ...defaultCounterParty });
  const [newCounterParty, setNewCounterParty] = useState<ICounterParty>({ ...defaultCounterParty });

  const counterPartyAuditTrail = store.counterPartyOnboardAuditStore.all;

  const counterPartyAudit = counterPartyAuditTrail
    .sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);

      return dateB.getTime() - dateA.getTime();
    })
    .map((c) => {
      return c.asJson;
    });


  const onCancel = () => {
    store.counterParty.clearSelected();
    setCounterParty({ ...defaultCounterParty });
    setNewCounterParty({ ...defaultCounterParty });
    // hideModalFromId(
    //   MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.ALLOCATE_TRANSACTION_MODAL
    // );
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (store.counterParty.selected) {
        setCounterParty(store.counterParty.selected);
      }
    };

    loadData()
      .then(() => {
        console.log("Counter Party data loaded successfully");
      })
      .catch(error => {
        console.error("Error loading counter party data:", error);
      });
  }, [store.counterParty.selected]);

  // useEffect(() => {
  //   const loadData = () => {
  //     const promises = [
  //       api.user.getAll(),
  //       api.counterParty.getAll()
  //     ];
  //     if (counterParty.id) {
  //       promises.push(api.counterPartyOnboardAuditApi.getAll(counterParty.id));
  //     }
  //     return Promise.all(promises);
  //   };

  //   loadData()
  //     .then(() => {
  //       console.log("Data loaded successfully");
  //     })
  //     .catch(error => {
  //       console.error("Error loading data:", error);
  //     });
  // }, [api.user, api.counterParty, api.counterPartyOnboardAuditApi, counterParty.id]);

  return (
    <ErrorBoundary>
      <div className="view-modal custom-modal-style uk-modal-dialog uk-modal-body uk-width-2-4">
        <button
          className="uk-modal-close-default"
          onClick={onCancel}
          disabled={loading}
          type="button"
          data-uk-close
        ></button>
        <h3 className="main-title-sm text-to-break">
          View Counter Party
        </h3>
        <div className="dialog-content uk-position-relative">
          <div className="uk-grid">
            <div className="uk-width-1-2">
              <div className="uk-grid">
                <div className="uk-card uk-width-1-1">
                  <div className="uk-card-body">
                    <h4>Counter Party Details</h4>
                    <div className="uk-width-1-3">
                      <p>Counter Party Name :{counterParty.counterpartyName}</p>

                    </div>
                    <hr className="uk-width-1-1" />
                    <div className="uk-width-1-3">
                      <p>Bank Name: {counterParty.bankName}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Branch: {counterParty.branch}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Account Number: {counterParty.accountNumber}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Account Holder: {counterParty.accountHolder}</p>
                    </div>
                    <hr className="uk-width-1-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="uk-card uk-card-body uk-width-1-2">
              <h4>Audit Trail</h4>
              <CounterPartyOnboardAuditTrailGrid data={counterPartyAudit} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ViewCounterPartyTransactionAuditModal;
