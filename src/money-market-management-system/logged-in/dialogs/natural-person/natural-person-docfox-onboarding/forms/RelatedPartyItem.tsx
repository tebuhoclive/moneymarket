import { ChangeEvent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import SingleSelect from "../../../../../../shared/components/single-select/SingleSelect";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { INaturalPerson, defaultNaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";

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

export const RelatedPartyItem = observer((props: IProps) => {

    const { store } = useAppContext();

    const user = store.auth.meJson;

    const hasDeletePermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.delete === true);

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

    const [relatedPartyItem, setRelatedPartyItem] = useState<INaturalPerson>({ ...defaultNaturalPerson });
    const [relatedParty, setRelatedParty] = useState<string>("");

    const relatedParties = store.client.naturalPerson.all;

    const relatedPartyOptions = relatedParties.map((relatedParty) => ({
        label: relatedParty.asJson.entityDisplayName,
        value: relatedParty.asJson.id
    }));
    const handleSelectedParty = (value: string) => {
        setRelatedParty(value)
    }
    useEffect(() => {
        if (relatedParty) {
            const item = store.client.naturalPerson.getItemById(relatedParty);
            console.log("item", item);

            if (item) {
                store.client.naturalPerson.select(item.asJson);
                if (store.client.naturalPerson.selected) {
                    const selectedParty = store.client.naturalPerson.selected;
                    setRelatedPartyItem(selectedParty)
                }
            }
        }
    }, [relatedParty, store.client.naturalPerson]);


    return (
        <ErrorBoundary>
            <div className="uk-grid uk-grid-small" data-uk-grid>
                <h4 className="uk-width-1-1 title-md uk-modal-title">{index === 0 ? `Related Party` : index === 1 ? `Related Party (${index + 1})` : `Related Party (${index + 1})`}</h4>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="relatedParty">Related party</label>
                    <div className="uk-form-controls">
                        <SingleSelect
                            options={relatedPartyOptions}
                            name="relatedParty"
                            value={relatedParty}
                            onChange={handleSelectedParty}
                            placeholder="Select related party"
                            required
                        />
                    </div>
                </div>

                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="firstName">First Name</label>
                    <div className="uk-form-controls">
                        {
                            relatedPartyItem.clientName &&
                            <input
                                id="firstName"
                                className="uk-input uk-form-small"
                                type="text"
                                value={relatedPartyItem.clientName}
                                name={"firstName"}
                                onChange={onItemChange(index)}
                                required
                                disabled
                            />
                        }

                        {
                            !relatedPartyItem.clientName &&
                            <input
                                id="firstName"
                                className="uk-input uk-form-small"
                                type="text"
                                value={firstName}
                                name={"firstName"}
                                onChange={onItemChange(index)}
                                required
                            />
                        }
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="surname">Surname</label>
                    <div className="uk-form-controls">
                        {
                            relatedPartyItem.clientSurname &&
                            <input
                                id="surname"
                                className="uk-input uk-form-small"
                                type="text"
                                value={relatedPartyItem.clientSurname}
                                name={"surname"}
                                onChange={onItemChange(index)}
                                required
                                disabled
                            />
                        }

                        {
                            !relatedPartyItem.clientSurname &&
                            <input
                                id="surname"
                                className="uk-input uk-form-small"
                                type="text"
                                value={surname}
                                name={"surname"}
                                onChange={onItemChange(index)}
                                required
                            />
                        }
                    </div>
                </div>
                <div className="uk-width-1-2">
                    <label className="uk-form-label required" htmlFor="partyIdNumber">ID Number</label>
                    <div className="uk-form-controls">
                        {
                            relatedPartyItem.idNumber &&
                            <input
                                id="partyIdNumber"
                                className="uk-input uk-form-small"
                                type="text"
                                value={relatedPartyItem.idNumber}
                                name={"idNumber"}
                                onChange={onItemChange(index)}
                                required
                                disabled
                            />
                        }
                        {
                            !relatedPartyItem.idNumber &&
                            <input
                                id="partyIdNumber"
                                className="uk-input uk-form-small"
                                type="text"
                                value={idNumber}
                                name={"idNumber"}
                                onChange={onItemChange(index)}
                                required
                            />
                        }
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
                {hasDeletePermission && index !== 0 && <> <div className="uk-width-1-1">
                    <div className="uk-flex uk-flex-middle uk-flex-inline">
                        <div className="uk-margin">
                            <div className="icon">
                                <span data-uk-tooltip="Remove bank account details"
                                    onClick={() => onItemRemove(index)}
                                    data-uk-icon="icon: trash;"
                                    className="uk-text-danger"
                                ></span>
                            </div>
                        </div>
                    </div>
                </div></>}
            </div>
        </ErrorBoundary>
    );
});