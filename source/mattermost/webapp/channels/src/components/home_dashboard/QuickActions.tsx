import React from 'react';

const QuickActions: React.FC = () => {
    const actions = [
        {
            icon: <i className="icon icon-pencil-outline" />,
            label: 'New Message',
            onClick: () => {
                // Open the new message dialog via keyboard shortcut
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    bubbles: true,
                });
                document.dispatchEvent(event);
            },
        },
        {
            icon: <i className="icon icon-magnify" />,
            label: 'Browse Channels',
            onClick: () => {
                window.location.href = '/channels';
            },
        },
        {
            icon: <i className="icon icon-message-text-outline" />,
            label: 'Threads',
            onClick: () => {
                window.location.href = '/threads';
            },
        },
        {
            icon: <i className="icon icon-folder-outline" />,
            label: 'Drafts',
            onClick: () => {
                window.location.href = '/drafts';
            },
        },
    ];

    return (
        <div className="quick-actions">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    className={`quick-action-btn ${idx === 0 ? 'quick-action-primary' : ''}`}
                    onClick={action.onClick}
                >
                    <span className="quick-action-icon">{action.icon}</span>
                    <span className="quick-action-label">{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default QuickActions;
