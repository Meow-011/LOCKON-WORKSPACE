import React, { useState, useEffect } from 'react';

interface DraftItem {
    channel_id: string;
    channel_name: string;
    message: string;
    update_at: number;
}

const DraftsWidget: React.FC = () => {
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrafts = async () => {
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
                    const draftsRes = await fetch(
                        `/api/v4/users/${me.id}/teams/${teams[0].id}/drafts`,
                        { headers: { 'X-Requested-With': 'XMLHttpRequest' } }
                    );

                    if (draftsRes.ok) {
                        const data = await draftsRes.json();
                        if (Array.isArray(data)) {
                            setDrafts(
                                data.slice(0, 5).map((d: any) => ({
                                    channel_id: d.channel_id || '',
                                    channel_name: d.channel_display_name || 'Channel',
                                    message: d.message?.substring(0, 100) || '(empty draft)',
                                    update_at: d.update_at || 0,
                                }))
                            );
                        }
                    }
                }
            } catch (e) {
                // API may not support drafts listing — that's OK
            }
            setLoading(false);
        };

        fetchDrafts();
    }, []);

    return (
        <div className="widget">
            <div className="widget-header">
                <span className="widget-icon"><i className="icon icon-folder-outline" /></span>
                <h3>Drafts</h3>
                {drafts.length > 0 && (
                    <span className="widget-badge">{drafts.length}</span>
                )}
            </div>
            <div className="widget-body">
                {loading ? (
                    <div className="widget-loading">Loading...</div>
                ) : drafts.length === 0 ? (
                    <div className="widget-empty">
                        <div className="widget-empty-icon"><i className="icon icon-folder-outline" style={{ fontSize: '48px', opacity: 0.5 }} /></div>
                        <div className="widget-empty-text">No drafts</div>
                        <div className="widget-empty-hint">
                            Unsent messages will appear here.
                        </div>
                        <button className="widget-action-link" onClick={() => {
                            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
                            document.dispatchEvent(event);
                        }}>Start a New Message</button>
                    </div>
                ) : (
                    <div className="widget-list">
                        {drafts.map((draft, idx) => (
                            <div key={idx} className="widget-item">
                                <div className="draft-channel">#{draft.channel_name}</div>
                                <div className="draft-message">{draft.message}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraftsWidget;
