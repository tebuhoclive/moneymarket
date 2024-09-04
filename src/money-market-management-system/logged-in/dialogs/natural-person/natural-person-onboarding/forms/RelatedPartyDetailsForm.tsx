import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FormEvent, ChangeEvent } from "react";

import { RelatedPartyItem } from "./RelatedPartyItem";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { IClientRelatedPartyDetails } from "../../../../../../shared/models/clients/ClientShared";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";

interface IRelatedPartyProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitRelatedParty: (e: FormEvent<HTMLFormElement>) => void;
    onBackToBankAccountInformation: () => void;
    loading: boolean;
}

export const RelatedPartyDetailsForm = observer((props: IRelatedPartyProps) => {
    const { client, setClient, onSubmitRelatedParty, onBackToBankAccountInformation, loading } = props;

    const onAddItem = () => {
        const newItem: IClientRelatedPartyDetails = {
            firstName: "",
            surname: "",
            idNumber: "",
            relationship: "",
            riskRating: "",
        };
        const related = client.relatedParty;
        related.push(newItem);
        setClient({ ...client, relatedParty: related });
    };

    const onItemChange = (index: number) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        runInAction(() => {
            const related = client.relatedParty;
            const name = e.target.name;
            const value = e.target.value;
            related[index] = { ...related[index], [name]: value };
            setClient({ ...client, relatedParty: related });
        })
    };

    const onItemRemove = (index: number) => {
        const related = client.relatedParty;
        related.splice(index, 1);
        setClient({ ...client, relatedParty: related });
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitRelatedParty}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Related Parties"} rightControls={
                        <>
                            {client.relatedParty.length !== 3 &&
                                <button className="btn btn-primary uk-margin" type="button"
                                    onClick={onAddItem}>
                                    <span data-uk-icon="icon: plus-circle; ratio:.8"></span>{" "}
                                    Related party
                                </button>
                            }

                        </>
                    }
                    />
                    <hr className="uk-width-1-1" />
                </div>
                {client.relatedParty.map((item, index) => (
                    <RelatedPartyItem
                        key={index}
                        index={index}
                        onItemChange={onItemChange}
                        onItemRemove={onItemRemove}
                        firstName={item.firstName || ""}
                        surname={item.surname || ""}
                        idNumber={item.idNumber || ""}
                        relationship={item.relationship || ""}
                        riskRating={item.riskRating || ""}
                    />
                ))}

                <div className="uk-width-1-1 uk-text-right">
                    <button className="btn btn-danger" type="button" onClick={onBackToBankAccountInformation}>
                        Back
                    </button>
                    {/* <button className="btn btn-warning" type="button">Save As Draft</button> */}
                    <button className="btn btn-primary" type="submit" >
                        Next
                    </button>

                </div>
            </form>
        </ErrorBoundary >
    );
});