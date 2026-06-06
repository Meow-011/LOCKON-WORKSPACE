import React, { useState, useEffect } from 'react';
import './styles.scss';
import UnreadsWidget from './UnreadsWidget';
import ThreadsWidget from './ThreadsWidget';
import SavedPostsWidget from './SavedPostsWidget';
import RecentChannelsWidget from './RecentChannelsWidget';
import DraftsWidget from './DraftsWidget';
import QuickActions from './QuickActions';

const API_BASE = '/api/v4';

interface UserProfile {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    nickname: string;
}

const HomeDashboard: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetch(`${API_BASE}/users/me`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch(() => {});

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return <><i className="icon icon-white-balance-sunny" /> Good Morning</>;
        if (hour < 17) return <><i className="icon icon-weather-sunny" /> Good Afternoon</>;
        if (hour < 21) return <><i className="icon icon-weather-sunset" /> Good Evening</>;
        return <><i className="icon icon-weather-night" /> Good Night</>;
    };

    const getDisplayName = () => {
        if (!user) return '';
        return user.first_name || user.nickname || user.username;
    };

    return (
        <div className="home-dashboard" style={{ gridArea: 'center' }}>
            <div className="home-dashboard-inner">
                {/* Header Section */}
                <div className="home-header">
                    <div className="home-greeting">
                        <h1>{getGreeting()}, {getDisplayName()}!</h1>
                        <p className="home-date">
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Widget Grid */}
                <div className="widget-grid">
                    <UnreadsWidget />
                    <SavedPostsWidget />
                    <RecentChannelsWidget />
                    <DraftsWidget />
                    <ThreadsWidget />
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;
