import { observer } from "mobx-react-lite";
import EntityImportForm from "./LegalBankAccountImportForm";

import MODAL_NAMES from "../../ModalName";


const LegalBankAccountImportModal = observer(() => {
  const onCancel = () => {
    hideModalFromId(MODAL_NAMES.DATA_MIGRATION.IMPORT_CLIENT_ENTITY_MODAL);
  };

  return (
    <div className="upload-deduction-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button className="uk-modal-close-default" type="button" data-uk-close></button>

      <h3 className="uk-modal-title">Import Client Accounts</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
        >
          <p>This form allows you to import <b>Legal Client Account</b> excel files that have been exported from the old system.</p>
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

export default LegalBankAccountImportModal
function hideModalFromId(IMPORT_CLIENT_ENTITY_MODAL: string) {
  throw new Error("Function not implemented.");
}

