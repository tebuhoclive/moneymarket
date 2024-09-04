import { GridFooterContainer, GridPagination } from '@mui/x-data-grid';

interface IProps {
    centerControls?: JSX.Element;
    rightControls?: JSX.Element;
}

const DataGridFooter = (props: IProps) => {

    const { centerControls, rightControls } = props;

    return (
        <GridFooterContainer
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                height: 40
            }}
        >
            {/* left-aligned pagination */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <GridPagination />
            </div>

            {/* Centered custom element */}
            <>{centerControls}</>

            {/* right-aligned custom element */}
            <>{rightControls}</>
        </GridFooterContainer>
    );
}

export default DataGridFooter
