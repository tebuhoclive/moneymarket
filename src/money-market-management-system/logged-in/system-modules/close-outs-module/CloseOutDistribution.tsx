import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import CloseOutDistributionTabs from "./CloseOutDistributionTabs";

import { LoadingEllipsis } from "../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../shared/functions/Context";
import { dateFormat_YY_MM_DD } from "../../../../shared/utils/utils";

const CloseOutDistribution = observer(() => {
  const { store, api } = useAppContext();
  const [selectedTab, setSelectedTab] = useState("pending-close-outs");
  const [loading, setLoading] = useState(false);

  const closeOuts = store.closeOutStore.all.map((c) => {
    return c.asJson;
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.closeOutApi.getAll();
      } catch (error) {
        // Handle the error, for example, by logging it or displaying a message to the user
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, [api.withdrawalTransaction, api.closeOutApi]);

  if (loading) return <LoadingEllipsis />;

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Close Out Distributions"
            rightControls={<div className="uk-margin-bottom"></div>}
          />
          <hr />
        </div>
        <Toolbar
          rightControls={
            <div className="uk-margin-bottom">
              <CloseOutDistributionTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            </div>
          }
        />
        <div className="page-main-card uk-card uk-card-default uk-card-body">
          {selectedTab === "pending-close-outs" && (
            <div>
              <table className="uk-table uk-table-small uk-table-divider">
                <thead>
                  <tr>
                    <th>Close Out Date</th>
                    <th>Entity</th>
                    <th>Account Number</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {closeOuts
                    .filter((c) => c.isPaymentProcessed === false)
                    .map((c) => (
                      <tr key={c.id}>
                        <td>{dateFormat_YY_MM_DD(c.closeOffDate)}</td>
                        <td>{c.entity}</td>
                        <td>{c.accountNumber}</td>
                        <td>{(c.closeOutAmount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {closeOuts.filter((c) => c.isPaymentProcessed === false)
                .length === 0 && <p>No Paid Close Outs</p>}
            </div>
          )}
          {selectedTab === "verified-close-outs" && (
            <div>
              <table className="uk-table uk-table-small uk-table-divider">
                <thead>
                  <tr>
                    <th>Close Out Date</th>
                    <th>Entity</th>
                    <th>Account Number</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {closeOuts
                    .filter((c) => c.isPaymentProcessed === true)
                    .map((c) => (
                      <tr key={c.id}>
                        <td>{dateFormat_YY_MM_DD(c.closeOffDate)}</td>
                        <td>{c.entity}</td>
                        <td>{c.accountNumber}</td>
                        <td>{(c.closeOutAmount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {closeOuts.filter((c) => c.isPaymentProcessed === true).length ===
                0 && <p>No Paid Close Outs</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CloseOutDistribution;
