import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { BorderColor } from '@mui/icons-material';

interface IProps {
  centerControls?: JSX.Element;
  rightControls?: JSX.Element;
}

const DataGridToolbar = (props: IProps) => {

  const { centerControls, rightControls } = props;

  return (
    <>
      <GridToolbarContainer
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 8px',
          height: 44
        }}
      >
        {/* Left-aligned filter */}
        <div style={{ width: 200, }}>
          <GridToolbarQuickFilter
            variant="outlined"
            size="small"
          />
        </div>

        {/* Center-aligned buttons */}
        <div style={{ width: 200, display: 'flex', justifyContent: 'center' }}>
          {centerControls}
        </div>

        {/* Right-aligned header */}
        <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end' }}>
          {rightControls}
        </div>
      </GridToolbarContainer>
      <hr style={{ margin: '8px 0' }} />
    </>
  );
}

export default DataGridToolbar
