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
        {!title && <div className="controls">
          {leftControls}
        </div>}
        <div className="controls ">
          {rightControls}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Toolbar;

interface IPropsNew {
  title?: JSX.Element;
  leftControls?: JSX.Element;
  rightControls?: JSX.Element;
}

export const ToolbarNew = (props: IPropsNew) => {
  const { title, leftControls, rightControls } = props;

  return (
    <ErrorBoundary>
      <div className="toolbar-new uk-grid uk-grid-small" data-uk-grid>
        <div className="uk-width-expand">
          <h4 className="main-title-lg">{title}</h4>
        </div>
        <div className={`controls uk-text-right ${leftControls ? 'uk-width-1-6' : ''}`}>{leftControls}</div>
        <div className={`controls uk-text-right ${leftControls ? 'uk-width-1-2' : 'uk-width-2-3'}`}>{rightControls}</div>
      </div>
    </ErrorBoundary>
  );
};
