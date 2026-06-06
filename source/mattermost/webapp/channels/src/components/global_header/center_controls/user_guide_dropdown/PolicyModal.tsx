import React, {useCallback} from 'react';
import {Modal} from 'react-bootstrap';
import './policy_modal.scss';

interface Props {
    title: string;
    icon?: string;
    content: React.ReactNode;
    onExited: () => void;
}

const PolicyModal = ({title, icon, content, onExited}: Props): JSX.Element => {
    const [show, setShow] = React.useState(true);
    const handleHide = useCallback(() => setShow(false), []);

    return (
        <Modal
            dialogClassName='a11y__modal lockon-policy-modal'
            show={show}
            onHide={handleHide}
            onExited={onExited}
            role='none'
            aria-labelledby='policyModalLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title componentClass='h1' id='policyModalLabel'>
                    {icon && <i className={`icon ${icon}`} />}
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="policy-content">
                    {content}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PolicyModal;
