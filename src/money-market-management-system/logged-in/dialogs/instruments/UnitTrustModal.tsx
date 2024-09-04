import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { SUCCESSACTION, FAILEDACTION } from "../../../../shared/models/Snackbar";
import { IUnitTrust, defaultUnitTrust } from "../../../../shared/models/instruments/UnitTrustModel";
import MODAL_NAMES from "../ModalName";

const UnitTrustModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [unitTrust, setUnitTrust] = useState<IUnitTrust>({ ...defaultUnitTrust });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.instruments.unitTrust.selected;

    if (selected) await update(unitTrust);
    else await create(unitTrust);

    setLoading(false);
    onCancel();
  };

  const update = async (unitTrust: IUnitTrust) => {
    try {
      await api.instruments.unitTrust.update(unitTrust);
    } catch (error) {
    }
  };

  const create = async (unitTrust: IUnitTrust) => {
    try {
      await api.instruments.unitTrust.create(unitTrust);
      SUCCESSACTION(ui)
    } catch (error) {
      FAILEDACTION(ui)
    }
  };

  const onCancel = () => {
    store.instruments.unitTrust.clearSelected();
    setUnitTrust({ ...defaultUnitTrust });
    hideModalFromId(MODAL_NAMES.ADMIN.UNIT_TRUST_MODAL);
  };

  useEffect(() => {
    if (store.instruments.unitTrust.selected) {
      setUnitTrust(store.instruments.unitTrust.selected);
    }
  }, [store.instruments.unitTrust.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">Unit Trust</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="unitTrust-fname">
              Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="unitTrust-fname"
                type="text"
                placeholder="Name"
                value={unitTrust.instrumentName}
                onChange={(e) =>
                  setUnitTrust({ ...unitTrust, instrumentName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="unitTrust-share-code">
              Share Code
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="unitTrust-share-code"
                type="text"
                value={unitTrust.sharecode}
                onChange={(e) =>
                  setUnitTrust({ ...unitTrust, sharecode: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="unitTrust-bloomberg-Code">
              Bloomberg Code
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="unitTrust-bloomberg-Code"
                type="text"
                value={unitTrust.bloombergCode}
                onChange={(e) =>
                  setUnitTrust({ ...unitTrust, bloombergCode: e.target.value })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1 uk-text-right">
            <button className="btn btn-danger" type="button" onClick={onCancel} >
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading} >
              Save {loading && <div data-uk-spinner="ratio: .5"></div>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default UnitTrustModal;
