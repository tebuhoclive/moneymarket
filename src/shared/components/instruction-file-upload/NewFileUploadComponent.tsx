import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { RefObject, useEffect, useRef, useState } from 'react';
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
    setOnClearFalse?: ((clear: boolean) => void) | undefined;
    depositTransaction?: IDepositTransaction;
    selectedAccount?: string;
}
interface ComponentProps {
    isUpload: boolean;
    label: string;
    file: File | null;
    reasonText: string;
    fileUploadProgress: number;
    loading: boolean;
    fileUrl: string | null;
    handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleReasonChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    depositTransaction?: IDepositTransaction;
    _setIsUpload?: (value: boolean) => void;
    setHandleIsUpload?: (value: boolean) => void;
}

export const FileUploadComponent = observer((props: IProps) => {
    const { store } = useAppContext();
    const { setFileUrl, reason, label, onClearFileComponent = false, setOnClearFalse, depositTransaction, selectedAccount } = props;
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


        const storageRef = ref(storage, `uploads/deposits/${dateFormat_DD_MM_YY(Date.now())}/${selectedAccount}/${label}`);

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
        const checked = event.target.checked;


        setIsUpload(checked);

        if (checked) {

            setFileUrl('');
            setFile(null);
            setFileUrlState(null);
            setReasonText(''); // Clear the reason as we are now uploading a file
        } else {

            setFileUrlState(null);
            setFile(null);
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
            // setIsUpload(Boolean(selectedAttachment.url));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onClearFileComponent, setOnClearFalse]);

    return (
        <div>
            {store.depositTransaction.selected &&
                <EditView
                    isUpload={isUpload}
                    label={label}
                    file={file}
                    reasonText={reasonText}
                    fileUploadProgress={fileUploadProgress}
                    loading={loading}
                    fileUrl={fileUrl}
                    handleCheckboxChange={handleCheckboxChange}
                    handleFileSelect={handleFileSelect}
                    handleReasonChange={handleReasonChange}
                    fileInputRef={fileInputRef}
                    depositTransaction={depositTransaction}
                    _setIsUpload={setIsUpload}
                    setHandleIsUpload={setIsUpload}
                />
            }
            {!store.depositTransaction.selected &&
                <CreateView
                    isUpload={isUpload}
                    label={label}
                    file={file}
                    reasonText={reasonText}
                    fileUploadProgress={fileUploadProgress}
                    loading={loading}
                    fileUrl={fileUrl}
                    handleCheckboxChange={handleCheckboxChange}
                    handleFileSelect={handleFileSelect}
                    handleReasonChange={handleReasonChange}
                    fileInputRef={fileInputRef}
                    depositTransaction={depositTransaction}
                    _setIsUpload={setIsUpload}
                    setHandleIsUpload={setIsUpload}
                />
            }
        </div>
    );
});


const EditView = observer((props: ComponentProps) => {
    const {
        isUpload, label, file,
        reasonText, fileUploadProgress, loading,
        fileUrl, handleCheckboxChange, handleFileSelect,
        handleReasonChange, fileInputRef, depositTransaction
    } = props;


    const [_isUpload, _setIsUpload] = useState<boolean>(false)

    useEffect(() => {
        if (!depositTransaction) return;

        const attachments: any = {
            "Proof of Payment": depositTransaction?.proofOfPaymentAttachment,
            "Source of Funds": depositTransaction?.sourceOfFundsAttachment,
        };

        const selectedAttachment = attachments[label];

        if (selectedAttachment && selectedAttachment.url) {
            _setIsUpload(true);
        } else {
            _setIsUpload(false);
        }

    }, [depositTransaction, label]);
    console.log("fileUrl " + fileUrl)

    return (
        <>

            <label className="uk-form-label" >
                {fileUrl ? "Replace" : "Attach"} {label} {"  "}
                <input className='uk-checkbox' type="checkbox" checked={isUpload} onChange={handleCheckboxChange} />
            </label>

            {isUpload || _isUpload ? (
                <>
                    <div data-uk-form-custom="target: true">
                        {isUpload &&
                            <>
                                <input
                                    type="file"
                                    aria-label="Custom controls"
                                    accept=".pdf, .jpg, .jpeg, .png, .eml"
                                    onChange={handleFileSelect}
                                    id="fileToAttach"
                                    ref={fileInputRef}
                                />
                                <input
                                    className="uk-form-small"
                                    type="text"
                                    // placeholder={fileUrl ? "Replace file" : "Select file"}
                                    aria-label="Custom controls"
                                    disabled
                                    value={fileUrl === "" ? '' : file?.name || ''}
                                />
                            </>
                        }

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
            ) :
                <div className="uk-margin-small-top">
                    <textarea
                        className="uk-form-small"
                        cols={5}
                        value={reasonText}
                        onChange={handleReasonChange}
                        // placeholder="Please provide a reason"
                        required
                    />
                </div>
            }
        </>
    )
})
const CreateView = observer((props: ComponentProps) => {
    const {
        isUpload, label, file,
        reasonText, fileUploadProgress, loading,
        fileUrl, handleCheckboxChange, handleFileSelect,
        handleReasonChange, fileInputRef, depositTransaction
    } = props;


    const [_isUpload, _setIsUpload] = useState<boolean>(false)

    useEffect(() => {
        if (!depositTransaction) return;

        const attachments: any = {
            "Proof of Payment": depositTransaction?.proofOfPaymentAttachment,
            "Source of Funds": depositTransaction?.sourceOfFundsAttachment,
        };

        const selectedAttachment = attachments[label];

        if (selectedAttachment && selectedAttachment.url) {
            _setIsUpload(true);
        } else {
            _setIsUpload(false);
        }

    }, [depositTransaction, label]);
    console.log("fileUrl " + fileUrl)

    return (
        <>

            <label className="uk-form-label" >
                Attach {label} {"  "}
                <input className='uk-checkbox' type="checkbox" checked={isUpload} onChange={handleCheckboxChange} />
            </label>

            {isUpload || _isUpload ? (
                <>
                    <div data-uk-form-custom="target: true">
                        <input
                            type="file"
                            aria-label="Custom controls"
                            accept=".pdf, .jpg, .jpeg, .png, .eml"
                            onChange={handleFileSelect}
                            id="fileToAttach"
                            ref={fileInputRef}
                        />
                        <input
                            className="uk-form-small"
                            type="text"
                            // placeholder={fileUrl ? "Replace file" : "Select file"}
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
            ) :
                <div className="uk-margin-small-top">
                    <textarea
                        className="uk-form-small"
                        cols={5}
                        value={reasonText}
                        onChange={handleReasonChange}
                        // placeholder="Please provide a reason"
                        required
                    />
                </div>
            }
        </>
    )
})

// const CreateView = observer((props: ComponentProps) => {
//     const {
//         isUpload, label, file,
//         reasonText, fileUploadProgress, loading,
//         fileUrl, handleCheckboxChange, handleFileSelect,
//         handleReasonChange, fileInputRef, depositTransaction
//     } = props;

//     return (
//         <>
//             <label className={"uk-form-label"} >
//                 Attach {label}  {"  "} <input className='uk-checkbox' type="checkbox" checked={isUpload} onChange={handleCheckboxChange} />
//             </label>
//             {isUpload ?
//                 <>
//                     <div data-uk-form-custom="target: true">
//                         <input
//                             type="file"
//                             aria-label="Custom controls"
//                             accept=".pdf, .jpg, .jpeg, .png, .eml"
//                             onChange={handleFileSelect}
//                             id="fileToAttach"
//                             ref={fileInputRef}
//                             required
//                         />
//                         <input
//                             type="text"
//                             placeholder={fileUrl ? "Replace File" : "Select File"}
//                             aria-label="Custom controls"
//                             disabled
//                             value={fileUrl === "" ? '' : file?.name || ''}
//                         />
//                     </div>
//                     {
//                         fileUrl &&
//                         <div>
//                             <a className='btn btn-primary' href={fileUrl} target="_blank" rel="noopener noreferrer">View file</a>
//                         </div>
//                     }
//                 </>
//                 :
//                 <div className="">
//                     <textarea value={reasonText} onChange={handleReasonChange} required cols={40} rows={2} />
//                     <small className="uk-display-block" style={{ color: "white" }}>Provide a reason for the absence of {label}</small>
//                 </div>
//             }
//             {loading && <progress className="uk-progress uk-progress-success" value={fileUploadProgress} max="100" />}
//         </>
//     )
// })