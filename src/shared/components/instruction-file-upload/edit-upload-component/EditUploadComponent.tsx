import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useState } from "react";
import { dateFormat_DD_MM_YY } from "../../../utils/utils";

interface InstructionFileUploaderProps {
  onFileUpload: (fileUrl: string) => void;
  onReplaceFileUpload?: (fileUrl: string) => void;
  onProvideReason: (reasonForNotProvingFile: string) => void;
  fileUrl: string;
  reasonForNotProvingFile: string;
  label: string;
  allocation: string;
}

export const EditUploadComponent = (props: InstructionFileUploaderProps) => {
  const {
    onFileUpload,
    onProvideReason,
    fileUrl,
    reasonForNotProvingFile,
    label,
    allocation,
  } = props;

  const [attachFile, setAttachFile] = useState(false);
  const [replaceAttachedFile, setReplaceAttachedFile] = useState(false);

  // const [uploadedFileURL, setUploadedFileURL] = useState(fileUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file selection logic
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileReplace = async () => {
    // Handle file replacement logic
    if (!selectedFile) return;

    const storage = getStorage();
    const storageRef = ref(
      storage,
      `uploads/deposits/${dateFormat_DD_MM_YY(
        Date.now()
      )}/${allocation}/${label}`
    );

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgress(progress);
    });

    try {
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      // setUploadedFileURL(downloadURL);

      onFileUpload(downloadURL);

      setSelectedFile(null);
      setFileUploadProgress(0);
      setReplaceAttachedFile(false);
    } catch (error) { }
  };

  const handleFileUpload = async () => {
    // Handle file upload logic
    if (!selectedFile) return;

    const storage = getStorage();
    const storageRef = ref(
      storage,
      `uploads/deposits/${dateFormat_DD_MM_YY(
        Date.now()
      )}/${allocation}/${label}`
    );

    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgress(progress);
    });

    try {
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      // setUploadedFileURL(downloadURL);
      onFileUpload(downloadURL);
      setSelectedFile(null);
      setFileUploadProgress(0);
    } catch (error) { }
  };

  const handleProvideReason = (reason: string) => {
    onProvideReason(reason);
  };

  return (
    <div
      className="uk-grid uk-grid-small uk-width-1-1 uk-margin-top"
      data-uk-grid
    >
      <div className="uk-width-1-1">
        {fileUrl && (
          <>
            <div className="uk-form-controls uk-width-1-1 uk-margin-top">
              <label className="uk-form-label required" htmlFor="fileToAttach">
                Attached {label}
              </label>
              <div className="uk-margin-top uk-margin-bottom">
                <a
                  className="btn btn-primary"
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </div>
              {!replaceAttachedFile && (
                <button
                  type="button"
                  className="btn btn-danger uk-margin-small-top"
                  onClick={() => setReplaceAttachedFile(true)}
                >
                  Replace File
                </button>
              )}
            </div>
            {replaceAttachedFile && (
              <>
                <div
                  className="uk-width-1-1"
                  data-uk-form-custom="target: true"
                >
                  <input
                    type="file"
                    aria-label="Custom controls"
                    accept=".pdf, .jpg, .jpeg, .png, .eml"
                    onChange={handleFileSelect}
                    id="fileToAttach"
                  />
                  <input
                    className="uk-input uk-form-small"
                    type="text"
                    placeholder="Select file"
                    aria-label="Custom controls"
                    disabled
                  />
                </div>
                <div className="uk-margin-top">
                  <button
                    type="button"
                    className="btn btn-primary uk-margin-small-bottom"
                    onClick={handleFileReplace}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setReplaceAttachedFile(false)}
                  >
                    Cancel
                  </button>
                </div>
                {selectedFile && (
                  <progress
                    className="uk-progress uk-progress-success"
                    value={fileUploadProgress}
                    max="100"
                  />
                )}
              </>
            )}
          </>
        )}
        {!fileUrl && (
          <>
            <div className="uk-form-controls uk-width-1-1">
              <label
                className={`uk-form-label uk-display-block ${attachFile ? "required" : ""
                  }`}
                htmlFor="fileToAttach"
              >
                Attach {label}{" "}
                <input
                  className="uk-checkbox"
                  type="checkbox"
                  checked={attachFile}
                  onChange={(e) => setAttachFile(e.target.checked)}
                />
              </label>

              {attachFile && (
                <>
                  <div
                    className="uk-width-1-1"
                    data-uk-form-custom="target: true"
                  >
                    <input
                      type="file"
                      aria-label="Custom controls"
                      accept=".pdf, .jpg, .jpeg, .png, .eml"
                      onChange={handleFileSelect}
                      id="fileToAttach"
                    />
                    <input
                      className="uk-input uk-form-small"
                      type="text"
                      placeholder="Select file"
                      aria-label="Custom controls"
                      disabled
                    />
                  </div>
                  <div className="uk-margin-top">
                    <button
                      type="button"
                      className="btn btn-primary uk-margin-small-bottom"
                      onClick={handleFileUpload}
                    >
                      Upload
                    </button>
                  </div>
                </>
              )}
              <div className="uk-form-controls uk-margin-top">
                {attachFile && selectedFile && (
                  <progress
                    className="uk-progress uk-progress-success"
                    value={fileUploadProgress}
                    max="100"
                  />
                )}
              </div>
            </div>
          </>
        )}

        {reasonForNotProvingFile && !attachFile && (
          <>
            <div className="uk-form-controls">
              <label className="uk-form-label required" htmlFor="">
                Reason for not attaching {label}
              </label>
              <textarea
                className="uk-textarea uk-form-small"
                cols={60}
                rows={5}
                placeholder={reasonForNotProvingFile}
                // value={reasonForNotProvingFile}
                onChange={(e) => {
                  handleProvideReason(e.target.value);
                }}
              ></textarea>
            </div>
          </>
        )}
        {!reasonForNotProvingFile && !fileUrl && !attachFile && (
          <>
            <div className="uk-form-controls">
              <label className="uk-form-label required" htmlFor="">
                Reason for not attaching {label}
              </label>
              <textarea
                className="uk-textarea uk-form-small"
                cols={60}
                rows={5}
                required={!fileUrl}
                onChange={(e) => handleProvideReason(e.target.value)}
              ></textarea>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
