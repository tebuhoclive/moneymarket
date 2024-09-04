import { faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ChangeEvent } from "react";

interface Props {
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  label: string;
  name: string;
}
const FileUploadButton = (props: Props) => {
  const { onFileChange, name, label } = props;
  return (
    <label className="btn btn-primary uk-margin-small-right uk-width-1-1">
      <FontAwesomeIcon className="uk-margin-small-right" icon={faFileArrowUp}/>
      <input
        type="file"
        name={name}
        id={`upload-${name}`}
        onChange={onFileChange}
        style={{ display: "none" }}
        required
      />
      {label}
    </label>
  );
};

export default FileUploadButton;
