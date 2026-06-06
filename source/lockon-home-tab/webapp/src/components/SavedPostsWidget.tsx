import React, { useState, useEffect } from 'react';

interface SavedPost {
    id: string;
    message: string;
    create_at: number;
    channel_display_name: string;
}

const SavedPostsWidget: React.FC = () => {
    const [posts, setPosts] = useState<SavedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                const meRes = await fetch('/api/v4/users/me', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                const me = await meRes.json();

                const flagRes = await fetch(
                    `/api/v4/users/${me.id}/posts/flagged?per_page=5`,
                    { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                );
                const data = await flagRes.json();

                if (data.order && data.posts) {
                    setPosts(
                        data.order.slice(0, 5).map((id: string) => ({
                            id,
                            message: data.posts[id]?.message?.substring(0, 120) || '',
                            create_at: data.posts[id]?.create_at || 0,
                            channel_display_name: '',
                        }))
                    );
                }
            } catch (e) {
                // Silently handle
            }
            setLoading(false);
        };

        fetchSavedPosts();
    }, []);

    return (
        <div className="widget">
            <div className="widget-header">
                <span className="widget-icon">📌</span>
                <h3>Saved Posts</h3>
                {posts.length > 0 && (
                    <span className="widget-badge">{posts.length}</span>
                )}
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : posts.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon">📌</div>
                        <div className="widget-empty-text">No saved posts yet</div>
                        <div className="widget-empty-hint">Save messages to find them later</div>
                    </div>
                ) : (
                    <div className="widget-list">
                        {posts.map((post) => (
                            <div key={post.id} className="widget-item">
                                <div className="saved-message">{post.message}</div>
                                <div className="saved-meta">
                                    {new Date(post.create_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPostsWidget;
