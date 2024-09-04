import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
import { dateFormat_DD_MM_YY } from '../../utils/utils';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../../functions/Context';
import { IDepositTransaction } from '../../models/deposit-transaction/DepositTransactionModel';

type labelType = "Proof of Payment" | "Source of Funds";

interface IProps {
    setFileUrl: (url: string) => void;
    reason: (value: string) => void;
    label: labelType;
    onClearFileComponent: boolean;
    setOnClearFalse: ((clear: boolean) => void) | undefined;
    depositTransaction?: IDepositTransaction;
}

export const FileUploadComponent = observer((props: IProps) => {
    const { store } = useAppContext();
    const { setFileUrl, reason, label, onClearFileComponent = false, setOnClearFalse, depositTransaction } = props;
    const [isUpload, setIsUpload] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [reasonText, setReasonText] = useState<string>('');
    const [fileUploadProgress, setFileUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fileUrl, setFileUrlState] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            await handleFileUpload(selectedFile);
        }
    };

    const handleFileUpload = async (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/A02232/${label}`);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFileUploadProgress(progress);
        });

        try {
            setLoading(true);
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            setFileUrl(downloadURL);
            setFileUrlState(downloadURL);
            setFile(null);
            setFileUploadProgress(0);
            setLoading(false);
        } catch (error) {
            console.error("File upload failed:", error);
            setLoading(false);
        }
    };

    const handleReasonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setReasonText(value);
        reason(value);
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsUpload(event.target.checked);
        if (event.target.checked) {
            setFileUrl('');
            setFile(null);
            setFileUrlState(null);
        }
    };

    useEffect(() => {
        if (!store.depositTransaction.selected) return;

        const attachments = {
            "Proof of Payment": depositTransaction?.proofOfPaymentAttachment,
            "Source of Funds": depositTransaction?.sourceOfFundsAttachment,
        };

        const selectedAttachment = attachments[label];

        if (selectedAttachment) {
            setReasonText(selectedAttachment.reasonForNotAttaching || "");
            setFileUrlState(selectedAttachment.url || "");
            setIsUpload(Boolean(selectedAttachment.url));
        }
    }, [store.depositTransaction.selected, depositTransaction, label]);


    useEffect(() => {
        if (onClearFileComponent) {
            setIsUpload(false);
            setFile(null);
            setReasonText('');
            setFileUploadProgress(0);
            setLoading(false);
            setFileUrlState(null);
            setFileUrl('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (setOnClearFalse) {
                setOnClearFalse(false);
            }
        }
    }, [onClearFileComponent, setOnClearFalse]);

    return (
        <div>
            <label className="uk-form-label uk-display-block required">{label}</label>
            <label>
                <input
                    type="checkbox"
                    checked={isUpload}
                    onChange={handleCheckboxChange}
                />
                Upload a file
            </label>

            {isUpload ? (
                <>
                    <div className="uk-width-1-1" data-uk-form-custom="target: true">
                        <input
                            type="file"
                            aria-label="Custom controls"
                            accept=".pdf, .jpg, .jpeg, .png, .eml"
                            onChange={handleFileSelect}
                            id="fileToAttach"
                            ref={fileInputRef}
                            required
                        />
                        <input
                            className="uk-input uk-form-small"
                            type="text"
                            placeholder={fileUrl ? "Replace file" : "Select file"}
                            aria-label="Custom controls"
                            disabled
                            value={fileUrl === "" ? '' : file?.name || ''}
                        />
                    </div>
                    {fileUrl && (
                        <div>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">View file</a>
                        </div>
                    )}
                    {loading && (
                        <progress
                            className="uk-progress uk-progress-success"
                            value={fileUploadProgress}
                            max="100"
                        />
                    )}
                </>
            ) : (
                <div className="uk-margin">
                    <textarea
                        className="uk-textarea uk-form-small"
                        value={reasonText}
                        onChange={handleReasonChange}
                        placeholder="Please provide a reason"
                        required
                    />
                </div>
            )}
        </div>
    );
});
