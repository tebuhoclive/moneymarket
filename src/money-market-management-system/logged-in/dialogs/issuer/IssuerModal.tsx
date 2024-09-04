import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../ModalName";
import { IIssuer, defaultIssuer } from "../../../../shared/models/IssuerModel";

const IssuerModal = observer(() => {

  const { api, store } = useAppContext();
  const [issuer, setIssuer] = useState<IIssuer>({ ...defaultIssuer });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.issuer.selected;

    if (selected) await update(issuer);
    else await create(issuer);

    setLoading(false);
    onCancel();
  };

  const update = async (issuer: IIssuer) => {
    try {
      await api.issuer.update(issuer);
    } catch (error) {
    }
  };

  const create = async (issuer: IIssuer) => {
    try {
      await api.issuer.create(issuer);
    } catch (error) { }
  };

  const onCancel = () => {
    store.issuer.clearSelected();
    setIssuer({ ...defaultIssuer });
    hideModalFromId(MODAL_NAMES.ADMIN.ISSUER_MODAL);
  };

  useEffect(() => {
    if (store.issuer.selected) {
      setIssuer(store.issuer.selected);
    }
  }, [store.issuer.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">Issuer</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="issuer-fname">
              Issuer Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="issuer-fname"
                type="text"
                placeholder="Issuer Name"
                value={issuer.issuerName}
                onChange={(e) =>
                  setIssuer({ ...issuer, issuerName: e.target.value })
                }
                required
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

export default IssuerModal;
