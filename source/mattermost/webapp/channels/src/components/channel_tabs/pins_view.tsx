// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Channel Tabs — Pins View (uses Mattermost REST API directly)

import React, {useState, useEffect} from 'react';

interface Props {
    channelId: string;
}

interface PinnedPost {
    id: string;
    message: string;
    create_at: number;
    user_id: string;
}

const PinsView: React.FC<Props> = ({channelId}) => {
    const [pins, setPins] = useState<PinnedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!channelId) {
            return;
        }
        setLoading(true);
        fetch(`/api/v4/channels/${channelId}/pinned`, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
            .then((res) => res.json())
            .then((data) => {
                const posts = data.order ?
                    data.order.map((id: string) => data.posts[id]) :
                    [];
                setPins(posts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [channelId]);

    if (loading) {
        return <div className='tab-loading'>{'Loading pins...'}</div>;
    }

    if (pins.length === 0) {
        return (
            <div className='tab-empty'>
                <div className='tab-empty-icon'>
                    <i
                        className='icon icon-pin-outline'
                        style={{fontSize: '48px', color: '#C1A173', display: 'block', marginBottom: '16px'}}
                    />
                </div>
                <div className='tab-empty-title'>{'No pinned messages'}</div>
                <div className='tab-empty-desc'>
                    {'Pin important messages to keep them easily accessible.'}
                </div>
            </div>
        );
    }

    return (
        <div className='pins-list'>
            {pins.map((pin) => (
                <div
                    key={pin.id}
                    className='pin-item'
                >
                    <div className='pin-message'>{pin.message}</div>
                    <div className='pin-meta'>
                        {new Date(pin.create_at).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PinsView;
