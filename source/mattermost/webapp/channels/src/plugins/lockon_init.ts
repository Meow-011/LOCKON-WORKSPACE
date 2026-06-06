// Copyright (c) LOCKON Workspace. All Rights Reserved.
// This module registers LOCKON-specific components directly into the Mattermost
// plugin infrastructure, without requiring a separate plugin webapp bundle.

import PluginRegistry from 'plugins/registry';

import ChannelTabsPanel from 'components/channel_tabs';
import LockonAIPanel from 'components/lockon_ai/lockon_ai_panel';

// Import the icon from Core images (bundled with webpack)
import channelTabsIconUrl from 'images/channel-tabs-icon.svg';
import lockonAiIconUrl from 'images/lockon-ai-icon.svg';

// The virtual plugin ID used for registration (matches the Go server plugin)
const LOCKON_CHANNEL_TABS_PLUGIN_ID = 'com.lockon.channel-tabs-v3';

let isInitialized = false;

/**
 * Initialize LOCKON core customizations.
 * Called once during app startup (from root.tsx), after plugins are loaded.
 *
 * This registers the Channel Tabs RHS panel in the App Bar using the same
 * plugin registry mechanism that Mattermost plugins use, ensuring full
 * compatibility with the existing RHS infrastructure.
 */
export function initializeLockon(): void {
    if (isInitialized) {
        return;
    }
    isInitialized = true;

    const registry = new PluginRegistry(LOCKON_CHANNEL_TABS_PLUGIN_ID);

    // Register Channel Tabs in the App Bar with an RHS panel
    // Icon is now bundled in Core via webpack (no Plugin dependency)
    registry.registerAppBarComponent({
        iconUrl: channelTabsIconUrl,
        tooltipText: 'Channel Tabs',
        rhsComponent: ChannelTabsPanel,
        rhsTitle: 'Channel Tabs',
    });

    // Register LOCKON AI Chat in the App Bar
    registry.registerAppBarComponent({
        iconUrl: lockonAiIconUrl,
        tooltipText: 'LOCKON AI',
        rhsComponent: LockonAIPanel,
        rhsTitle: 'LOCKON AI',
    });
}
