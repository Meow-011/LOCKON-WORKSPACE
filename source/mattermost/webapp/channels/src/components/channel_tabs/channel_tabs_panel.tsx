// Copyright (c) LOCKON Workspace. All Rights Reserved.
// Channel Tabs — Core Integration

import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import PinsView from './pins_view';
import FilesView from './files_view';
import LinksView from './links_view';
import NotesView from './notes_view';

import './channel_tabs.scss';

interface Tab {
    id: string;
    channel_id: string;
    type: string;
    title: string;
    position: number;
}

const PLUGIN_API_BASE = '/plugins/com.lockon.channel-tabs-v3/api/v1';

const DEFAULT_TABS: Tab[] = [
    {id: 'pins', channel_id: '', type: 'pins', title: 'Pins', position: 0},
    {id: 'files', channel_id: '', type: 'files', title: 'Files', position: 1},
    {id: 'links', channel_id: '', type: 'links', title: 'Links', position: 2},
    {id: 'notes', channel_id: '', type: 'notes', title: 'Notes', position: 3},
];

const getTabIcon = (type: string) => {
    switch (type) {
    case 'pins': return 'icon-pin-outline';
    case 'files': return 'icon-folder-outline';
    case 'links': return 'icon-link-variant';
    case 'notes': return 'icon-notebook-outline';
    default: return 'icon-tab';
    }
};

const ChannelTabsPanel: React.FC = () => {
    // Get the current channel ID directly from Redux store
    const channelId = useSelector(getCurrentChannelId);
    const [activeTab, setActiveTab] = useState('pins');
    const [tabs, setTabs] = useState<Tab[]>(DEFAULT_TABS);

    useEffect(() => {
        if (!channelId) {
            return;
        }
        fetch(`${PLUGIN_API_BASE}/channels/${channelId}/tabs`, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setTabs(data);
                }
            })
            .catch(() => {
                // Use defaults on error
            });
    }, [channelId]);

    const renderTabContent = () => {
        switch (activeTab) {
        case 'pins':
            return <PinsView channelId={channelId}/>;
        case 'files':
            return <FilesView channelId={channelId}/>;
        case 'links':
            return <LinksView channelId={channelId}/>;
        case 'notes':
            return <NotesView channelId={channelId}/>;
        default:
            return <div className='tab-empty'>{'Select a tab'}</div>;
        }
    };

    if (!channelId) {
        return (
            <div className='channel-tabs-panel'>
                <div className='tab-empty'>{'Select a channel to view tabs.'}</div>
            </div>
        );
    }

    return (
        <div className='channel-tabs-panel'>
            <div className='tab-bar'>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.type ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.type)}
                    >
                        <i
                            className={`icon ${getTabIcon(tab.type)}`}
                            style={{marginRight: '6px', fontSize: '14px', position: 'relative', top: '2px'}}
                        />
                        {tab.title.replace(/^[^\w\s]+\s/, '')}
                    </button>
                ))}
            </div>
            <div className='tab-content'>
                {renderTabContent()}
            </div>
        </div>
    );
};

export default ChannelTabsPanel;
