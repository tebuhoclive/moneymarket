import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";

import Toolbar from "../../shared/components/toolbar/Toolbar";

import { AgentGrid } from "./AgentGrid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import AgentTabs from "./AgentTabs";
import Modal from "../../../../shared/components/Modal";
import { useAppContext } from "../../../../shared/functions/Context";
import showModalFromId from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../dialogs/ModalName";
import AgentEditModal from "../../dialogs/agent/AgentEditModal";
import AgentModal from "../../dialogs/agent/AgentModal";
import ViewAgentTransactionAuditModal from "../../dialogs/agent/ViewAgentOnboardAuditModal";

const AgentList = observer(() => {
  const [selectedTab, setSelectedTab] = useState("pending-tab");

  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  const agentsPending = store.agent.all
    .map((agent) => {
      return agent.asJson;
    })
    .filter((agent) => agent.status === "Pending");
  const agentsVerified = store.agent.all
    .map((agent) => {
      return agent.asJson;
    })
    .filter((agent) => agent.status === "Verified");

  const newAgent = () => {
    showModalFromId(MODAL_NAMES.ADMIN.AGENT_MODAL);
  };
  const newEntity = () => {
    showModalFromId(MODAL_NAMES.ADMIN.ENTITY_TYPE_MODAL);
  };

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            leftControls={
              <h4 className="main-title-sm">
                <FontAwesomeIcon icon={faUsers} /> Agent List
              </h4>
            }
          />
        </div>

        <div className="uk-container uk-container-expand">
          <Toolbar
           rightControls={
            <AgentTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          }
            leftControls={
              <div>
                <>
                  <button
                    className="btn btn-primary"
                    style={{ marginBottom: "10px" }}
                    onClick={newAgent}
                    type="button"
                  >
                    <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                    Add New Agent
                  </button>
                  {/* <button className="btn btn-primary" onClick={newEntity} type="button" disabled>
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                 On-Boarding (DocFox)
                </button>
                <button className="btn btn-text" onClick={newEntity} type="button" >
                  <span data-uk-icon="icon: user-plus-circle; ratio:.8"></span>{" "}
                  Import
                </button>*/}
                </>
              </div>
            }
          />
         <div className="page-main-card uk-card uk-card-default uk-card-body">
                  {selectedTab === "pending-tab" && (
                    <div className="settings-list">
                      <AgentGrid data={agentsPending} />
                    </div>
                  )}
                  {selectedTab === "verified-tab" && (
                    <div className="settings-list">
                      <AgentGrid data={agentsVerified} />
                    </div>
                  )}
                </div>
        </div>
        <Modal modalId={MODAL_NAMES.ADMIN.AGENT_MODAL}>
            <AgentModal />
          </Modal>
          <Modal modalId={MODAL_NAMES.ADMIN.AGENT_EDIT_MODAL}>
            <AgentEditModal/>
          </Modal>
          <Modal modalId={MODAL_NAMES.ADMIN.AGENT_AUDIT_MODAL}>
          <ViewAgentTransactionAuditModal/>
        </Modal>
      </div>
    </div>
  );
});

export default AgentList;
