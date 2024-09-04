import swal from 'sweetalert'

import MODAL_NAMES from '../../ModalName'
import ErrorBoundary from '../../../../../shared/components/error-boundary/ErrorBoundary';
import { hideModalFromId } from '../../../../../shared/functions/ModalShow';

const WithdrawalTaxFreeModal = () => {

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
            <div className="custom-modal-style uk-modal-dialog uk-modal-body uk-width-1-2">
                <button
                    className="uk-modal-close-default" onClick={onCancel}
                    type="button"
                    data-uk-close
                ></button>
                <h3 className="uk-modal-title text-to-break">Redemption Request</h3>
                <div className="dialog-content uk-position-relative uk-padding-large">
                    <div className="uk-grid" data-uk-grid>
                        <div className="uk-width-1-1">
                            <h4 className="main-title-lg">Request Details</h4>
                            <table className="uk-table uk-table-divider">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="uk-text-bold">Client Number</td>
                                        <td>3568</td>
                                    </tr>
                                    <tr>
                                        <td className="uk-text-bold">Entity Name</td>
                                        <td>IJG Securities Money Market Trust</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">Entity Name</td>
                                        <td>IJG Securities Money Market Trust</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">Registered Number</td>
                                        <td>T366/07</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">From Unit Trust Fund</td>
                                        <td>
                                            <input className="uk-select uk-form-small" name="" id="" value="IJG Income Provider Fund – B1" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="uk-grid" data-uk-grid>
                        <div className="uk-width-1-1">
                            <h4 className="main-title-lg">Bank Account Details</h4>
                            <table className="uk-table uk-table-divider">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="uk-text-bold">Name of Account Holder</td>
                                        <td>IJG Securities Money Market Trust</td>
                                    </tr>
                                    <tr>
                                        <td className="uk-text-bold">Bank</td>
                                        <td>Standard Bank Namibia</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">Branch Code</td>
                                        <td>082772</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">Account Number</td>
                                        <td>042739330</td>
                                    </tr>

                                    <tr>
                                        <td className="uk-text-bold">Account Type</td>
                                        <td>Current</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <button className="btn btn-primary uk-margin-top" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </ErrorBoundary >
    )
}

export default WithdrawalTaxFreeModal;



