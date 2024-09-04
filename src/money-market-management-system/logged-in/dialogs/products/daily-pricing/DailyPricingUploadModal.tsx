import { observer } from "mobx-react-lite";
import EntityImportForm from "./DailyPricingUploadForm";

import MODAL_NAMES from "../../ModalName";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";

const DailyPricingUploadModal = observer(() => {
  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.BACK_OFFICE.UPLOAD_DAILY_PRICING_MODAL);
  };

  return (
    <div className="upload-deduction-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button className="uk-modal-close-default" type="button" data-uk-close></button>

      <h3 className="uk-modal-title">Upload Daily Pricing</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
        >
          <p>This form allows you to upload <b>Product/Instrument Daily Prices</b> excel files.</p>
          <EntityImportForm/>
          <div className="uk-width-1-1 uk-text-right">
            <button className="btn btn-danger uk-margin-right" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
});

export default DailyPricingUploadModal
