import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useState } from "react";

interface PoPFileUploaderProps {
  onFileUpload: (url: string) => void;
  onProvideReason: (reseaon: string) => void;
}

const SourceOfFundsUpload = (props: PoPFileUploaderProps) => {
  const { onFileUpload, onProvideReason } = props;

  const [attachFile, setAttachFile] = useState(false);
  const [uploadedFileURL, setUploadedFileURL] = useState("");
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
    const storageRef = ref(storage, `uploads/deposits/`);

    const uploadTask = uploadBytesResumable(
      storageRef,
      selectedFile
    );

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgress(progress);
    });

    try {
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      setUploadedFileURL(downloadURL);


      onFileUpload(downloadURL);

      setSelectedFile(null);
      setFileUploadProgress(0);
    } catch (error) {

    }
  };

  const handleFileUpload = async () => {
    // Handle file upload logic
    if (!selectedFile) return;

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/deposits/`);

    const uploadTask = uploadBytesResumable(
      storageRef,
      selectedFile
    );

    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFileUploadProgress(progress);
    });

    try {
      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      setUploadedFileURL(downloadURL);
      onFileUpload(downloadURL);
      setSelectedFile(null);
      setFileUploadProgress(0);
    } catch (error) {

    }
  };

  const handleProvideReason = (reason: string) => {
    onProvideReason(reason);
  }

  return (
    <div className="uk-grid uk-grid-small uk-width-1-1 uk-margin-top" data-uk-grid>
      <div className="uk-width-1-1">
        {!uploadedFileURL && (
          <div className="uk-form-controls uk-width-1-1">
            <label className={`uk-form-label uk-display-block ${attachFile ? 'required' : ''}`} htmlFor="fileToAttach">
              Attach POP {' '}
              <input
                className="uk-checkbox"
                type="checkbox"
                checked={attachFile}
                onChange={(e) => setAttachFile(e.target.checked)}
              />
            </label>
          </div>
        )}

        {uploadedFileURL && (
          <div className="uk-form-controls uk-width-1-1 uk-margin-top">
            <label className="uk-form-label required" htmlFor="fileToAttach">
              Attached
            </label>
          </div>
        )}

        {attachFile && (
          <>
            <div className="uk-width-1-1" data-uk-form-custom="target: true">
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

            <div className="uk-form-controls">
              {selectedFile && (
                <div>
                  <button
                    type="button"
                    className="btn btn-primary uk-margin-small-bottom"
                    onClick={uploadedFileURL ? handleFileReplace : handleFileUpload}
                  >
                    {uploadedFileURL ? 'Replace' : 'Upload'}
                  </button>
                </div>
              )}
              {uploadedFileURL && (
                <a
                  className="btn btn-primary uk-margin-medium-top"
                  href={uploadedFileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              )}
              {selectedFile && (
                <progress
                  className="uk-progress uk-progress-success"
                  value={fileUploadProgress}
                  max="100"
                />
              )}
            </div>
          </>
        )}

        {!attachFile && (
          <div className="uk-form-controls">
            <label className="uk-form-label required" htmlFor="">Reason for not attaching Proof of Payment</label>
            <textarea className="uk-textarea uk-form-small" cols={60} rows={5} required
              onChange={(e) => handleProvideReason(e.target.value)}
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceOfFundsUpload;
