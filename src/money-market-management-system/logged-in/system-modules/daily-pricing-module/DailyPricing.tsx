import { observer } from "mobx-react-lite";

import showModalFromId from "../../../../shared/functions/ModalShow";

import { useAppContext } from "../../../../shared/functions/Context";
import Toolbar from "../../shared/components/toolbar/Toolbar";
import MODAL_NAMES from "../../dialogs/ModalName";
import { DailyPricingGrid } from "./DailyPricingGrid";

const DailyPricing = observer(() => {
  const { store } = useAppContext();
  const user = store.auth.meJson;

  const pricing = store.productDailyPricing.all;

  const sortedPrincing = pricing.sort((a, b) => {
    const nameA = a.asJson.priceUpdateDate;
    const nameB = b.asJson.priceUpdateDate;
    return nameA - nameB;
  }).map((client) => { return client.asJson });

  const onUploadDailyPricing = () => {
    showModalFromId(MODAL_NAMES.BACK_OFFICE.UPLOAD_DAILY_PRICING_MODAL);
  };
  const hasPricingPermission = user?.feature.some(
    (feature) => feature.featureName === "Pricing" && feature.create === true
  );

  return (
    <div className="page uk-section uk-section-small">
      <div className="uk-container uk-container-expand">
        <div className="sticky-top">
          <Toolbar
            title="Daily Pricing"
            rightControls={
              <>
                {hasPricingPermission && (
                  <>
                    {" "}
                    <button
                      className="btn btn-primary"
                      onClick={onUploadDailyPricing}
                    >
                      Upload Daily Pricing
                    </button>
                  </>
                )}
              </>
            }
          />
          <hr />
        </div>

        <div className="uk-card page-main-card">
          <div
            className="uk-grid uk-grid-small uk-child-width-1-1"
            data-uk-grid
          >
            <DailyPricingGrid data={sortedPrincing} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default DailyPricing;
