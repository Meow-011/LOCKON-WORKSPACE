import React, { useState, useEffect } from 'react';

interface ThreadItem {
    id: string;
    message: string;
    reply_count: number;
    last_reply_at: number;
    channel_display_name: string;
}

const ThreadsWidget: React.FC = () => {
    const [threads, setThreads] = useState<ThreadItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchThreads = async () => {
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
                    const threadsRes = await fetch(
                        `/api/v4/users/${me.id}/teams/${teams[0].id}/threads?per_page=5&unread=true`,
                        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                    );
                    const data = await threadsRes.json();

                    if (data.threads) {
                        setThreads(
                            data.threads.map((t: any) => ({
                                id: t.id,
                                message: t.post?.message?.substring(0, 100) || 'Thread',
                                reply_count: t.reply_count || 0,
                                last_reply_at: t.last_reply_at || 0,
                                channel_display_name: '',
                            }))
                        );
                    }
                }
            } catch (e) {
                // Silently handle
            }
            setLoading(false);
        };

        fetchThreads();
    }, []);

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
        <div className="widget widget-full">
            <div className="widget-header">
                <span className="widget-icon"><i className="icon icon-message-text-outline" /></span>
                <h3>Threads</h3>
                {threads.length > 0 && (
                    <span className="widget-badge">{threads.length}</span>
                )}
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : threads.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon"><i className="icon icon-message-text-outline" style={{ fontSize: '48px', opacity: 0.5 }} /></div>
                        <div className="widget-empty-text">No active threads</div>
                        <div className="widget-empty-hint">Reply to any message to start a thread.</div>
                        <button className="widget-action-link" onClick={() => { window.location.href = '/channels'; }}>Browse Channels</button>
                    </div>
                ) : (
                    <div className="widget-list">
                        {threads.map((thread) => (
                            <div key={thread.id} className="widget-item">
                                <div className="thread-message">{thread.message}</div>
                                <div className="thread-meta">
                                    <span className="thread-replies">{thread.reply_count} replies</span>
                                    <span className="thread-time">{timeAgo(thread.last_reply_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadsWidget;
