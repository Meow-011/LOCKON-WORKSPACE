import React, { useState, useEffect } from 'react';

interface ActivityItem {
    id: string;
    type: 'message' | 'join' | 'mention';
    username: string;
    channel_name: string;
    message: string;
    create_at: number;
}

const ActivityFeedWidget: React.FC = () => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
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
                    // Fetch recent posts from channels user is in
                    const channelsRes = await fetch(
                        `/api/v4/users/${me.id}/teams/${teams[0].id}/channels`,
                        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                    );
                    const channels = await channelsRes.json();

                    // Get recent posts from first few active channels
                    const activeChannels = channels
                        .filter((ch: any) => ch.last_post_at > 0)
                        .sort((a: any, b: any) => b.last_post_at - a.last_post_at)
                        .slice(0, 5);

                    const allActivities: ActivityItem[] = [];

                    for (const ch of activeChannels) {
                        try {
                            const postsRes = await fetch(
                                `/api/v4/channels/${ch.id}/posts?per_page=3`,
                                { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                            );
                            const postsData = await postsRes.json();

                            if (postsData.order && postsData.posts) {
                                for (const postId of postsData.order.slice(0, 2)) {
                                    const post = postsData.posts[postId];
                                    if (post && post.user_id !== me.id) {
                                        // Fetch username
                                        let username = 'Someone';
                                        try {
                                            const userRes = await fetch(
                                                `/api/v4/users/${post.user_id}`,
                                                { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                                            );
                                            const userData = await userRes.json();
                                            username = userData.username || 'Someone';
                                        } catch { /* ignore */ }

                                        allActivities.push({
                                            id: post.id,
                                            type: post.message?.includes(`@${me.username}`) ? 'mention' : 'message',
                                            username,
                                            channel_name: ch.display_name || ch.name,
                                            message: post.message?.substring(0, 80) || '',
                                            create_at: post.create_at,
                                        });
                                    }
                                }
                            }
                        } catch { /* skip channel */ }
                    }

                    // Sort by time, take latest 8
                    allActivities.sort((a, b) => b.create_at - a.create_at);
                    setActivities(allActivities.slice(0, 8));
                }
            } catch (e) {
                // Silently handle
            }
            setLoading(false);
        };

        fetchActivity();
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

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'mention': return '🔔';
            case 'join': return '👋';
            default: return '💬';
        }
    };

    return (
        <div className="widget widget-full-width">
            <div className="widget-header">
                <span className="widget-icon">📡</span>
                <h3>Activity Feed</h3>
                {activities.length > 0 && (
                    <span className="widget-badge">{activities.length}</span>
                )}
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : activities.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon">📡</div>
                        <div className="widget-empty-text">No recent activity</div>
                        <div className="widget-empty-hint">
                            Messages from your channels will appear here
                        </div>
                    </div>
                ) : (
                    <div className="widget-list">
                        {activities.map((activity) => (
                            <div key={activity.id} className="widget-item activity-item">
                                <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                                <div className="activity-content">
                                    <div className="activity-header-row">
                                        <span className="activity-user">{activity.username}</span>
                                        <span className="activity-channel">#{activity.channel_name}</span>
                                        <span className="activity-time">{timeAgo(activity.create_at)}</span>
                                    </div>
                                    <div className="activity-message">{activity.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeedWidget;
