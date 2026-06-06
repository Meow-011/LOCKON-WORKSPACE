import React from 'react';
import HomeDashboard from './components/HomeDashboard';
import HomeSidebarLink from './components/HomeSidebarLink';
import './styles.css';

class PluginClass {
    initialize(registry: any, store: any) {
        // Register the native LHS link right above Threads
        registry.registerLeftSidebarHeaderComponent(HomeSidebarLink);

        // Register the custom route for Home Dashboard inside the main layout
        registry.registerCustomRoute('/home', HomeDashboard);
        
        // Also register a channel header button as fallback
        registry.registerChannelHeaderButtonAction(
            () => React.createElement('i', {
                className: 'icon icon-home',
                style: { fontSize: '18px' },
            }),
            () => {
                // Navigate to the Home dashboard
                window.location.href = '/plug/com.lockon.home-tab/home';
            },
            'Home Dashboard',
            'Open LOCKON Home Dashboard',
        );
    }

    uninitialize() {}
}

// @ts-ignore
window.registerPlugin('com.lockon.home-tab', new PluginClass());
