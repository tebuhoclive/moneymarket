import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";
import MODAL_NAMES from "../../ModalName";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { useEffect } from "react";
import { IEquity } from "../../../../../shared/models/instruments/EquityModel";

interface IEquityProps {
    equity: IEquity;
}
export const EquityItem = (props: IEquityProps) => {
    const { equity } = props;

    return (
        <div className={`page-item uk-card uk-card-body uk-card-small`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {equity.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Share Code</span>
                        {equity.sharecode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Bloomberg Code</span>
                        {equity.bloombergCode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">isin</span>
                        {equity.isin}
                    </p>
                </div>
                <div className="uk-flex uk-flex-right uk-width-1-1 uk-width-1-6@m">
                    <p>
                        <span className="span-label">status</span>
                        <span className={`status ${equity.instrumentStatus}`}>{equity.instrumentStatus}</span>
                    </p>
                </div>
                {equity.instrumentStatus === "pending" &&
                    <div className="uk-flex">
                        <div className="controls">
                            <button className="btn-icon btn-danger">
                                <span data-uk-icon="trash"></span>
                            </button>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

const ViewEquitiesModal = observer(() => {

    const { api, store } = useAppContext();

    const onClose = () => {
        hideModalFromId(MODAL_NAMES.ADMIN.VIEW_EQUITY_MODAL);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.instruments.equity.getAll();
            } catch (error) { }
        };
        loadAll();
    }, [api.instruments.equity]);

    return (
        <div className="uk-modal-dialog uk-modal-body custom-modal-style uk-margin-auto-vertical" data-uk-height-viewport>
            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close></button>
            <div className="uk-grid-small uk-child-width-1-2@s" data-uk-grid>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Approved Equities</h3>
                        {store.instruments.equity.approvedEquities.map((equity,index) => (
                            <EquityItem key={index} equity={equity.asJson} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Pending Equities</h3>
                        {store.instruments.equity.pendingEquities.map((equity,index) => (
                            <EquityItem key={index} equity={equity.asJson} />
                        ))}
                       
                    </div>
                </div>
                <div className="uk-width-1-1 uk-text-right uk-margin">
                    <button className="btn btn-danger" type="button" onClick={onClose} >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ViewEquitiesModal;
