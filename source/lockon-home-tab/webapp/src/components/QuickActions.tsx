import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const QuickActions: React.FC = () => {
    const [teamName, setTeamName] = useState('');
    const history = useHistory();

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const meRes = await fetch('/api/v4/users/me', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const me = await meRes.json();
                const teamsRes = await fetch(`/api/v4/users/${me.id}/teams`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const teams = await teamsRes.json();
                if (teams.length > 0) {
                    setTeamName(teams[0].name);
                }
            } catch (e) {
                // Silently handle
            }
        };
        fetchTeam();
    }, []);

    const actions = [
        {
            icon: <i className="icon icon-pencil-outline" style={{ fontSize: '20px', color: '#8A6D3B' }} />,
            label: 'New Message',
            onClick: () => {
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    bubbles: true,
                });
                document.dispatchEvent(event);
            },
        },
        {
            icon: <i className="icon icon-magnify" style={{ fontSize: '20px', color: '#8A6D3B' }} />,
            label: 'Browse Channels',
            onClick: () => {
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    bubbles: true,
                });
                document.dispatchEvent(event);
            },
        },
        {
            icon: <i className="icon icon-view-dashboard-outline" style={{ fontSize: '20px', color: '#8A6D3B' }} />,
            label: 'Task Boards',
            onClick: () => {
                // Navigate to Focalboard (Mattermost Boards)
                history.push('/boards');
            },
        },
        {
            icon: <i className="icon icon-message-text-outline" style={{ fontSize: '20px', color: '#8A6D3B' }} />,
            label: 'Threads',
            onClick: () => {
                if (teamName) history.push(`/${teamName}/threads`);
            },
        },
        {
            icon: <i className="icon icon-pencil-box-outline" style={{ fontSize: '20px', color: '#8A6D3B' }} />,
            label: 'Drafts',
            onClick: () => {
                if (teamName) history.push(`/${teamName}/drafts`);
            },
        },
    ];

    return (
        <div className="quick-actions">
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    className="quick-action-btn"
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
