import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { IBond, defaultBond } from "../../../../shared/models/instruments/BondModel";
import { dateFormat_YY_MM_DD } from "../../../../shared/utils/utils";

import { SUCCESSACTION, FAILEDACTION } from "../../../../shared/models/Snackbar";
import MODAL_NAMES from "../ModalName";
import NumberInput from "../../shared/components/number-input/NumberInput";

const BondModal = observer(() => {
  const { api, store, ui } = useAppContext();

  const [bond, setBond] = useState<IBond>({ ...defaultBond });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const selected = store.instruments.bond.selected;

    if (selected) await update(bond);
    else await create(bond);

    setLoading(false);
    onCancel();
  };

  const update = async (bond: IBond) => {
    try {
      await api.instruments.bond.update(bond);
      SUCCESSACTION(ui)
    } catch (error) {
      FAILEDACTION(ui)
    }
  };

  const create = async (bond: IBond) => {
    try {
      await api.instruments.bond.create(bond);
      SUCCESSACTION(ui)
    } catch (error) {
      FAILEDACTION(ui)
    }
  };

  const onCancel = () => {
    store.instruments.bond.clearSelected();
    setBond({ ...defaultBond });
    hideModalFromId(MODAL_NAMES.ADMIN.BOND_MODAL);
  };

  useEffect(() => {
    if (store.instruments.bond.selected) {
      setBond(store.instruments.bond.selected);
    }
  }, [store.instruments.bond.selected]);

  return (
    <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
      <button
        className="uk-modal-close-default"
        type="button"
        data-uk-close
      ></button>
      <h3 className="uk-modal-title text-to-break">Bond</h3>
      <div className="dialog-content uk-position-relative">
        <form className="uk-form-stacked uk-grid-small" data-uk-grid
          onSubmit={handleSubmit}>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bond-fname">
              Name
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="bond-fname"
                type="text"
                placeholder="Name"
                value={bond.instrumentName}
                onChange={(e) =>
                  setBond({ ...bond, instrumentName: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bond-coupon-rate">
              Coupon Rate {"( % )"}
            </label>
            <div className="uk-form-controls">
              <NumberInput  
                id="bond-coupon-rate"
                className="auto-save uk-input uk-form-small"
                placeholder="-"
                value={bond.couponRate}
                onChange={(value) =>
                  setBond({ ...bond, couponRate: Number(value) })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bond-maturity-date">
              Maturity Date
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="bond-maturity-date"
                type="date"
                value={dateFormat_YY_MM_DD(bond.maturityDate)}
                onChange={(e) =>
                  setBond({ ...bond, maturityDate: new Date(e.target.value).getTime() })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bond-coupon-frequency">
              Coupon Frequency
            </label>
            <div className="uk-form-controls">
              <NumberInput  
                id="bond-coupon-frequency"
                className="auto-save uk-input uk-form-small"
                placeholder="-"
                value={bond.couponFrequency}
                onChange={(value) =>
                  setBond({ ...bond, couponFrequency: Number(value) })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <label className="uk-form-label required" htmlFor="bond-next-coupon-date">
              Next Coupon Date
            </label>
            <div className="uk-form-controls">
              <input
                className="uk-input uk-form-small"
                id="bond-next-coupon-date"
                type="date"
                value={dateFormat_YY_MM_DD(bond.nextCouponDate)}
                onChange={(e) =>
                  setBond({ ...bond, nextCouponDate: new Date(e.target.value).getTime() })
                }
              />
            </div>
          </div>
          <div className="uk-width-1-1">
            <div className="uk-margin">
              <label className="uk-form-label label required" htmlFor="bond-issuer">Issuer</label>
              <select
                className="uk-select uk-form-small"
                value={bond.issuer}
                id="bond-issuer"
                onChange={(e) => setBond({ ...bond, issuer: e.target.value })}
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

export default BondModal;
