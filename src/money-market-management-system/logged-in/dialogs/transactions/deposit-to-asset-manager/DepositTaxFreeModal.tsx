import swal from 'sweetalert';
import MODAL_NAMES from '../../ModalName';
import { useState } from 'react';
import NumberInput from '../../../shared/components/number-input/NumberInput';
import { observer } from 'mobx-react-lite';
import ErrorBoundary from '../../../../../shared/components/error-boundary/ErrorBoundary';
import { useAppContext } from '../../../../../shared/functions/Context';
import { hideModalFromId } from '../../../../../shared/functions/ModalShow';
import { IAssetManagerFlowLiability, defaultAssetManagerFlowLiability } from '../../../../../shared/models/AssetManagerFlowLiabilityModel';

interface IProps {
    inflows: number;
    outflows: number;
    netflow: number;
}

const DepositTaxFreeModal = observer((props: IProps) => {

    const { api } = useAppContext();
    const { inflows, outflows, netflow } = props;

    const [deposit, setDeposit] = useState<IAssetManagerFlowLiability>({ ...defaultAssetManagerFlowLiability });

    const onCancel = () => {
        hideModalFromId(MODAL_NAMES.BACK_OFFICE.WITHDRAW_FROM_ASSET_MANAGER.TAX_FREE_MODAL);
    }

    const handleSubmit = () => {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: ["Cancel", "Submit"],
            dangerMode: true,
        }).then(async (edit) => {
            if (edit) {
                onCancel();
            }else{
                swal({
                    icon:"error",
                    text: "Operation cancelled!"
                });
                onCancel();
            }
        })
    }

    return (
        <ErrorBoundary>
            <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-3">
                <button
                    className="uk-modal-close-default" onClick={onCancel}
                    type="button"
                    data-uk-close
                ></button>
                <h3 className="uk-modal-title">Deposit to Asset Manager</h3>
                <div className="dialog-content uk-position-relative uk-padding-small">
                    <form className="uk-grid" data-uk-grid onSubmit={handleSubmit}>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">To Unit Trust Fund</label>
                            <input className="uk-select uk-form-small" name="" id="" value="">
                                <option value=""> -- select account --</option>
                                <option value="IJG Income Provider Fund – B3">IJG Income Provider Fund – B3</option>
                                <option value="IJG Income Provider Fund – A2">IJG Money Market Fund - A2</option>
                            </input>
                        </div>

                        <div className="uk-form-controls uk-width-1-1">
                            <label className="uk-form-label required" htmlFor="">Amount (NAD)</label>
                            <NumberInput   className='uk-input uk-form-small' value={netflow} onChange={(value) => setDeposit({ ...deposit, netflows: Number(value) })} />
                            <small>Net Flow {(netflow)}</small>
                        </div>
                        <div>
                            <button className="btn btn-primary uk-margin-top" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </ErrorBoundary >
    )
});

export default DepositTaxFreeModal;



