import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import { ICounterParty, defaultCounterParty } from "../../../../shared/models/clients/counter-party/CounterPartyModel";
import swal from "sweetalert";
import InstructionFileUploader from "../../../../shared/components/instruction-file-upload/InstructionFileUploader";

const CounterPartyModal = observer(() => {

  const { api, store } = useAppContext();
  const [counterParty, setCounterParty] = useState<ICounterParty>({ ...defaultCounterParty });
  const [loading, setLoading] = useState(false);


  const [instructionFileURL, setInstructionFileURL] = useState("");
  const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
  const handleInstructionFileUpload = (url: string) => {
    // Handle the URL in the parent component
    setInstructionFileURL(url);
  };
  const handleReasonForNoAttachment = (reason: string) => {
    // Handle the URL in the parent component
    setReasonForNoAttachment(reason);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.counterParty.selected;
    const counterPartyDetails: ICounterParty = {
      ...counterParty,
      reasonForNoInstruction: reasonForNoAttachment,
      support:instructionFileURL,
    };
    if (selected) await update(counterPartyDetails);
    else await create(counterPartyDetails);

    setLoading(false);
    onCancel();
  };

  //!CounterParty Not being verified
  const onVerifyParty = async () => {
    setLoading(true);
  
    // Update the counter party status to "Verified" locally
    await setCounterParty((prevParty) => ({
      ...prevParty,
      status: "Verified",
      transactionAction:"Verified",
      reasonForNoInstruction: reasonForNoAttachment,
      support:instructionFileURL,
    }));
  
    const selected = store.counterParty.selected;
  
    // Check if a counter party is selected
    if (selected) {
      // If a counter party is selected, update its status in the store
      selected.status = "Verified";
      await update(counterParty);
      swal({
        icon: "success",
        text: "Counter Party Verified",
      });
    } else {
      // If no counter party is selected, create a new one
      await create(counterParty);
      swal({
        icon: "success",
        text: "Counter Party Created",
      });
    }
  
    setLoading(false);
    onCancel();
    hideModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
  };
  
  
  
  const update = async (newCounterParty: ICounterParty) => {
    try {
      await api.counterParty.updateAndCreateAuditTrail(
        counterParty,
        newCounterParty
      );
    //  await api.counterParty.update(counterParty);
    } catch (error) {
    }
  };

  const create = async (counterParty: ICounterParty) => {
    try {
      await api.counterParty.create(counterParty);
    } catch (error) { }
  };

  const onCancel = () => {
    store.counterParty.clearSelected();
    setCounterParty({ ...defaultCounterParty });
    hideModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
    hideModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_EDIT_MODAL);
  };

  useEffect(() => {
    if (store.counterParty.selected) {
      setCounterParty(store.counterParty.selected);
    }
  }, [store.counterParty.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">{store.counterParty.selected ? counterParty.counterpartyName : "Counter Party"}</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="counterParty-fname">
              Counter Party Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-fname"
                type="text"
                placeholder="Counter Party Name "
                value={counterParty.counterpartyName}
                onChange={(e) =>
                  setCounterParty({ ...counterParty, counterpartyName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="bankName-fname">
              Bank Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="bankName-fname"
                type="text"
                placeholder="Issuer Name"
                value={counterParty.bankName}
                onChange={(e) =>
                  setCounterParty({ ...counterParty, bankName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="counterParty-branch">
              Branch
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-branch"
                type="text"
                placeholder="branch"
                value={counterParty.branch}
                onChange={(e) =>
                  setCounterParty({ ...counterParty, branch: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="counterParty-accountNumber">
              Account Number
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-accountNumber"
                type="text"
                placeholder="Account Number"
                value={counterParty.accountNumber}
                onChange={(e) =>
                  setCounterParty({ ...counterParty, accountNumber: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="counterParty-accountHolder">
              Account Holder
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-accountHolder"
                type="text"
                placeholder="Account Holder"
                value={counterParty.accountHolder}
                onChange={(e) =>
                  setCounterParty({ ...counterParty, accountHolder: e.target.value })
                }
                required
              />
            </div>
          </div>
          <InstructionFileUploader
                    onFileUpload={handleInstructionFileUpload}
                    onProvideReason={handleReasonForNoAttachment}
                    fileUrl={counterParty.support}
                    reasonForNotProvingFile={
                      counterParty.reasonForNoInstruction
                    }
                    label="Support"
                    allocation={counterParty.accountNumber}
                    onCancel={onCancel}
                  />
          <div className="uk-width-1-1 uk-text-right">
          {counterParty.id.length != 0 && (
              <>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={onVerifyParty}
                >
                  Verify
                </button>
              </>
            )}
            {counterParty.id.length === 0 && (
              <>
                <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                Save {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
              </>
              
            )}
               <button className="btn btn-danger" type="button" onClick={onCancel} >
                Cancel
              </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default CounterPartyModal;
