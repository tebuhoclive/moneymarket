import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

import MODAL_NAMES from "../ModalName";
import "./ReadAttachedDialog.scss"
import { useAppContext } from "../../../../shared/functions/Context";
import { hideModalFromId } from "../../../../shared/functions/ModalShow";
import { IFolderFile } from "../../../../shared/models/FolderFile";


const iframeEmbedConditions = (ext: string) => {
  const condition =
    ext === "pdf" || ext === "jpg" || ext === "png" || ext === "jpeg";
  return condition;
};

const ReadAttachedDialog = observer(() => {
  const { store } = useAppContext();
  const [blob, setBlob] = useState<IFolderFile | null>(null);
  const [fileExtension, setfileExtension] = useState(".pdf");

  const googleEmbedLink = "https://drive.google.com/viewerng/viewer?embedded=true&url=";

  const onCancel = () => {
    store.folderFile.clearSelected();
    setBlob(null);
    setfileExtension("");
    hideModalFromId(MODAL_NAMES.ADMIN.FILE_READER_MODAL);
  };

  useEffect(() => {
    if (store.folderFile.selected) {
      setfileExtension(store.folderFile.selected.extension);
      setBlob(store.folderFile.selected);
    } else setBlob(null);
  }, [store.folderFile.selected]);

  return (
    <div className="read-attachment-modal uk-modal-dialog uk-modal-body uk-margin-auto-vertical uk-width-3-4">
      <button
        className="uk-modal-close-full uk-close-large close"
        type="button"
        data-uk-close
        onClick={onCancel}
      ></button>
      <h3 className="uk-modal-title title">{blob && blob.name ? blob.name : "File not found !"} </h3>
      <div className="dialog-content uk-position-relative">
        {iframeEmbedConditions(fileExtension.toLocaleLowerCase()) && (
          <>
            {blob && (
              <iframe
                className="read-document-frame"
                title={blob.name}
                src={blob.url}
              ></iframe>
            )}
          </>
        )}
        {!iframeEmbedConditions(fileExtension) && (
          <>
            {blob && (
              <iframe
                className="read-document-frame"
                src={`${googleEmbedLink}${encodeURIComponent(blob.url)}`}
                title={blob.name}
              ></iframe>
            )}
          </>
        )}
        <div className="uk-width-1-1 uk-text-right">
          <button
            className="btn-text uk-margin-right"
            type="button"
            onClick={onCancel}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

export default ReadAttachedDialog;