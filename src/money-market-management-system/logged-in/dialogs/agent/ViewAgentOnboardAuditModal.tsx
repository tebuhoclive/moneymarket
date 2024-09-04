import {  useEffect,  useState} from "react";
import ErrorBoundary from "../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../shared/functions/Context";
import { observer } from "mobx-react-lite";
import { IAgent, defaultAgent } from "../../../../shared/models/clients/agent/AgentModel";
import { AgentOnboardAuditTrailGrid } from "../../system-modules/agent-module/AgentOnboardAuditTrailGrid";


const ViewAgentTransactionAuditModal = observer(() => {
  const { api, store } = useAppContext();

  const timeAllocated = Date.now();
  const formattedAllocated = new Date(timeAllocated).toUTCString();

  const me = store.auth.meJson;
  const [agentName, setAgentName] = useState("");

  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState<IAgent>({ ...defaultAgent });
  const [newAgent, setNewAgent] = useState<IAgent>({ ...defaultAgent });

  const auditTrail = store.agentOnboardAuditStore.all;

  const agentAudit = auditTrail
    .sort((a, b) => {
      const dateA = new Date(a.asJson.auditDateTime || 0);
      const dateB = new Date(b.asJson.auditDateTime || 0);

      return dateB.getTime() - dateA.getTime();
    })
    .map((c) => {
      return c.asJson;
    });

  // const agents = [
  //   ...store.agent.all,
  // ];
  // const selectedAgent= store.agent.all.find(
  //     (agent) => agent.asJson.accountNumber === newAgent.accountNumber
  //   );


  const onCancel = () => {
    store.agent.clearSelected();
    setAgent({ ...defaultAgent });
    setNewAgent({ ...defaultAgent });
    // hideModalFromId(
    //   MODAL_NAMES.BACK_OFFICE.TRANSACTIONS.ALLOCATE_TRANSACTION_MODAL
    // );
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (store.agent.selected) {
        setAgent(store.agent.selected);
      }
    };

    loadData()
      .then(() => {
        console.log("Agent data loaded successfully");
      })
      .catch(error => {
        console.error("Error loading agent data:", error);
      });
  }, [store.agent.selected]);

  // useEffect(() => {
  //   const loadData = () => {
  //     const promises = [
  //       api.user.getAll(),
  //       api.agent.getAll()
  //     ];
  //     if (agent.id) {
  //       promises.push(api.agentOnboardAuditApi.getAll(agent.id));
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
  // }, [api.user, api.agent, api.agentOnboardAuditApi, agent.id]);


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
          View Agent
        </h3>
        <div className="dialog-content uk-position-relative">
          <div className="uk-grid">
            <div className="uk-width-1-2">
              <div className="uk-grid">
                <div className="uk-card uk-width-1-1">
                  <div className="uk-card-body">
                    <h4>Agent Details</h4>
                    <div className="uk-width-1-3">
                      <p>Agent Name: {agent.agentName}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Bank Name:{agent.bankName} </p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Branch: {agent.branch}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Account Number: {agent.accountNumber}</p>
                    </div>
                    <hr className="uk-width-1-1" />

                    <div className="uk-width-1-3">
                      <p>Account Holder: {agent.accountHolder}</p>
                    </div>
                    <hr className="uk-width-1-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="uk-card uk-card-body uk-width-1-2">
              <h4>Audit Trail</h4>
              <AgentOnboardAuditTrailGrid data={agentAudit} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default ViewAgentTransactionAuditModal;
