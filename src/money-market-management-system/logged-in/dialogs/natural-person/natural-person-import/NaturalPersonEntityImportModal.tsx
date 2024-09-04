import { observer } from "mobx-react-lite";
import EntityImportForm from "./NaturalPersonEntityImportForm";

const EntityImportModal = observer(() => {
  return (
    <div className="upload-deduction-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button className="uk-modal-close-default" type="button" data-uk-close></button>

      <h3 className="main-title-lg">Import Entities</h3>

      <div className="dialog-content uk-position-relative">
        <form
          className="uk-form-stacked uk-grid-small"
          data-uk-grid
        >
          <p>This form allows you to import <b>a Natural Person</b> using excel files that have been exported from the old system.</p>
          <EntityImportForm />
          <div className="uk-width-1-1 uk-text-right">
          </div>
        </form>
      </div>
    </div>
  )
});

export default EntityImportModal;


