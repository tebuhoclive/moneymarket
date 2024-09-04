interface FieldErrorPromptProps {
  fieldId: string;
  errorMessage: string;
}

const FieldErrorPrompt: React.FC<FieldErrorPromptProps> = ({
  fieldId,
  errorMessage,
}) => {
  return (
    <div className="uk-form-controls uk-width-1-1">
      <span
        className="uk-text-danger"
        id={`${fieldId}-error`}
        style={{ display: "none" }}>
        {errorMessage}
      </span>
    </div>
  );
};

export default FieldErrorPrompt;
