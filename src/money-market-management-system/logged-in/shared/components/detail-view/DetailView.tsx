import { Fragment } from 'react'

export interface IDataDisplay {
    label: string;
    value: string | number;
    info?: string
}

interface IProps {
    dataToDisplay: IDataDisplay[]
}

const DetailView = (props: IProps) => {

    const { dataToDisplay } = props

    return (
        <div className="uk-grid uk-grid-small" data-uk-grid>
            {
                dataToDisplay.map((row, index) =>
                    <Fragment key={index}>
                        <div className="uk-width-1-3">
                            <label className="uk-text-bold uk-form-label uk-margin-remove">{row.label}:</label>
                        </div>
                        <div className="uk-width-2-3">
                            <input disabled value={row.value} type='text' className="uk-form-label uk-margin-remove" />
                            <small className='error'>{row.info}</small>
                        </div>

                    </Fragment>
                )
            }
        </div>
    )
}

export default DetailView
