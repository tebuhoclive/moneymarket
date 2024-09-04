import { observer } from "mobx-react-lite";
import { FormEvent, useState } from "react";

import Toolbar from "../../../../shared/components/toolbar/Toolbar";
import ErrorBoundary from "../../../../../../shared/components/error-boundary/ErrorBoundary";
import { INaturalPerson } from "../../../../../../shared/models/clients/NaturalPersonModel";
import { useAppContext } from "../../../../../../shared/functions/Context";
import InstructionFileUploader from "../../../../../../shared/components/instruction-file-upload/InstructionFileUploader";

interface IProps {
    client: INaturalPerson;
    setClient: React.Dispatch<React.SetStateAction<INaturalPerson>>;
    onSubmitSupportingDocuments: (e: FormEvent<HTMLFormElement>) => void;
    onBackToRelatedParty: () => void;
    loading: boolean;
}

export const SupportingDocuments = observer((props: IProps) => {
    const { store } = useAppContext();
    const { client, setClient, onSubmitSupportingDocuments, onBackToRelatedParty, loading } = props;

    const [copyOfIdFileURL, setCopyOfIdFileURL] = useState("");
    const [reasonForCopyOfIdAttachment, setReasonForCopyOfIdAttachment] = useState("");

    const [relatedPartyApplicationFileURL, setRelatedPartyApplicationFileURL] = useState("");
    const [reasonForRelatedPartyApplicationAttachment, setReasonForNoRelatedPartyApplicationAttachment] = useState("");

    const [bankConfirmationURL, setBankConfirmationFileURL] = useState("");
    const [reasonForNoBankConfirmationAttachment, setReasonForBankConfirmationAttachment] = useState("");

    const [birthCertificateURL, setBirthCertificateFileURL] = useState("");
    const [reasonForNoBirthCertificateAttachment, setReasonForNoBirthCertificateAttachment] = useState("");

    const handleCopyOfIdFileUpload = (url: string) => {
        setCopyOfIdFileURL(url);
    };
    const handleReasonForCopyOfIdAttachment = (reason: string) => {
        setReasonForCopyOfIdAttachment(reason);
    };

    const handleBirthCertificateFileUpload = (url: string) => {
        setBirthCertificateFileURL(url);
    };

    const handleReasonForNoBirthCertificateAttachment = (reason: string) => {
        setReasonForNoBirthCertificateAttachment(reason);
    };

    const handleRelatedPartyApplicationFileUpload = (url: string) => {
        setRelatedPartyApplicationFileURL(url);
    };
    const handleReasonForRelatedPartyApplicationAttachment = (reason: string) => {
        setReasonForNoRelatedPartyApplicationAttachment(reason);
    };

    const handleBankConfirmationFileUpload = (url: string) => {
        setBankConfirmationFileURL(url);
    };
    const handleReasonForBankConfirmationAttachment = (reason: string) => {
        setReasonForBankConfirmationAttachment(reason);
    };

    return (
        <ErrorBoundary>
            <form className="uk-form-stacked uk-grid-small" data-uk-grid
                onSubmit={onSubmitSupportingDocuments}>
                <div className="uk-width-1-1 uk-margin-top-small">
                    <hr className="uk-width-1-1" />
                    <Toolbar title={"Supporting Documents"}
                    />
                    <hr className="uk-width-1-1" />
                </div>
                {
                    client.isMinor === "Yes" &&
                    <div className="uk-width-1-2">
                        <InstructionFileUploader
                            onFileUpload={handleBirthCertificateFileUpload}
                            onProvideReason={handleReasonForNoBirthCertificateAttachment}
                            fileUrl={birthCertificateURL}
                            reasonForNotProvingFile={reasonForNoBirthCertificateAttachment}
                            label="Copy of Namibian Identity Document or Foreign Passport"
                            allocation={""}
                            value={reasonForCopyOfIdAttachment}
                            fileValue={copyOfIdFileURL}
                        />
                    </div>
                }
                <div className="uk-width-1-2">
                    <InstructionFileUploader
                        onFileUpload={handleCopyOfIdFileUpload}
                        onProvideReason={handleReasonForCopyOfIdAttachment}
                        fileUrl={copyOfIdFileURL}
                        reasonForNotProvingFile={reasonForCopyOfIdAttachment}
                        label="Copy of Namibian Identity Document or Foreign Passport"
                        allocation={""}
                        value={reasonForCopyOfIdAttachment}
                        fileValue={copyOfIdFileURL}
                    />
                </div>
                <div className="uk-width-1-1 uk-text-right">
                    <button className="btn btn-danger" type="button" onClick={onBackToRelatedParty}>Back</button>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {store.client.naturalPerson.selected ? 'Update Profile' : 'Create Profile'}
                        {loading && <span data-uk-spinner="ratio: .5"></span>}
                    </button>
                </div>
            </form>
        </ErrorBoundary >
    );
});