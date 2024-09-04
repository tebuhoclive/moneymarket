import { observer } from "mobx-react-lite";
import { useAppContext } from "../../../../../shared/functions/Context";
import MODAL_NAMES from "../../ModalName";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import { useEffect } from "react";
import { IFixedDeposit } from "../../../../../shared/models/instruments/FixedDepositModel";
import { dateFormat } from "../../../../../shared/utils/utils";

interface IFDepositProps {
    deposit: IFixedDeposit;
}
const FixedDepositItem = (props: IFDepositProps) => {
    const { deposit } = props;

    return (
        <div className={`page-item uk-card uk-card-body uk-card-small`}>
            <div className="uk-grid-small uk-grid-match" data-uk-grid>
                <div className="uk-flex uk-flex-middle uk-width-1-1 uk-width-expand@m">
                    <p className="name">
                        <span className="span-label">name</span>
                        {deposit.instrumentName}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Interest Rate</span>
                        {deposit.interestRate} {" ( % )"}
                    </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-width-1-2 uk-width-1-6@m">
                    <p className="name">
                        <span className="span-label">Maturity Date</span>
                        {dateFormat(deposit.maturityDate)}
                    </p>
                </div>
                <div className="uk-flex uk-flex-right uk-width-1-1 uk-width-1-6@m">
                    <p>
                        <span className="span-label">status</span>
                        <span className={`status ${deposit.instrumentStatus}`}>{deposit.instrumentStatus}</span>
                    </p>
                </div>
                {deposit.instrumentStatus === "pending" &&
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

const ViewFixedDepositsModal = observer(() => {

    const { api, store } = useAppContext();

    const onClose = () => {
        hideModalFromId(MODAL_NAMES.ADMIN.VIEW_FIXED_DEPOSIT_MODAL);
    };

    useEffect(() => {
        const loadAll = async () => {
            try {
                await api.instruments.fixedDeposit.getAll();
            } catch (error) { }
        };
        loadAll();
    }, [api.instruments.fixedDeposit]);

    return (
        <div className="uk-modal-dialog uk-modal-body custom-modal-style uk-margin-auto-vertical" data-uk-height-viewport>
            <button className="uk-modal-close-full uk-close-large" type="button" data-uk-close></button>
            <div className="uk-grid-small uk-child-width-1-2@s" data-uk-grid>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Approved Fixed Deposits</h3>
                        {store.instruments.fixedDeposit.approvedDeposits.map((deposit, index) => (
                            <FixedDepositItem key={index} deposit={deposit.asJson} />
                        ))}
                    </div>
                </div>
                <div>
                    <div className="page-main-card uk-card uk-card-default uk-card-body">
                        <h3 className="uk-card-title in-title">Pending Fixed Deposits</h3>
                        {store.instruments.fixedDeposit.pendingDeposits.map((deposit, index) => (
                            <FixedDepositItem key={index} deposit={deposit.asJson} />
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

export default ViewFixedDepositsModal;
