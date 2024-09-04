import { observer } from "mobx-react-lite";

import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { VerifyUploadComponent } from '../../../../../../shared/components/instruction-file-upload/edit-upload-component/VerifyComponent';

interface IProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onCancel: () => void;
}

export const SupportingDocuments = observer((props: IProps) => {
    const { client, setClient } = props;

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid>
                {
                    client.isMinor !== "Yes" &&
                    <div className="uk-width-1-2">
                        <VerifyUploadComponent
                            onFileUpload={(fileUrl) => {
                                setClient((prev) => ({
                                    ...prev, sourceOfFunds: fileUrl
                                }));
                            }}
                            onProvideReason={(reason) => {
                                setClient((prev) => ({
                                    ...prev, reasonForNoSourceOfFunds: reason
                                }));
                            }}
                            fileUrl={client.supportingDocuments?.copyOfId || ""}
                            reasonForNotProvingFile={client.supportingDocuments?.reasonForNoCopyOfId || ""}
                            label="Copy of Namibian Identity Document or Foreign Passport"
                            allocation={""}
                        />
                    </div>
                }
                {
                    client.isMinor === "Yes" && client.supportingDocuments?.copyOfBirthCertificate &&
                    <div className="uk-width-1-2">
                        <VerifyUploadComponent
                            onFileUpload={(fileUrl) => {
                                setClient((prev) => ({
                                    ...prev, sourceOfFunds: fileUrl
                                }));
                            }}
                            onProvideReason={(reason) => {
                                setClient((prev) => ({
                                    ...prev, reasonForNoSourceOfFunds: reason
                                }));
                            }}
                            fileUrl={client.supportingDocuments.copyOfBirthCertificate || ""}
                            reasonForNotProvingFile={client.supportingDocuments.reasonForNoBirthCertificateId || ""}
                            label="Copy of unabridged birth certificate for minors"
                            allocation={""}
                        />
                    </div>

                }
                {
                    client.isMinor === "Yes" && client.supportingDocuments?.guardianId &&
                    <div className="uk-width-1-2">
                        <VerifyUploadComponent
                            onFileUpload={(fileUrl) => {
                                setClient((prev) => ({
                                    ...prev,
                                    sourceOfFunds: fileUrl,
                                }));
                            }}
                            onProvideReason={(reason) => {
                                setClient((prev) => ({
                                    ...prev,
                                    reasonForNoSourceOfFunds: reason,
                                }));
                            }}
                            fileUrl={client.supportingDocuments?.guardianId || ""}
                            reasonForNotProvingFile={client.supportingDocuments?.reasonForNoGuardianId || ""}
                            label="Parents/Legal Guardian National Identity Document or Valid Passport"
                            allocation={""}
                        />
                    </div>

                }

                {
                    client.isMinor === "Yes" && client.supportingDocuments?.courtOrder &&
                    <div className="uk-width-1-2">
                        <VerifyUploadComponent
                            onFileUpload={(fileUrl) => {

                                setClient((prev) => ({
                                    ...prev,
                                    sourceOfFunds: fileUrl,
                                }));
                            }}
                            onProvideReason={(reason) => {

                                setClient((prev) => ({
                                    ...prev,
                                    reasonForNoSourceOfFunds: reason,
                                }));
                            }}
                            fileUrl={client.supportingDocuments?.courtOrder || ""}
                            reasonForNotProvingFile={client.supportingDocuments?.reasonForCourtOrder || ""}
                            label="Court order or Power of Attorney for legal guardian or curators (if applicable)"
                            allocation={""}
                        />
                    </div>

                }

                <div className="uk-width-1-2">
                    <VerifyUploadComponent
                        onFileUpload={(fileUrl) => {
                            setClient((prev) => ({
                                ...prev,
                                sourceOfFunds: fileUrl,
                            }));
                        }}
                        onProvideReason={(reason) => {
                            setClient((prev) => ({
                                ...prev,
                                reasonForNoSourceOfFunds: reason,
                            }));
                        }}
                        fileUrl={client.supportingDocuments?.relatedPartyForm || ""}
                        reasonForNotProvingFile={client.supportingDocuments?.reasonForNoRelatedPartyForm || ""}
                        label="Acting on behalf on an investor: Related Party Form to be completed (if applicable)"
                        allocation={""}
                    />
                </div>

                <div className="uk-width-1-2">
                    <VerifyUploadComponent
                        onFileUpload={(fileUrl) => {
                            setClient((prev) => ({
                                ...prev,
                                sourceOfFunds: fileUrl,
                            }));
                        }}
                        onProvideReason={(reason) => {
                            setClient((prev) => ({
                                ...prev,
                                reasonForNoSourceOfFunds: reason,
                            }));
                        }}
                        fileUrl={client.supportingDocuments?.bankConfirmation || ""}
                        reasonForNotProvingFile={client.supportingDocuments?.reasonForBankConfirmation || ""}
                        label="Stamped bank statement or bank confirmation not older than 3 months"
                        allocation={""}
                    />
                </div>

                <div className="uk-width-1-2">
                    <VerifyUploadComponent
                        onFileUpload={(fileUrl) => {
                            setClient((prev) => ({
                                ...prev,
                                sourceOfFunds: fileUrl,
                            }));
                        }}
                        onProvideReason={(reason) => {
                            setClient((prev) => ({
                                ...prev,
                                reasonForNoSourceOfFunds: reason,
                            }));
                        }}
                        fileUrl={client.supportingDocuments?.proofOfSourceOfFunds || ""}
                        reasonForNotProvingFile={client.supportingDocuments?.reasonForNoSourceOfFunds || ""}
                        label="Proof of source of funds and income (refer to annexure 1)"
                        allocation={""}
                    />
                </div>

                <div className="uk-width-1-2">
                    <VerifyUploadComponent
                        onFileUpload={(fileUrl) => {
                            setClient((prev) => ({
                                ...prev,
                                sourceOfFunds: fileUrl,
                            }));
                        }}
                        onProvideReason={(reason) => {
                            setClient((prev) => ({
                                ...prev,
                                reasonForNoSourceOfFunds: reason,
                            }));
                        }}
                        fileUrl={client.supportingDocuments?.ijgMoneyMarketTrustMandate || ""}
                        reasonForNotProvingFile={client.supportingDocuments?.reasonForNoIJGMoneyMarketTrustMandate || ""}
                        label="IJG Money Market Trust Mandate"
                        allocation={""}
                    />
                </div>
            </form>
        </ErrorBoundary >
    );
});