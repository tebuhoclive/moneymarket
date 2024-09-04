interface InstructionFileUploaderProps {
  onFileUpload: (fileUrl: string) => void;
  onReplaceFileUpload?: (fileUrl: string) => void;
  onProvideReason: (reasonForNotProvingFile: string) => void;
  fileUrl: string;
  reasonForNotProvingFile: string;
  label: string;
  allocation: string;
}

export const VerifyUploadComponent = (props: InstructionFileUploaderProps) => {
  const {
    fileUrl,
    reasonForNotProvingFile,
    label,
  } = props;

  return (
    <div
      className="uk-grid uk-grid-small uk-width-1-1 uk-margin-top"
      data-uk-grid
    >
      <div className="uk-width-1-1">
        {fileUrl && (
          <>
            <div className="uk-form-controls uk-width-1-1 uk-margin-top">
              <label className="uk-form-label" htmlFor="fileToAttach">
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
            </div>
          </>
        )}

        {reasonForNotProvingFile && (
          <>
            <div className="uk-form-controls">
              <label className="uk-form-label" htmlFor="">
                Reason for not attaching {label}
              </label>
              <textarea
                cols={60}
                rows={2}
                disabled
                required
                value={reasonForNotProvingFile}
              ></textarea>
            </div>
          </>
        )}
        {!reasonForNotProvingFile && !fileUrl && (
          <>
            <div className="uk-form-controls">
              <label className="uk-form-label" htmlFor="">
                Reason for not attaching {label}
              </label>
              <textarea
                cols={60}
                rows={2}
                disabled
                required={!fileUrl}
              ></textarea>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
