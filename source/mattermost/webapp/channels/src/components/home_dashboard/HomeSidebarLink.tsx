import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';

const HomeSidebarLink: React.FC = () => {
    const { url } = useRouteMatch();

    return (
        <ul className="SidebarGlobalThreads NavGroupContent nav nav-pills__container">
            <li
                id="sidebar-home-button"
                className="SidebarChannel"
                tabIndex={-1}
            >
                <NavLink
                    to={`${url}/home`}
                    id="sidebarItem_home"
                    activeClassName="active"
                    draggable="false"
                    className="SidebarLink sidebar-item"
                    tabIndex={0}
                >
                    <span className="icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3ZM12 5.39L18 9.89V19H17V12H7V19H6V9.89L12 5.39Z" />
                        </svg>
                    </span>
                    <div className="SidebarChannelLinkLabel_wrapper">
                        <span className="SidebarChannelLinkLabel sidebar-item__name">
                            Home
                        </span>
                    </div>
                </NavLink>
            </li>
        </ul>
    );
};

export default HomeSidebarLink;
