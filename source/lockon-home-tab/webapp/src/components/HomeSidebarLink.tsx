import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const HomeSidebarLink: React.FC = () => {
    const { pathname } = useLocation();
    const isActive = pathname.startsWith('/plug/com.lockon.home-tab/home');

    return (
        <ul className="SidebarGlobalThreads NavGroupContent nav nav-pills__container">
            <li
                id="sidebar-home-button"
                className={`SidebarChannel ${isActive ? 'active' : ''}`}
                tabIndex={-1}
            >
                <Link
                    to="/plug/com.lockon.home-tab/home"
                    id="sidebarItem_home"
                    draggable="false"
                    className="SidebarLink sidebar-item"
                    tabIndex={0}
                >
                    <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="icon icon-home" style={{ fontSize: '18px', opacity: 0.7 }} />
                    </span>
                    <div className="SidebarChannelLinkLabel_wrapper">
                        <span className="SidebarChannelLinkLabel sidebar-item__name">
                            Home
                        </span>
                    </div>
                </Link>
            </li>
        </ul>
    );
};

export default HomeSidebarLink;
