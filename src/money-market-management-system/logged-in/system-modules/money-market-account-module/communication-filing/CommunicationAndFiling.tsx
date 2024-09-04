import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary"
import Toolbar from "../../../shared/components/toolbar/Toolbar"

const CommunicationAndFiling = () => {
    return (
        <ErrorBoundary>
            <Toolbar leftControls={
                <h4 className="main-title-md">Communication and Filing</h4>
            } rightControls={
                <form className="uk-form" action="">
                    <div className="uk-form-controls">
                        <select className="uk-select uk-form-small" name="transactionType" id="transactionType">
                            <option value="">Select communication type</option>
                            <option value="Email">
                                Email
                            </option>
                            <option value="Notification">
                                Notification
                            </option>
                            <option value="Statement Run">
                                Statement Run
                            </option>
                        </select>
                    </div>
                </form>
            }
            />
            <hr className="uk-margin-top-remove" />
        </ErrorBoundary>
    )
}

export default CommunicationAndFiling
