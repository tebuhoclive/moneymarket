import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import { format } from "date-fns";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { SUCCESSACTION, FAILEDACTION } from "../../../../../shared/models/Snackbar";
import { IBond, defaultBond } from "../../../../../shared/models/instruments/BondModel";
import MODAL_NAMES from "../../ModalName";

const BondReplacementModal = observer(() => {
    const { api, store, ui } = useAppContext();

    const [bond, setBond] = useState<IBond>({ ...defaultBond });
    const [loading, setLoading] = useState(false);

    const [nextCouponDate, setNextCouponDate] = useState<number>(0); // State for days to maturity

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        await create(bond);
        setLoading(false);
        onCancel();
    };

    const create = async (bond: IBond) => {
        bond.nextCouponDate = nextCouponDate;
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
        hideModalFromId(MODAL_NAMES.ADMIN.BOND_REPLACEMENT_MODAL);
    };

    useEffect(() => {
        const getIssuer = async () =>{
            await api.issuer.getAll();
        }
        if (store.instruments.bond.selected) {
            setBond(store.instruments.bond.selected);
        }
        getIssuer();
    }, [api.issuer, store.instruments.bond.selected]);

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
                        <label className="uk-form-label required" htmlFor="treasuryBill-description">
                            Description
                        </label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="treasuryBill-description"
                                type="text"
                                placeholder="e.g "
                                value={bond.instrumentName}
                                onChange={(e) =>
                                    setBond({ ...bond, instrumentName: e.target.value })
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
                                value={bond.maturityDate ? format(bond.maturityDate, 'yyyy-MM-dd'):''} // Format issueDate for input value
                                onChange={(e) => {
                                    const issueDate = new Date(e.target.value);
                                    const maturityDate = bond.maturityDate ? new Date(bond.maturityDate) : null;
                                    if (maturityDate) {
                                        const differenceInTime = maturityDate.getTime() - issueDate.getTime();
                                        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
                                        setNextCouponDate(differenceInDays);
                                    }
                                    setBond({ ...bond, nextCouponDate: issueDate.getTime() });
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
                                value={format(bond.maturityDate ? bond.maturityDate : Date.now(), 'yyyy-MM-dd')} // Format maturityDate for input value
                                onChange={(e) => {
                                    const maturityDate = new Date(e.target.value);
                                    const issueDate = bond.maturityDate ? new Date(bond.maturityDate) : null;
                                    if (issueDate) {
                                        const differenceInTime = maturityDate.getTime() - issueDate.getTime();
                                        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
                                        setNextCouponDate(differenceInDays);
                                        setBond({ ...bond, nextCouponDate: nextCouponDate })
                                    }
                                    setBond({ ...bond, maturityDate: maturityDate.getTime() });
                                }}
                            />
                        </div>
                    </div>
                    <div>Days to Maturity: {nextCouponDate}</div>
                    <div className="uk-width-1-1">
                        <div className="uk-margin">
                            <label className="uk-form-label label" htmlFor="treasuryBill-issuer">Issuer</label>
                            <select
                                className="uk-select uk-form-small"
                                value={bond.issuer}
                                id="treasuryBill-issuer"
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

export default BondReplacementModal;
