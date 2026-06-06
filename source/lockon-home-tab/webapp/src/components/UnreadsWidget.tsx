import React, { useState, useEffect } from 'react';

interface ChannelUnread {
    channel_id: string;
    name: string;
    display_name: string;
    msg_count: number;
    mention_count: number;
    type: string;
}

const UnreadsWidget: React.FC = () => {
    const [unreads, setUnreads] = useState<ChannelUnread[]>([]);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUnreads = async () => {
            try {
                // Get current user's team memberships
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
                    const channelsRes = await fetch(
                        `/api/v4/users/${me.id}/teams/${teams[0].id}/channels`,
                        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                    );
                    const channels = await channelsRes.json();

                    const unreadChannels = channels
                        .filter((ch: any) => ch.total_msg_count > ch.msg_count_root || ch.mention_count > 0)
                        .map((ch: any) => ({
                            channel_id: ch.id,
                            name: ch.name,
                            display_name: ch.display_name || ch.name,
                            msg_count: Math.max(0, ch.total_msg_count - ch.msg_count_root),
                            mention_count: ch.mention_count || 0,
                            type: ch.type,
                        }))
                        .filter((ch: ChannelUnread) => ch.msg_count > 0 || ch.mention_count > 0)
                        .slice(0, 8);

                    setUnreads(unreadChannels);
                }
            } catch (e) {
                // Silently handle
            }
            setLoading(false);
        };

        fetchUnreads();
    }, []);

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'O': return '#';
            case 'P': return '🔒';
            case 'D': return '👤';
            case 'G': return '👥';
            default: return '#';
        }
    };

    return (
        <div className="widget">
            <div className="widget-header">
                <span className="widget-icon">📩</span>
                <h3>Unreads</h3>
                {unreads.length > 0 && (
                    <span className="widget-badge">{unreads.length}</span>
                )}
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : unreads.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon">✨</div>
                        <div className="widget-empty-text">All caught up!</div>
                    </div>
                ) : (
                    <div className="widget-list">
                        {unreads.map((ch) => (
                            <a
                                key={ch.channel_id}
                                className="widget-item"
                                href={`/${teamName}/channels/${ch.name}`}
                            >
                                <span className="channel-icon">{getChannelIcon(ch.type)}</span>
                                <span className="channel-name">{ch.display_name}</span>
                                {ch.mention_count > 0 && (
                                    <span className="mention-badge">@{ch.mention_count}</span>
                                )}
                                {ch.msg_count > 0 && (
                                    <span className="msg-count">{ch.msg_count} new</span>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnreadsWidget;
