import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";

import MODAL_NAMES from "../../../../dialogs/ModalName";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../../shared/functions/ModalShow";
import { SUCCESSACTION, FAILEDACTION } from "../../../../../../shared/models/Snackbar";
import { IEquity, defaultEquity } from "../../../../../../shared/models/instruments/EquityModel";

const EquityPurchaseModal = observer(() => {
    const { api, store, ui } = useAppContext();

    const [equity, setEquity] = useState<IEquity>({ ...defaultEquity });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const selected = store.instruments.equity.selected;

        if (selected) await update(equity);
        else await create(equity);

        setLoading(false);
        onCancel();
    };

    const update = async (equity: IEquity) => {
        try {
            await api.instruments.equity.update(equity);
            SUCCESSACTION(ui)
        } catch (error) {
            FAILEDACTION(ui)
        }
    };

    const create = async (equity: IEquity) => {
        try {
            await api.instruments.equity.create(equity);
            SUCCESSACTION(ui)
        } catch (error) {
            FAILEDACTION(ui)
        }
    };

    const onCancel = () => {
        store.instruments.equity.clearSelected();
        setEquity({ ...defaultEquity });
        hideModalFromId(MODAL_NAMES.ADMIN.EQUITY_MODAL);
    };

    useEffect(() => {
        if (store.instruments.equity.selected) {
            setEquity(store.instruments.equity.selected);
        }
    }, [store.instruments.equity.selected]);

    return (
        <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
            <button
                className="uk-modal-close-default"
                type="button"
                data-uk-close
            ></button>
            <h3 className="uk-modal-title text-to-break">Equity</h3>
            <div className="dialog-content uk-position-relative">
                <form className="uk-form-stacked uk-grid-small" data-uk-grid
                    onSubmit={handleSubmit}>
                    <div className="uk-width-1-1">
                        <label className="uk-form-label" htmlFor="equity-fname">
                            Entity ID
                        </label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="equity-fname"
                                type="text"
                                placeholder="Name"
                                value={equity.instrumentName}
                                onChange={(e) =>
                                    setEquity({ ...equity, instrumentName: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="uk-width-1-1">
                        <label className="uk-form-label" htmlFor="equity-share-code">
                            Account
                        </label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="equity-share-code"
                                type="text"
                                value={equity.sharecode}
                                onChange={(e) =>
                                    setEquity({ ...equity, sharecode: e.target.value })
                                }
                                required
                            />
                        </div>
                    </div>
                    <div className="uk-width-1-1">
                        <label className="uk-form-label" htmlFor="equity-bloomberg-Code">
                            Trade Date
                        </label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="equity-bloomberg-Code"
                                type="text"
                                value={equity.bloombergCode}
                                onChange={(e) =>
                                    setEquity({ ...equity, bloombergCode: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="uk-width-1-1">
                        <label className="uk-form-label" htmlFor="equity-isin">
                            Settlement Date
                        </label>
                        <div className="uk-form-controls">
                            <input
                                className="uk-input uk-form-small"
                                id="equity-isin"
                                type="text"
                                value={equity.isin}
                                onChange={(e) =>
                                    setEquity({ ...equity, isin: e.target.value })
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
                            Process Transaction {loading && <div data-uk-spinner="ratio: .5"></div>}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
});

export default EquityPurchaseModal;
