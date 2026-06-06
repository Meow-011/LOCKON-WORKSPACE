import React, { useState, useEffect } from 'react';

interface RecentChannel {
    id: string;
    name: string;
    display_name: string;
    last_post_at: number;
    type: string;
}

const RecentChannelsWidget: React.FC = () => {
    const [channels, setChannels] = useState<RecentChannel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
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
                    const channelsRes = await fetch(
                        `/api/v4/users/${me.id}/teams/${teams[0].id}/channels`,
                        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                    );
                    const data = await channelsRes.json();

                    if (Array.isArray(data)) {
                        const recent = data
                            .filter((c: any) => c.last_post_at > 0)
                            .sort((a: any, b: any) => b.last_post_at - a.last_post_at)
                            .slice(0, 5)
                            .map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                display_name: c.display_name || c.name,
                                last_post_at: c.last_post_at,
                                type: c.type,
                            }));
                        setChannels(recent);
                    }
                }
            } catch (e) {
                // Silently handle
            }
            setLoading(false);
        };

        fetchRecent();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'P': return '🔒';
            case 'D': return '👤';
            case 'G': return '👥';
            default: return '#';
        }
    };

    const timeAgo = (timestamp: number) => {
        if (!timestamp) return '';
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="widget widget-wide">
            <div className="widget-header">
                <span className="widget-icon"><i className="icon icon-history" /></span>
                <h3>Recently Active Channels</h3>
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : channels.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon"><i className="icon icon-history" style={{ fontSize: '48px', opacity: 0.5 }} /></div>
                        <div className="widget-empty-text">No recent activity</div>
                        <div className="widget-empty-hint">Channels you interact with will appear here.</div>
                        <button className="widget-action-link" onClick={() => { window.location.href = '/channels'; }}>Browse Channels</button>
                    </div>
                ) : (
                    <div className="widget-list">
                        {channels.map((c) => (
                            <a key={c.id} href={`/channels/${c.name}`} className="widget-item">
                                <span className="channel-icon" style={{ fontSize: '16px', marginRight: '8px' }}>{getIcon(c.type)}</span>
                                <div className="channel-name" style={{ fontSize: '14px' }}>{c.display_name}</div>
                                <div className="thread-time" style={{ marginLeft: 'auto' }}>{timeAgo(c.last_post_at)}</div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentChannelsWidget;
