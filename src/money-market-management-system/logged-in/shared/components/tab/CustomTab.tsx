
interface IProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const Tab: React.FC<IProps> = ({ label, isActive, onClick }) => {
    return (
        <button
            className={`uk-margin-right ${isActive ? "btn btn-primary" : "btn btn secondary"}`}
            onClick={onClick}
            style={{
                background: isActive ? "#01aced" : "",
                color: isActive ? "white" : "grey",
            }}
        >
            {label}
        </button>
    );
};