import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import {
  ICounterParty,
  defaultCounterParty,
} from "../../../../shared/models/clients/counter-party/CounterPartyModel";
import swal from "sweetalert";
import InstructionFileUploader from "../../../../shared/components/instruction-file-upload/InstructionFileUploader";

const CounterEditPartyModal = observer(() => {
  const { api, store } = useAppContext();
  const [counterParty, setCounterParty] = useState<ICounterParty>({
    ...defaultCounterParty,
  });
  const [loading, setLoading] = useState(false);
  const [instructionFileURL, setInstructionFileURL] = useState("");
  const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");

  const handleInstructionFileUpload = (url: string) => {
    // Handle the URL in the parent component
    setInstructionFileURL(url);
    setCounterParty((prevParty) => ({
      ...prevParty,
      support: instructionFileURL,
    }));
  };

  const handleReasonForNoAttachment = (reason: string) => {
    // Handle the URL in the parent component
    setReasonForNoAttachment(reason);
    setCounterParty((prevAgent) => ({
      ...prevAgent,
      reasonForNoInstruction: reasonForNoAttachment,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCounterParty((prevCounterParty) => ({
      ...prevCounterParty,
      [name]: value,
      status: "Pending", // Ensure status is set to "Pending" on form change
      transactionAction:"Edited",
      support:instructionFileURL,
      reasonForNoInstruction: reasonForNoAttachment,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.counterParty.selected;

    if (selected) await update(counterParty);
    else await create(counterParty);

    setLoading(false);
    onCancel();
    hideModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
  };

  const onVerifyParty = async () => {
    setLoading(true);

    await setCounterParty((prevParty) => ({
      ...prevParty,
      status: "Verified",
    }));

    try {
      await update(counterParty);
      swal({
        icon: "success",
        text: "Counter Party Verified",
      });
    } catch (error) {}
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
    } catch (error) {}
  };

  const create = async (counterParty: ICounterParty) => {
    try {
      await api.counterParty.create(counterParty);
    } catch (error) {}
  };

  const onCancel = () => {
    store.counterParty.clearSelected();
    setCounterParty({ ...defaultCounterParty });
    hideModalFromId(MODAL_NAMES.ADMIN.COUNTER_PARTY_MODAL);
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
      <h3 className="uk-modal-title text-to-break">
        {store.counterParty.selected
          ? counterParty.counterpartyName
          : "Counter Party"}
      </h3>
      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}
        >
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
                name="counterpartyName"
                value={counterParty.counterpartyName}
                onChange={handleInputChange}
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
                name="bankName"
                value={counterParty.bankName}
                onChange={handleInputChange}
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
                name="branch"
                value={counterParty.branch}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label
              className="uk-form-label"
              htmlFor="counterParty-accountNumber"
            >
              Account Number
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-accountNumber"
                type="text"
                placeholder="Account Number"
                name="accountNumber"
                value={counterParty.accountNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label
              className="uk-form-label"
              htmlFor="counterParty-accountHolder"
            >
              Account Holder
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-accountHolder"
                type="text"
                placeholder="Account Holder"
                name="accountHolder"
                value={counterParty.accountHolder}
                onChange={handleInputChange}
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
            <>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                Save {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
            </>
            <button className="btn btn-danger" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default CounterEditPartyModal;
