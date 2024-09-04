import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";
import { IBond } from "../../../../../shared/models/instruments/BondModel";
import MODAL_NAMES from "../../ModalName";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { useEffect } from "react";

interface IBondProps {
    bond: IBond;
}
const BondItem = (props: IBondProps) => {
    const { bond } = props;

    return (
        <div className={`page-item uk-card uk-card-body uk-card-small`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {bond.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Coupon Rate</span>
                        {bond.couponRate} {"( % )"}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Coupon Frequency</span>
                        {bond.couponFrequency}
                    </p>
                </div>
                <div className="uk-flex uk-flex-right uk-width-1-1 uk-width-1-6@m">
                    <p>
                        <span className="span-label">status</span>
                        <span className={`status ${bond.instrumentStatus}`}>{bond.instrumentStatus}</span>
                    </p>
                </div>
                {bond.instrumentStatus === "pending" &&
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


const ViewBondsModal = observer(() => {

    const { api, store } = useAppContext();

    const onClose = () => {
        hideModalFromId(MODAL_NAMES.ADMIN.VIEW_BOND_MODAL);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.instruments.bond.getAll();
            } catch (error) { }
        };
        loadAll();
    }, [api.instruments.bond]);

    return (
        <div className="uk-modal-dialog uk-modal-body custom-modal-style uk-margin-auto-vertical" data-uk-height-viewport>
            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close></button>
            <div className="uk-grid-small uk-child-width-1-2@s" data-uk-grid>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Approved Bonds</h3>
                        {store.instruments.bond.approvedBonds.map((bond,index) => (
                            <BondItem key={index} bond={bond.asJson} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Pending Bonds</h3>
                        {store.instruments.bond.pendingBonds.map((bond,index) => (
                            <BondItem key={index} bond={bond.asJson} />
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

export default ViewBondsModal;
