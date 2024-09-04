import ErrorBoundary from "../../../../../shared/components/error-boundary/ErrorBoundary";

interface Props {
    title?: string;
    leftControls?: JSX.Element;
    rightControls?: JSX.Element;
}

const Toolbar = (props: Props) => {
    const { title, leftControls, rightControls } = props;

    return (
        <ErrorBoundary>
            <div className="toolbar">
                {title && <h4 className="main-title-lg">{title}</h4>}
                {!title && <div className="controls">{leftControls}</div>}
                <div className="controls">{rightControls}</div>
            </div>
        </ErrorBoundary>
    );
};

export default Toolbar;
