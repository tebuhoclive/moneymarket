import { ChangeEvent } from "react";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";


interface IProps {
    index: number;
    firstName: string;
    surname: string;
    idNumber: string;
    relationship: string;
    riskRating: string;
    onItemChange: (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onItemRemove: (index: number) => void;
}

export const RelatedPartyItem = (props: IProps) => {

    const {
        index,
        firstName,
        surname,
        idNumber,
        relationship,
        riskRating,
        onItemChange,
        onItemRemove
    } = props;

    return (
        <ErrorBoundary>
            <div className="uk-grid uk-grid-small" data-uk-grid>
                <h4 className="uk-width-1-1 title-md uk-modal-title">{index === 0 ? `Related Party` : index === 1 ? `Related Party (${index + 1})` : `Related Party (${index + 1})`}</h4>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="firstName">First Name</label>
                    <div className="uk-form-controls">
                        <input
                            id="firstName"
                            className="uk-input uk-form-small"
                            type="text"
                            value={firstName}
                            name={"firstName"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="surname">Surname</label>
                    <div className="uk-form-controls">
                        <input
                            id="surname"
                            className="uk-input uk-form-small"
                            type="text"
                            value={surname}
                            name={"surname"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="partyIdNumber">ID Number</label>
                    <div className="uk-form-controls">
                        <input
                            id="partyIdNumber"
                            className="uk-input uk-form-small"
                            type="text"
                            value={idNumber}
                            name={"idNumber"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="relationship">Relationship</label>
                    <div className="uk-form-controls">
                        <input
                            id="relationship"
                            className="uk-input uk-form-small"
                            type="text"
                            value={relationship}
                            name={"relationship"}
                            onChange={onItemChange(index)}
                            required
                        />
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="riskRating">Risk Rating</label>
                    <div className="uk-form-controls">
                        <select
                            className="uk-select uk-form-small"
                            id="riskRating"
                            value={riskRating}
                            name={"riskRating"}
                            onChange={onItemChange(index)}
                            required
                        >
                            <option value={""} disabled>Select...</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
                <div className="uk-width-1-1">
                    <div className="uk-flex uk-flex-middle uk-flex-inline">
                        <div className="uk-margin">
                            <div className="icon">
                                <span data-uk-tooltip="Remove bank account details"
                                    onClick={() => onItemRemove(index)}
                                    data-uk-icon="icon: trash;"
                                ></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};