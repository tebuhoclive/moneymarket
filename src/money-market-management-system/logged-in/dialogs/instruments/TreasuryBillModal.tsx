import { format } from "date-fns";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { SUCCESSACTION, FAILEDACTION } from "../../../../shared/models/Snackbar";
import { ITreasuryBill, defaultTreasuryBill } from "../../../../shared/models/instruments/TreasuryBillModel";
import MODAL_NAMES from "../ModalName";

const TreasuryBillModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [treasuryBill, setTreasuryBill] = useState<ITreasuryBill>({ ...defaultTreasuryBill });
  const [loading, setLoading] = useState(false);

  const [daysToMaturity, setDaysToMaturity] = useState<number>(0); // State for days to maturity

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.instruments.treasuryBill.selected;

    if (selected) await update(treasuryBill);
    else await create(treasuryBill);

    setLoading(false);
    onCancel();
  };

  const update = async (treasuryBill: ITreasuryBill) => {

    treasuryBill.daysToMaturity = daysToMaturity;
    console.log(daysToMaturity);
    
    try {
      await api.instruments.treasuryBill.update(treasuryBill);
    } catch (error) {
    }

  };

  const create = async (treasuryBill: ITreasuryBill) => {

    treasuryBill.daysToMaturity = daysToMaturity;
    try {
      await api.instruments.treasuryBill.create(treasuryBill);
      SUCCESSACTION(ui)
    } catch (error) {
      FAILEDACTION(ui)
    }

  };

  const onCancel = () => {
    store.instruments.treasuryBill.clearSelected();
    setTreasuryBill({ ...defaultTreasuryBill });
    hideModalFromId(MODAL_NAMES.ADMIN.TREASURY_BILL_MODAL);
  };

  useEffect(() => {
    if (store.instruments.treasuryBill.selected) {
      setTreasuryBill(store.instruments.treasuryBill.selected);
    }
  }, [store.instruments.treasuryBill.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">Treasury Bill</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="treasuryBill-description">
              Description
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="treasuryBill-description"
                type="text"
                placeholder="e.g "
                value={treasuryBill.instrumentName}
                onChange={(e) =>
                  setTreasuryBill({ ...treasuryBill, instrumentName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="treasuryBill-issue-date">
              Issue Date
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="treasuryBill-issue-date"
                type="date"
                value={format(treasuryBill.issueDate, 'yyyy-MM-dd')} // Format issueDate for input value
                onChange={(e) => {
                  const issueDate = new Date(e.target.value);
                  const maturityDate = treasuryBill.maturityDate ? new Date(treasuryBill.maturityDate) : null;
                  if (maturityDate) {
                    const differenceInTime = maturityDate.getTime() - issueDate.getTime();
                    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
                    setDaysToMaturity(differenceInDays);
                  }
                  setTreasuryBill({ ...treasuryBill, issueDate: issueDate.getTime() });
                }}
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label" htmlFor="treasuryBill-maturity-date">
              Maturity Date
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="treasuryBill-maturity-date"
                type="date"
                value={format(treasuryBill.maturityDate ? treasuryBill.maturityDate : Date.now(), 'yyyy-MM-dd')} // Format maturityDate for input value
                onChange={(e) => {
                  const maturityDate = new Date(e.target.value);
                  const issueDate = treasuryBill.issueDate ? new Date(treasuryBill.issueDate) : null;
                  if (issueDate) {
                    const differenceInTime = maturityDate.getTime() - issueDate.getTime();
                    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
                    setDaysToMaturity(differenceInDays);
                    setTreasuryBill({ ...treasuryBill, daysToMaturity: daysToMaturity })
                  }
                  setTreasuryBill({ ...treasuryBill, maturityDate: maturityDate.getTime() });
                }}
              />
            </div>
          </div>
          <div>Days to Maturity: {daysToMaturity}</div>
          <div className="uk-width-1-1">
            <div className="uk-margin">
              <label className="uk-form-label label" htmlFor="treasuryBill-issuer">Issuer</label>
              <select
                className="uk-select uk-form-small"
                value={treasuryBill.issuer}
                id="treasuryBill-issuer"
                onChange={(e) => setTreasuryBill({ ...treasuryBill, issuer: e.target.value })}
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

export default TreasuryBillModal;
