import { observer } from "mobx-react-lite";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";
import InstrumentCategory from "../../../../../shared/models/InstrumentCategory";

export const InstrumentPurchaseCategory = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(false);

  const onNavigate = useNavigate();

  const onSelectCategory = (categorName: string) => {
    onNavigate(`/c/purchase/instrument/${categorName}`);
  };

  const instrumentTypeOptions = store.category.all;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await api.instruments.bond.getAll();
        await api.instruments.equity.getAll();
        await api.instruments.fixedDeposit.getAll();
        await api.instruments.unitTrust.getAll();
        await api.instruments.treasuryBill.getAll();
        await api.instruments.callDeposit.getAll();
        await api.category.getAll();
        setLoading(false);
      } catch (error) {}
    };
    loadData();
  }, [api.category, api.counterParty, api.instruments.bond, api.instruments.callDeposit, api.instruments.equity, api.instruments.fixedDeposit, api.instruments.treasuryBill, api.instruments.unitTrust]);

  if (loading) return <LoadingEllipsis />;

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar title="Instrument Purchasing" />
          <hr />
        </div>

        <div className="page-main-card uk-card uk-padding">
          <div className="uk-margin-large-botton">
            <p className="main-title-sm">Select Instrument Category</p>
            <div className="uk-grid uk-grid-small" data-uk-grid>
              {instrumentTypeOptions.map((category: InstrumentCategory) => (
                <div className="uk-width-1-6"  key={category.asJson.id}>
                  <button
                  //  disabled={category.asJson.categoryName === "Treasury Bill"}
                    key={category.asJson.id}
                    className="btn btn-primary uk-width-medium uk-height-small"
                    onClick={() =>
                      onSelectCategory(category.asJson.categoryName)
                    }
                  >
                    {category.asJson.categoryName}
                  </button>
                </div>
              ))}
              <div className="uk-width-1-6">
                <button
                  //  disabled
                  className="btn btn-primary uk-width-medium uk-height-small"
                  
                >
                  Call Deposit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
