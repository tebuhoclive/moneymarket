import React from "react";
import showModalFromId from "../../functions/ModalShow";
import { useAppContext } from "../../functions/Context";
import { IFolderFile } from "../../models/FolderFile";

interface FileItemProps {
    file: File;
    readFile: () => Promise<void>
    progress: number;
}

const AttachedFileItem = (props: FileItemProps) => {
    const { file, progress, readFile } = props;
    const { store } = useAppContext();

    return (
        <div>
            <div className="file-item uk-card-default uk-card-small">
                <span data-uk-icon="icon: file-text; ratio: 1"></span>
                {file.name}
                <div className="controls">
                    <button className="uk-margin-small-right" onClick={readFile}>
                        <span data-uk-icon="icon: expand; ratio: 1"></span>
                    </button>
                </div>
                {progress && (
                    <div className="upload-progress-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttachedFileItem;