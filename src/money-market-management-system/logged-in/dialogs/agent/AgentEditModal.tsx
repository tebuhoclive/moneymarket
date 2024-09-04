import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import { IAgent, defaultAgent } from "../../../../shared/models/clients/agent/AgentModel";

import { allBanks } from "../../../../shared/functions/Banks";

import InstructionFileUploader from "../../../../shared/components/instruction-file-upload/InstructionFileUploader";

const AgentEditModal = observer(() => {
  const { api, store } = useAppContext();
  const [agent, setAgent] = useState<IAgent>({ ...defaultAgent });
  const [loading, setLoading] = useState(false);
  const [instructionFileURL, setInstructionFileURL] = useState("");
  const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");

  interface IBank {
    name: string;
    code: string;
    country: string;
  }
  const [selectedBank, setSelectedBank] = useState<IBank | null>(null);

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankName = event.target.value;
    const bank = allBanks.find((b) => b.name === selectedBankName);
    setSelectedBank(bank || null);
    setAgent((prevAgent) => ({
      ...prevAgent,
      status: "Pending",
      transactionAction: "Verified",
      support: instructionFileURL,
      reasonForNoInstruction: reasonForNoAttachment,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAgent((prevAgent) => ({
      ...prevAgent,
      [name]: value,
      status: "Pending",
      transactionAction: "Edited",
      support: instructionFileURL,
      reasonForNoInstruction: reasonForNoAttachment,
    }));
  };

  const handleInstructionFileUpload = (url: string) => {
    setInstructionFileURL(url);
    setAgent((prevAgent) => ({
      ...prevAgent,
      support: instructionFileURL,
    }));
  };

  const handleReasonForNoAttachment = (reason: string) => {
    setReasonForNoAttachment(reason);
    setAgent((prevAgent) => ({
      ...prevAgent,
      reasonForNoInstruction: reasonForNoAttachment,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.agent.selected;

    const agentDetails: IAgent = {
      ...agent,
      bankName: selectedBank?.name || "",
      branchCode: selectedBank?.code || "",
    };

    if (selected) await update(agentDetails);
    else await create(agentDetails);

    setLoading(false);
    onCancel();
    hideModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
  };

  //!Agents Not being verified
  // const onVerifyAgent = async () => {
  //   setLoading(true);

  //   setAgent((prevAgent) => ({
  //     ...prevAgent,
  //     status: "Verified",
  //   }));
  //   if (agent.status === "Verified") {
  //   } else {
  //   }
  //   try {
  //     await update(agent);
  //     swal({
  //       icon: "success",
  //       text: "Agent Verified",
  //     });
  //   } catch (error) {}
  //   setLoading(false);
  //   onCancel();
  //   hideModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
  // };

  const update = async (newAgent: IAgent) => {

    try {
      await api.agent.updateAndCreateAuditTrail(
        agent,
        newAgent
      );
    } catch (error) { }
  };

  const create = async (agent: IAgent) => {
    try {
      await api.agent.create(agent);
    } catch (error) { }
  };

  const onCancel = () => {
    store.agent.clearSelected();
    setAgent({ ...defaultAgent });
    hideModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
    hideModalFromId(MODAL_NAMES.ADMIN.AGENT_EDIT_MODAL);
  };

  useEffect(() => {
    if (store.agent.selected) {
      setAgent(store.agent.selected);
    }
  }, [store.agent.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="main-title-sm text-to-break">New Agent</h3>
      <hr />
      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}
        >
          <div className="uk-width-1-1">
            <label
              className="uk-form-label required"
              htmlFor="counterParty-fname"
            >
              Agent Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-fname"
                type="text"
                placeholder="Agent Name "
                value={agent.agentName}
                onChange={handleInputChange}
                name="agentName" // Add name attribute
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bankSelect">
              Select a bank:
            </label>
            <select
              className="uk-select"
              id="bankSelect"
              onChange={handleBankChange}
            >
              <option value="">-- Select Bank --</option>
              {allBanks.map((bank) => (
                <option key={bank.name} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
          <div className="uk-width-1-1">
            <label
              className="uk-form-label required"
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
                title="Account number should at least be 8 numbers"
                value={agent.accountNumber}
                pattern="\d{8,14}"
                maxLength={13}
                onChange={handleInputChange}
                name="accountNumber" // Add name attribute
                required
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label" htmlFor="counterParty-branch">
              Branch Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-branch"
                type="text"
                placeholder="Branch"
                value={agent.branch}
                onChange={handleInputChange}
                name="branch" // Add name attribute
                required
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label required" htmlFor="bankCode">
              Universal Branch Code:
            </label>
            <input
              className="uk-input"
              id="bankCode"
              type="text"
              value={selectedBank?.code || ""}
              readOnly
            />
          </div>

          <div className="uk-width-1-2">
            <label className="uk-form-label required" htmlFor="bankCountry">
              Bank Country:
            </label>
            <input
              className="uk-input"
              id="bankCountry"
              type="text"
              value={selectedBank?.country || ""}
              readOnly
            />
          </div>
          <hr className="uk-width-1-1" />
          <InstructionFileUploader
            onFileUpload={handleInstructionFileUpload}
            onProvideReason={handleReasonForNoAttachment}
            fileUrl={agent.support}
            reasonForNotProvingFile={agent.reasonForNoInstruction}
            label="Support"
            allocation={agent.accountNumber}
            onCancel={onCancel}
          />
          <div className="uk-width-1-1 uk-text-right">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
            <button className="btn btn-danger" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AgentEditModal;
