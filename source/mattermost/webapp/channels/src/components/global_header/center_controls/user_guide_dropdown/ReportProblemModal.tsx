import React, {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import './report_problem_modal.scss';

interface Props {
    currentUsername: string;
    onExited: () => void;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const PRIORITY_OPTIONS = [
    {value: 'low', label: 'Low', color: '#4CAF50'},
    {value: 'medium', label: 'Medium', color: '#FF9800'},
    {value: 'high', label: 'High', color: '#F44336'},
    {value: 'critical', label: 'Critical', color: '#9C27B0'},
];

// Placeholder webhook URL — replace with your actual Incoming Webhook URL
const WEBHOOK_URL = '/hooks/lockon-support-webhook';

const ReportProblemModal = ({currentUsername, onExited}: Props): JSX.Element => {
    const [show, setShow] = useState(true);
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState('medium');
    const [description, setDescription] = useState('');
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleHide = useCallback(() => setShow(false), []);

    const getBrowserInfo = (): string => {
        const ua = navigator.userAgent;
        let browser = 'Unknown';

        if (ua.includes('Firefox/')) {
            browser = 'Firefox ' + ua.split('Firefox/')[1].split(' ')[0];
        } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
            browser = 'Chrome ' + ua.split('Chrome/')[1].split(' ')[0];
        } else if (ua.includes('Edg/')) {
            browser = 'Edge ' + ua.split('Edg/')[1].split(' ')[0];
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
            browser = 'Safari ' + ua.split('Version/')[1]?.split(' ')[0] || '';
        }

        let os = 'Unknown OS';
        if (ua.includes('Windows')) {
            os = 'Windows';
        } else if (ua.includes('Mac OS')) {
            os = 'macOS';
        } else if (ua.includes('Linux')) {
            os = 'Linux';
        }

        return `${browser} / ${os}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subject.trim()) {
            setErrorMessage('Please enter a subject.');
            return;
        }
        if (!description.trim()) {
            setErrorMessage('Please enter a description.');
            return;
        }

        setSubmitState('submitting');
        setErrorMessage('');

        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }) + ' (UTC+7)';

        const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || 'Medium';
        const priorityColor = PRIORITY_OPTIONS.find((p) => p.value === priority)?.color || '#FF9800';

        const payload = {
            username: 'LOCKON Support Bot',
            icon_url: '',
            attachments: [
                {
                    fallback: `Problem Report from @${currentUsername}: ${subject}`,
                    color: priorityColor,
                    title: `Problem Report — ${priorityLabel} Priority`,
                    fields: [
                        {
                            short: true,
                            title: 'Subject',
                            value: subject,
                        },
                        {
                            short: true,
                            title: 'Priority',
                            value: priorityLabel,
                        },
                        {
                            short: true,
                            title: 'Reported by',
                            value: `@${currentUsername}`,
                        },
                        {
                            short: true,
                            title: 'Time',
                            value: timestamp,
                        },
                        {
                            short: true,
                            title: 'Browser',
                            value: getBrowserInfo(),
                        },
                        {
                            short: false,
                            title: 'Description',
                            value: description,
                        },
                    ],
                },
            ],
        };

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmitState('success');
                setTimeout(() => {
                    setShow(false);
                }, 2000);
            } else {
                setSubmitState('error');
                setErrorMessage('Failed to submit report. Please try again or contact your administrator.');
            }
        } catch {
            setSubmitState('error');
            setErrorMessage('Unable to connect. Please check your network and try again.');
        }
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className='report-problem-form'>
            <div className='form-group'>
                <label htmlFor='report-subject'>
                    <i className='icon icon-pencil-outline'/>
                    {'Subject'}
                </label>
                <input
                    id='report-subject'
                    type='text'
                    className='form-control'
                    placeholder='Brief summary of the problem'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={submitState === 'submitting'}
                    autoFocus={true}
                />
            </div>

            <div className='form-group'>
                <label htmlFor='report-priority'>
                    <i className='icon icon-flag-outline'/>
                    {'Priority'}
                </label>
                <select
                    id='report-priority'
                    className='form-control'
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitState === 'submitting'}
                >
                    {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className='form-group'>
                <label htmlFor='report-description'>
                    <i className='icon icon-text'/>
                    {'Description'}
                </label>
                <textarea
                    id='report-description'
                    className='form-control'
                    placeholder='Describe the problem in detail...'
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={submitState === 'submitting'}
                />
            </div>

            <div className='report-meta-info'>
                <span><i className='icon icon-account-outline'/>{`@${currentUsername}`}</span>
                <span><i className='icon icon-monitor'/>{getBrowserInfo()}</span>
            </div>

            {errorMessage && (
                <div className='report-error'>
                    <i className='icon icon-alert-circle-outline'/>
                    {errorMessage}
                </div>
            )}

            <button
                type='submit'
                className='btn report-submit-btn'
                disabled={submitState === 'submitting'}
            >
                {submitState === 'submitting' ? (
                    <>
                        <i className='icon icon-loading icon-spin'/>
                        {'Submitting...'}
                    </>
                ) : (
                    <>
                        <i className='icon icon-send-outline'/>
                        {'Submit Report'}
                    </>
                )}
            </button>
        </form>
    );

    const renderSuccess = () => (
        <div className='report-success'>
            <div className='success-icon'>
                <i className='icon icon-check-circle-outline'/>
            </div>
            <h3>{'Report Submitted'}</h3>
            <p>{'Your problem report has been sent to the LOCKON support team. We will get back to you shortly.'}</p>
        </div>
    );

    return (
        <Modal
            dialogClassName='a11y__modal lockon-report-problem-modal'
            show={show}
            onHide={handleHide}
            onExited={onExited}
            role='none'
            aria-labelledby='reportProblemModalLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title componentClass='h1' id='reportProblemModalLabel'>
                    <i className='icon icon-alert-outline'/>
                    {'Report a Problem'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {submitState === 'success' ? renderSuccess() : renderForm()}
            </Modal.Body>
        </Modal>
    );
};

export default ReportProblemModal;
