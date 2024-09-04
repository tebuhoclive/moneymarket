import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { IUnitTrust } from "../../../../../shared/models/instruments/UnitTrustModel";
import MODAL_NAMES from "../../ModalName";

interface IUnitProps {
    unit: IUnitTrust;
}
const UnitTrustItem = (props: IUnitProps) => {
    const { unit } = props;

    return (
        <div className={`page-item uk-card uk-card-body uk-card-small`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {unit.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">share code</span>
                        {unit.sharecode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Bloomberg Code</span>
                        {unit.bloombergCode}
                    </p>
                </div>
                <div className="uk-flex uk-flex-right uk-width-1-1 uk-width-1-6@m">
                    <p>
                        <span className="span-label">status</span>
                        <span className={`status ${unit.instrumentStatus}`}>{unit.instrumentStatus}</span>
                    </p>
                </div>
                {unit.instrumentStatus === "pending" &&
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



const ViewUnitTrustsModal = observer(() => {

    const { api, store } = useAppContext();

    const onClose = () => {
        hideModalFromId(MODAL_NAMES.ADMIN.VIEW_UNIT_TRUST_MODAL);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.instruments.unitTrust.getAll();
            } catch (error) { }
        };
        loadAll();
    }, [api.instruments.unitTrust]);

    return (
        <div className="uk-modal-dialog uk-modal-body custom-modal-style uk-margin-auto-vertical" data-uk-height-viewport>
            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close></button>
            <div className="uk-grid-small uk-child-width-1-2@s" data-uk-grid>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Approved Unit Trusts</h3>
                        {store.instruments.unitTrust.approvedUnitTrusts.map((unitTrust, index) => (
                            <UnitTrustItem key={index} unit={unitTrust.asJson} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Pending Unit Trusts</h3>
                        {store.instruments.unitTrust.pendingUnitTrusts.map((unitTrust, index) => (
                            <UnitTrustItem key={index} unit={unitTrust.asJson} />
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

export default ViewUnitTrustsModal;
