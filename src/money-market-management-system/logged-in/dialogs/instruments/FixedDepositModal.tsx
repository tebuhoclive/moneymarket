import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { SUCCESSACTION, FAILEDACTION } from "../../../../shared/models/Snackbar";
import { IFixedDeposit, defaultFixedDeposit } from "../../../../shared/models/instruments/FixedDepositModel";
import { dateFormat_YY_MM_DD } from "../../../../shared/utils/utils";
import NumberInput from "../../shared/components/number-input/NumberInput";
import MODAL_NAMES from "../ModalName";

const FixedDepositModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [fixedDeposit, setFixedDeposit] = useState<IFixedDeposit>({ ...defaultFixedDeposit });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.instruments.fixedDeposit.selected;

    if (selected) await update(fixedDeposit);
    else await create(fixedDeposit);

    setLoading(false);
    onCancel();
  };

  const update = async (fixedDeposit: IFixedDeposit) => {
    try {
      await api.instruments.fixedDeposit.update(fixedDeposit);
    } catch (error) {
    }
  };

  const create = async (fixedDeposit: IFixedDeposit) => {
    try {
      await api.instruments.fixedDeposit.create(fixedDeposit);
      SUCCESSACTION(ui)
    } catch (error) {
      FAILEDACTION(ui)
    }
  };

  const onCancel = () => {
    store.instruments.fixedDeposit.clearSelected();
    setFixedDeposit({ ...defaultFixedDeposit });
    hideModalFromId(MODAL_NAMES.ADMIN.FIXED_DEPOSIT_MODAL);
  };

  useEffect(() => {
    if (store.instruments.fixedDeposit.selected) {
      setFixedDeposit(store.instruments.fixedDeposit.selected);
    }
  }, [store.instruments.fixedDeposit.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">Fixed Deposit</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="fixedDeposit-fname">
              Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="fixedDeposit-fname"
                type="text"
                placeholder="Name"
                value={fixedDeposit.instrumentName}
                onChange={(e) =>
                  setFixedDeposit({ ...fixedDeposit, instrumentName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="fixedDeposit-interest-rate">
              Interest Rate {"( % )"}
            </label>
            <div className="uk-form-controls">
              <NumberInput  
                id="kpi-final-rating"
                className="auto-save uk-input uk-form-small"
                placeholder="-"
                value={fixedDeposit.interestRate}
                onChange={(value) =>
                  setFixedDeposit({ ...fixedDeposit, interestRate: Number(value) })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="fixedDeposit-maturity-date">
              Maturity Date
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="fixedDeposit-maturity-date"
                type="date"
                value={dateFormat_YY_MM_DD(fixedDeposit.maturityDate)}
                onChange={(e) =>
                  setFixedDeposit({ ...fixedDeposit, maturityDate: new Date(e.target.value).getTime() })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <div className="uk-margin">
              <label className="uk-form-label label" htmlFor="fixedDeposit-issuer">Issuer</label>
              <select
                className="uk-select uk-form-small"
                value={fixedDeposit.issuer}
                id="fixedDeposit-issuer"
                onChange={(e) => setFixedDeposit({ ...fixedDeposit, issuer: e.target.value })}
                required
              >
                <option value={""} disabled>Select...</option>
                {store.issuer.all.map((issuer, index) =>
                  <option key={index} value={issuer.asJson.id}>{issuer.asJson.issuerName}</option>
                )}
              </select>
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

export default FixedDepositModal;
