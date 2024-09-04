import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { FormEvent, ChangeEvent } from "react";

import { RelatedPartyItem } from "./RelatedPartyItem";
import React from "react";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { useAppContext } from "../../../../../../shared/functions/Context";
import { IClientRelatedPartyDetails } from "../../../../../../shared/models/clients/ClientShared";
import { IDocFoxNaturalPerson } from "../../../../../../shared/models/clients/DocFoxNaturalPersonModel";

interface IRelatedPartyProps {
    client: IDocFoxNaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<IDocFoxNaturalPerson>>;
    onSubmitRelatedParty: (e: FormEvent<HTMLFormElement>) => void;
    onBackToTaxDetail: () => void;
    loading: boolean;
}

export const RelatedPartyDetailsForm = observer((props: IRelatedPartyProps) => {
    const { client, setClient, onSubmitRelatedParty, onBackToTaxDetail, loading } = props;

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

    const { store } = useAppContext();
    const user = store.auth.meJson;

    const hasCreatePersmission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.create === true);
    const hasEditingPermission = user?.feature.some((feature) => feature.featureName === "Client Profile Management" && feature.update === true);

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitRelatedParty}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Related Parties"} rightControls={
                        <>
                            {hasCreatePersmission && client.relatedParty.length !== 3 &&
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
                    <button
                        className="btn-text uk-margin-right"
                        type="button"
                        onClick={onBackToTaxDetail}
                    >
                        Back
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={loading} >
                        Save {loading && <div data-uk-spinner="ratio: .5"></div>}
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});