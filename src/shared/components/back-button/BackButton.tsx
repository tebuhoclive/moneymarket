import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
    const navigate = useNavigate();

    const goBackHandler = () => {
        navigate(-1);
    };

    return (
        <button className='btn btn-danger' onClick={goBackHandler}>
            <FontAwesomeIcon className="" icon={faArrowLeftLong} /> Back
        </button>
    );
}

export default BackButton;
