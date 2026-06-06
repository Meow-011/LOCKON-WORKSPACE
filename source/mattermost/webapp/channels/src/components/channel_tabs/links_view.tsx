// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Channel Tabs — Links View (uses Plugin Go Server API)

import React, {useState, useEffect} from 'react';

interface Props {
    channelId: string;
}

interface LinkItem {
    id: string;
    url: string;
    title: string;
    added_by: string;
}

const PLUGIN_API_BASE = '/plugins/com.lockon.channel-tabs-v3/api/v1';

const LinksView: React.FC<Props> = ({channelId}) => {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');

    const fetchLinks = () => {
        if (!channelId) {
            return;
        }
        setLoading(true);
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/links`, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
            .then((res) => res.json())
            .then((data) => {
                setLinks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchLinks();
    }, [channelId]);

    const handleAddLink = () => {
        if (!newUrl.trim()) {
            return;
        }
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                url: newUrl.trim(),
                title: newTitle.trim() || newUrl.trim(),
            }),
        })
            .then((res) => res.json())
            .then(() => {
                setNewUrl('');
                setNewTitle('');
                setShowForm(false);
                fetchLinks();
            });
    };

    const handleDeleteLink = (linkId: string) => {
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/links/${linkId}`, {
            method: 'DELETE',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        }).then(() => fetchLinks());
    };

    if (loading) {
        return <div className='tab-loading'>{'Loading links...'}</div>;
    }

    return (
        <div className='links-view'>
            <div className='links-header'>
                <button
                    className='add-link-btn'
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? (
                        <><i className='icon icon-close' style={{marginRight: '4px'}}/>{'Cancel'}</>
                    ) : (
                        <><i className='icon icon-plus' style={{marginRight: '4px'}}/>{'Add Link'}</>
                    )}
                </button>
            </div>

            {showForm && (
                <div className='link-form'>
                    <input
                        type='text'
                        placeholder='Link title (optional)'
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className='link-input'
                    />
                    <input
                        type='url'
                        placeholder='https://...'
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className='link-input'
                        onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    />
                    <button
                        className='save-link-btn'
                        onClick={handleAddLink}
                    >
                        {'Save Link'}
                    </button>
                </div>
            )}

            {links.length === 0 && !showForm ? (
                <div className='tab-empty'>
                    <div className='tab-empty-icon'>
                        <i
                            className='icon icon-link-variant'
                            style={{fontSize: '48px', color: '#C1A173', display: 'block', marginBottom: '16px'}}
                        />
                    </div>
                    <div className='tab-empty-title'>{'No links saved'}</div>
                    <div className='tab-empty-desc'>
                        {'Save important links for your team to access quickly.'}
                    </div>
                </div>
            ) : (
                <div className='links-list'>
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className='link-item'
                        >
                            <a
                                href={link.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='link-anchor'
                            >
                                <span className='link-icon'>
                                    <i
                                        className='icon icon-link-variant'
                                        style={{fontSize: '20px', color: '#8A6D3B'}}
                                    />
                                </span>
                                <div className='link-info'>
                                    <div className='link-title'>{link.title}</div>
                                    <div className='link-url'>{link.url}</div>
                                </div>
                            </a>
                            <button
                                className='link-delete-btn'
                                onClick={() => handleDeleteLink(link.id)}
                                title='Remove link'
                            >
                                <i className='icon icon-trash-can-outline'/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LinksView;
