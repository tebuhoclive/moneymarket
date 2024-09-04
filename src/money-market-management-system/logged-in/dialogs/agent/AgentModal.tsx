import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import { IAgent, defaultAgent } from "../../../../shared/models/clients/agent/AgentModel";
import React from "react";
import swal from "sweetalert";
import { allBanks } from "../../../../shared/functions/Banks";
import InstructionFileUploader from "../../../../shared/components/instruction-file-upload/InstructionFileUploader";

const AgentModal = observer(() => {
  const { api, store } = useAppContext();
  const [agent, setAgent] = useState<IAgent>({ ...defaultAgent });
  const [loading, setLoading] = useState(false);

  interface IBank {
    name: string;
    code: string;
    country: string;
  }
  const [selectedBank, setSelectedBank] = useState<IBank | null>(null);

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBankName = event.target.value;
    const bank = allBanks.find(b => b.name === selectedBankName);
    setSelectedBank(bank || null);
  };


  const [instructionFileURL, setInstructionFileURL] = useState("");
  const [reasonForNoAttachment, setReasonForNoAttachment] = useState("");
  const handleInstructionFileUpload = (url: string) => {
    setInstructionFileURL(url);
  };
  const handleReasonForNoAttachment = (reason: string) => {
    setReasonForNoAttachment(reason);
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.agent.selected;

    const agentDetails: IAgent = {
      ...agent,
      bankName: selectedBank?.name || "",
      branchCode: selectedBank?.code || "",
      reasonForNoInstruction: reasonForNoAttachment,
      support:instructionFileURL,
    }

    if (selected) await update(agentDetails);
    else await create(agentDetails);

    setLoading(false);
    onCancel();
  };
  //!Agents Not being verified
  const onVerifyAgent = async () => {
    setLoading(true);

   await setAgent((prevAgent) => ({
      ...prevAgent,
      status: "Verified",
      transactionAction:"Verified",
    }));
    const selected = store.agent.selected;
    if (selected){
      selected.status = "Verified";
      await update(agent);
      swal({
        icon: "success",
        text: "Agent Verified",
      });
    }
    setLoading(false);
    onCancel();
    hideModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
  };

  const update = async (newAgent: IAgent) => {
     
    try {
      await api.agent.updateAndCreateAuditTrail(
        agent,
        newAgent
      );
     // await api.agent.update(agent);
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
      <h3 className="main-title-sm text-to-break">
        Add new Agent
      </h3>
      <hr />
      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
          onSubmit={handleSubmit}
        >
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="counterParty-fname">
              Agent Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="counterParty-fname"
                type="text"
                placeholder="Agent Name "
                value={agent.agentName}
                onChange={(e) =>
                  setAgent({ ...agent, agentName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bankSelect">Select a bank:</label>
            <select className="uk-select" id="bankSelect" onChange={handleBankChange}>
              <option value="">-- Select Bank --</option>
              {allBanks.map(bank => (
                <option key={bank.name} value={bank.name}>{bank.name}</option>
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
                onChange={(e) =>
                  setAgent({ ...agent, accountNumber: e.target.value })
                }
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
                onChange={(e) => setAgent({ ...agent, branch: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-2">
            <label className="uk-form-label required" htmlFor="bankCode">Universal Branch Code:</label>
            <input className="uk-input" id="bankCode" type="text" value={selectedBank?.code || ''} readOnly />
          </div>

          <div className="uk-width-1-2">
            <label className="uk-form-label required" htmlFor="bankCountry">Bank Country:</label>
            <input className="uk-input" id="bankCountry" type="text" value={selectedBank?.country || ''} readOnly />
          </div>
          <InstructionFileUploader
                    onFileUpload={handleInstructionFileUpload}
                    onProvideReason={handleReasonForNoAttachment}
                    fileUrl={agent.support}
                    reasonForNotProvingFile={
                      agent.reasonForNoInstruction
                    }
                    label="Support"
                    allocation={agent.accountNumber}
                    onCancel={onCancel}
                  />
          <hr className="uk-width-1-1" />
          <div className="uk-width-1-1 uk-text-right">
            {agent.id.length !== 0 && (
              <>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={onVerifyAgent}
                >
                  Verify
                </button>
              </>
            )}
            {agent.id.length === 0 && (<>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                Save {loading && <div data-uk-spinner="ratio: .5"></div>}
              </button>
            </>)}
            <button className="btn btn-danger" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default AgentModal;
