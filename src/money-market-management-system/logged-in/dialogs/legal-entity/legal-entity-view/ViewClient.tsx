import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { PersonalDetails } from "./PersonalDetails";
import { ClientAddressContactDetail, BankAccountDetails, ClientRelatedParty } from "./OtherClientForms";
import "./ViewModal.scss"
import { useNavigate, useParams } from "react-router-dom";
import Toolbar from "../../../shared/components/toolbar/Toolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../../../../../shared/components/loading/Loading";
import { useAppContext } from "../../../../../shared/functions/Context";

interface ITabsProps {
    tab: "Personal" | "Contact" | "Banking" | "Tax" | "Related" | "Accounts";
    setTab: React.Dispatch<React.SetStateAction<"Personal" | "Contact" | "Banking" | "Tax" | "Related" | "Accounts">>;
}
const Tabs = (props: ITabsProps) => {
    const activeClass = (tab: "Personal" | "Contact" | "Banking" | "Tax" | "Related" | "Accounts") => {
        if (props.tab === tab) return "uk-active";
        return "";
    };

    return (
        <div className="uk-margin-small-bottom">
            <ul className="kit-tabs" data-uk-tab>
                <li
                    className={activeClass("Personal")}
                    onClick={() => props.setTab("Personal")}
                >
                    <a href="void(0)">General Information</a>
                </li>
                <li
                    className={activeClass("Contact")}
                    onClick={() => props.setTab("Contact")}
                >
                    <a href="void(0)">Contact Details</a>
                </li>
                <li
                    className={activeClass("Banking")}
                    onClick={() => props.setTab("Banking")}
                >
                    <a href="void(0)">Banking Details</a>
                </li>
                <li
                    className={activeClass("Related")}
                    onClick={() => props.setTab("Related")}
                >
                    <a href="void(0)">Related Parties</a>
                </li>

                <li
                    className={activeClass("Accounts")}
                    onClick={() => props.setTab("Accounts")}
                >
                    <a href="void(0)">Money Market Accounts</a>
                </li>
            </ul>
        </div>
    );
};

const ViewLegalClient = observer(() => {

    const { api, store } = useAppContext();
    const { entityId } = useParams<{ entityId: string }>();

    const [loading, setLoading] = useState(false);

    const [tab, setTab] = useState<"Personal" | "Contact" | "Banking" | "Tax" | "Related" | "Accounts">("Personal");
    // const [client, setClient] = useState<INaturalPerson>({ ...defaultNaturalPerson });

    const client = store.client.legalEntity.getItemById(entityId || "");

    const onNavigate = useNavigate();

    const handleBack = () => {
        onNavigate(`/c/clients`);
    }

    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                await api.client.legalEntity.getById(entityId || "");
                setLoading(false);
            } catch (error) { }
            setLoading(false);
        };
        loadAll();
    }, [api.client.legalEntity, entityId]);

    return (
        <div className="purchases view-modal uk-section uk-section-small">
            <div className="uk-container uk-container-expand">
                <div className="sticky-top">
                    <Toolbar
                        title={`Client Entity ID: ${client?.asJson.entityId}`}
                        rightControls={
                            <div className="">
                                <button className="btn btn-danger" onClick={handleBack}>
                                    <FontAwesomeIcon className="uk-margin-small-right" icon={faArrowLeftLong} />Back to client list
                                </button>
                                {/* <button className="btn btn-text" onClick={handleBack}>
                                    <FontAwesomeIcon className="uk-margin-small-right" icon={faEdit} />Edit
                                </button>
                                <button className="btn btn-text" onClick={handleBack}>
                                    <FontAwesomeIcon className="uk-margin-small-right" icon={faChain} />Link to DocFox
                                </button> */}
                            </div>
                        }
                    />
                    <hr />
                </div>
                <div className="page-main-card uk-card uk-card-body">
                    <div className="sticky-top">
                        <ErrorBoundary>
                            <Toolbar
                                leftControls={

                                    <h3 className="main-title-lg">{client?.asJson.entityDisplayName || `${client?.asJson.entityDisplayName}`}</h3>


                                }
                                rightControls={
                                    <Tabs tab={tab} setTab={setTab} />
                                }
                            />
                        </ErrorBoundary>
                    </div>
                    {!loading &&
                        <>
                            {tab === "Personal" && client && (
                                <PersonalDetails
                                    client={client.asJson}
                                />
                            )}

                            {tab === "Contact" && client && (
                                <ClientAddressContactDetail
                                    client={client.asJson}
                                />
                            )}
                            {tab === "Banking" && client && (
                                <BankAccountDetails
                                    client={client.asJson}
                                />
                            )}
                            {tab === "Related" && client && (
                                <ClientRelatedParty
                                    client={client.asJson}
                                />
                            )}
                            {tab === "Accounts" && client && (
                                <></>
                            )}
                        </>
                    }
                    {
                        loading && <LoadingEllipsis />
                    }
                </div>
            </div>
        </div>
    );
});

export default ViewLegalClient;