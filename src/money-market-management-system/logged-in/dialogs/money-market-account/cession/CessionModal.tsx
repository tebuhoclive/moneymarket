import { FormEvent, useRef, useState } from "react";
import { useAppContext } from "../../../../../shared/functions/Context";
import { defaultCessionInstruction, ICessionInstruction } from "../../../../../shared/models/cession/CessionInstructionModel";
import { observer } from "mobx-react-lite";
import DetailView, { IDataDisplay } from "../../../shared/components/detail-view/DetailView";
import { currencyFormat } from "../../../../../shared/functions/Directives";
import NumberInput from "../../../shared/components/number-input/NumberInput";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { dateFormat_DD_MM_YY } from "../../../../../shared/utils/utils";
import { hideModalFromId } from "../../../../../shared/functions/ModalShow";
import MODAL_NAMES from "../../ModalName";

const CessionModal = observer(() => {
    const { api, store } = useAppContext();
    const account = store.mma.selected;

    const user = store.user.me?.asJson.uid;

    const [cession, setCession] = useState<ICessionInstruction>({
        ...defaultCessionInstruction
    });

    const [isInstructionUploaded, setIsInstructionUploaded] = useState<boolean>(false);
    const [instructionFile, setInstructionFile] = useState<File | null>(null);
    const [instructionFileUploadProgress, setInstructionFileUploadProgress] = useState(0);
    const fileInputRefInstruction = useRef<HTMLInputElement>(null);
    const [loadingInstructionUpload, setLoadingInstructionUpload] = useState(false);
    const [instructionFileUrl, setInstructionFileUrl] = useState<string | null>(null);

    const [isLegalAgreementUploaded, setIsLegalAgreementUploaded] = useState<boolean>(false);
    const [legalAgreementFile, setLegalAgreementFile] = useState<File | null>(null);
    const [legalAgreementFileUploadProgress, setLegalAgreementFileUploadProgress] = useState(0);
    const fileInputRefLegalAgreement = useRef<HTMLInputElement>(null);
    const [loadingLegalAgreementUpload, setLoadingLegalAgreementUpload] = useState(false);
    const [legalAgreementFileUrl, setLegalAgreementFileUrl] = useState<string | null>(null);

    const [selectedTab, setSelectedTab] = useState("Cession");

    const handleInstructionFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setInstructionFile(selectedFile);
            await handleFileUploadInstruction(selectedFile);
        }
    };

    const handleLegalAgreementFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile) {
            setLegalAgreementFile(selectedFile);
            await handleFileUploadLegalAgreement(selectedFile);
        }
    };

    const availableCession = account?.balance && account?.cession ? account.balance - account.cession : 0

    const accountDetails: IDataDisplay[] = [
        { label: 'Current Account Balance', value: currencyFormat(account?.balance || 0) },
        { label: 'Current Cession Balance', value: currencyFormat(account?.cession || 0) },
        { label: 'Available Cession Amount', value: currencyFormat(availableCession) },
    ];

    const handleFileUploadInstruction = async (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/cessions/${dateFormat_DD_MM_YY(Date.now())}/${cession.accountNumber}/Client Instruction`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setInstructionFileUploadProgress(progress);
        });
        try {
            setLoadingInstructionUpload(true);
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            setCession({
                ...cession,
                clientInstructionAttachment: {
                    url: downloadURL,
                    reasonForNoAttachment: ""
                }
            })
            setInstructionFileUrl(downloadURL);
            setInstructionFile(null);
            setInstructionFileUploadProgress(0);
            setLoadingInstructionUpload(false);
        } catch (error) {
            setLoadingInstructionUpload(false);
        }
    };

    const handleFileUploadLegalAgreement = async (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `uploads/cessions/${dateFormat_DD_MM_YY(Date.now())}/${cession.accountNumber}/Client Legal Agreement`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on("state_changed", (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setLegalAgreementFileUploadProgress(progress);
        });
        try {
            setLoadingLegalAgreementUpload(true);
            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);
            setCession({
                ...cession,
                legalAgreement: {
                    url: downloadURL,
                    reasonForNoAttachment: ""
                }
            })
            setLegalAgreementFileUrl(downloadURL);
            setLegalAgreementFile(null);
            setLegalAgreementFileUploadProgress(0);
            setLoadingInstructionUpload(false);
        } catch (error) {
            setLoadingLegalAgreementUpload(false);
        }
    };

    const handleReasonForNoInstructionAttachment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setCession({
            ...cession,
            clientInstructionAttachment: {
                url: "",
                reasonForNoAttachment: value
            }
        })
    };

    const handleReasonForNoLegalAgreementAttachment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setCession({
            ...cession,
            legalAgreement: {
                url: "",
                reasonForNoAttachment: value
            }
        })
    };

    const handleCheckboxForInstructionNoAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsInstructionUploaded(checked);
        if (checked) {
            setInstructionFile(null);
            setInstructionFileUrl(null);
        } else {
            setInstructionFileUrl(null);
            setInstructionFile(null);
        }
    };

    const handleCheckboxForLegalAgreementNoAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsLegalAgreementUploaded(checked);
        if (checked) {
            setLegalAgreementFile(null);
            setLegalAgreementFileUrl(null);
        } else {
            setLegalAgreementFileUrl(null);
            setLegalAgreementFile(null);
        }
    };

    const onCancel = () => {
        store.mma.clearSelected();
        hideModalFromId(MODAL_NAMES.ADMIN.CESSION_LOADING);
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (account && user) {
            const cessionToLoad: ICessionInstruction = {
                id: "",
                accountNumber: account.accountNumber,
                institution: cession.institution,
                cessionDescription: cession.cessionDescription,
                notes: cession.notes,
                amount: cession.amount,
                clientInstructionAttachment: {
                    url: cession.clientInstructionAttachment.url,
                    reasonForNoAttachment: cession.clientInstructionAttachment.reasonForNoAttachment
                },
                legalAgreement: {
                    url: cession.legalAgreement.url,
                    reasonForNoAttachment: cession.legalAgreement.reasonForNoAttachment
                },
                cessionStatus: "Active",
                loadedBy: user,
                dateLoaded: Date.now()
            }

            const accountNewCessionBalance = {
                ...account,
                cession: account.cession + cessionToLoad.amount
            }

            try {
                await api.mma.update(accountNewCessionBalance);
                try {
                    await api.cessionInstruction.create(account.id, cessionToLoad);
                } catch (error) {
                    alert(error);
                }
            } catch (error) {

            }
            onCancel();
        }
    };

    return (
        <div className="custom-modal-style uk-modal-dialog uk-margin-auto-vertical uk-width-4-5">
            <button className="uk-modal-close-default" type="button" data-uk-close></button>
            <div className="form-title">
                <h3 style={{ marginRight: "1rem" }}>
                    Cession
                </h3>
                <img src={`${process.env.PUBLIC_URL}/arrow.png`} alt="" />
                <h3 className="text-to-break" style={{ marginLeft: "2rem" }}>
                    New Cession on Account: {account?.accountNumber}
                </h3>
            </div>
            <hr />
            <div className="uk-margin-bottom uk-text-right">
                <button className={`btn ${selectedTab === "Cession" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Cession")}>
                    Cession Form
                </button>
                <button className={`btn ${selectedTab === "Audit Trail" ? "btn-primary" : "btn-primary-in-active"}`} onClick={() => setSelectedTab("Audit Trail")}>
                    Audit Trail
                </button>
            </div>
            <form className="ijg-form" onSubmit={handleSubmit}>
                <div className="dialog-content uk-position-relative uk-grid" data-uk-grid>
                    {
                        selectedTab === "Cession" &&
                        <>
                            <div className="uk-width-1-2">
                                <div className=" ">
                                    <label className="required " htmlFor="">Institution</label>
                                    <input className="uk-text " onChange={(e) => setCession({ ...cession, institution: e.target.value })} type="text" name="" id="" required />
                                </div>
                                <div className="">
                                    <label className="required " htmlFor="">Amount</label>
                                    <NumberInput value={cession.amount} onChange={(value) => setCession({ ...cession, amount: Number(value) })} className="" required />
                                </div>
                                <div className="">
                                    <label className="required " htmlFor="">Cession Title</label>
                                    <input className="uk-text " onChange={(e) => setCession({ ...cession, cessionDescription: e.target.value })} type="text" name="" id="" required />
                                </div>
                                <div className="">
                                    <label className="" htmlFor="">Notes</label>
                                    <textarea className="uk-text " onChange={(e) => setCession({ ...cession, notes: e.target.value })} cols={50} rows={2} name="" id="" required />
                                </div>
                                <div className="uk-width-1-1 uk-margin-small-bottom">
                                    <label className="uk-form-label required" >
                                        Attach Client Instruction: {" "}
                                        <input className='uk-checkbox' type="checkbox"
                                            checked={isInstructionUploaded}
                                            onChange={handleCheckboxForInstructionNoAttachment} //
                                        />
                                    </label>
                                    {isInstructionUploaded ? //CHANGE
                                        <div>
                                            <div data-uk-form-custom="target: true">
                                                <input
                                                    type="file"
                                                    aria-label="Custom controls"
                                                    accept=".pdf, .jpg, .jpeg, .png, .eml"
                                                    onChange={handleInstructionFileUpload} //
                                                    id="fileToAttach"
                                                    ref={fileInputRefInstruction} //CHAN
                                                />
                                                <input
                                                    className="uk-form-small"
                                                    type="text"
                                                    placeholder={instructionFileUrl ? "Replace file" : "Select file"} //
                                                    aria-label="Custom controls"
                                                    disabled
                                                    value={instructionFileUrl === "" ? '' : instructionFile?.name || ''}  //
                                                />
                                            </div>
                                            {instructionFileUrl && ( //
                                                <div>
                                                    <a
                                                        href={instructionFileUrl} //
                                                        target="_blank" rel="noopener noreferrer">View file</a>
                                                </div>
                                            )}
                                            {loadingInstructionUpload && //
                                                <progress
                                                    className="uk-progress uk-progress-success"
                                                    value={instructionFileUploadProgress} //
                                                    max="100"
                                                />
                                            }
                                        </div>
                                        :
                                        <div>
                                            <textarea
                                                className="uk-form-small"
                                                cols={5}
                                                value={cession.clientInstructionAttachment.reasonForNoAttachment}
                                                onChange={handleReasonForNoInstructionAttachment}//
                                                required
                                            />
                                        </div>
                                    }
                                </div>
                                <div className="uk-width-1-1 uk-margin-small-bottom">
                                    <label className="uk-form-label required" >
                                        Attach Legal Agreement: {" "}
                                        <input className='uk-checkbox' type="checkbox"
                                            checked={isLegalAgreementUploaded}
                                            onChange={handleCheckboxForLegalAgreementNoAttachment} //
                                        />
                                    </label>
                                    {isInstructionUploaded ? //CHANGE
                                        <div>
                                            <div data-uk-form-custom="target: true">
                                                <input
                                                    type="file"
                                                    aria-label="Custom controls"
                                                    accept=".pdf, .jpg, .jpeg, .png, .eml"
                                                    onChange={handleLegalAgreementFileUpload} //
                                                    id="fileToAttach"
                                                    ref={fileInputRefLegalAgreement} //CHAN
                                                />
                                                <input
                                                    className="uk-form-small"
                                                    type="text"
                                                    placeholder={legalAgreementFileUrl ? "Replace file" : "Select file"} //
                                                    aria-label="Custom controls"
                                                    disabled
                                                    value={legalAgreementFileUrl === "" ? '' : legalAgreementFile?.name || ''}  //
                                                />
                                            </div>
                                            {legalAgreementFileUrl && ( //
                                                <div>
                                                    <a
                                                        href={legalAgreementFileUrl} //
                                                        target="_blank" rel="noopener noreferrer">View file</a>
                                                </div>
                                            )}
                                            {loadingLegalAgreementUpload && //
                                                <progress
                                                    className="uk-progress uk-progress-success"
                                                    value={legalAgreementFileUploadProgress} //
                                                    max="100"
                                                />
                                            }
                                        </div>
                                        :
                                        <div>
                                            <textarea
                                                className="uk-form-small"
                                                cols={5}
                                                value={cession.legalAgreement.reasonForNoAttachment}
                                                onChange={handleReasonForNoLegalAgreementAttachment}//
                                                required
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="uk-width-1-2 uk-margin-small-top">
                                <DetailView dataToDisplay={accountDetails} />
                            </div>
                        </>
                    }

                    {
                        selectedTab === "Audit Trail" &&
                        <>
                            <h4 className="main-title-sm">Audit Trail</h4>
                        </>
                    }

                </div>
                <div>
                    <button className="btn btn-danger" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" type="submit">Load Cession</button>
                </div>
            </form>
        </div>
    )
});

export default CessionModal
