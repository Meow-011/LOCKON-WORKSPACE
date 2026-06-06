// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback, useMemo} from 'react';
import {Route} from 'react-router-dom';

import AnnouncementBar from 'components/announcement_bar';

import type {HeaderProps} from './header';

import './header_footer_route.scss';

const Header = React.lazy(() => import('./header'));
const Footer = React.lazy(() => import('./footer'));

import bg26 from 'images/loginbg/26.svg';
import bg27 from 'images/loginbg/27.svg';
import bg28 from 'images/loginbg/28.svg';
import bg29 from 'images/loginbg/29.svg';
import bg30 from 'images/loginbg/30.svg';
import bg31 from 'images/loginbg/31.svg';
import bg32 from 'images/loginbg/32.svg';
import bg33 from 'images/loginbg/33.svg';

// Login background SVGs
const LOGIN_BG_IMAGES = [
    bg26,
    bg27,
    bg28,
    bg29,
    bg30,
    bg31,
    bg32,
    bg33,
];

export type CustomizeHeaderType = (props: HeaderProps) => void;

export type HFRouteProps = {
    path: string;
    component: React.ComponentType;
};

export const HFRoute = ({path, component}: HFRouteProps) => {
    const [headerProps, setHeaderProps] = useState<HeaderProps>({});

    const customizeHeader: CustomizeHeaderType = useCallback((props) => {
        setHeaderProps(props);
    }, []);

    const Component = component as React.ComponentType<{onCustomizeHeader?: CustomizeHeaderType}>;

    // Pick a random background image once per mount
    const bgImage = useMemo(() => {
        const idx = Math.floor(Math.random() * LOGIN_BG_IMAGES.length);
        return LOGIN_BG_IMAGES[idx];
    }, []);

    return (
        <Route
            path={path}
            render={() => (
                <>
                    <React.Suspense fallback={null}>
                        <AnnouncementBar/>
                    </React.Suspense>
                    <div className='header-footer-route'>
                        <div
                            className='background-image'
                            style={{backgroundImage: `url(${bgImage})`}}
                        />
                        <div className='header-footer-route-container'>
                            <React.Suspense fallback={null}>
                                <Header {...headerProps}/>
                            </React.Suspense>
                            <React.Suspense fallback={null}>
                                <Component onCustomizeHeader={customizeHeader}/>
                            </React.Suspense>
                            <React.Suspense fallback={null}>
                                <Footer/>
                            </React.Suspense>
                        </div>
                    </div>
                </>
            )}
        />
    );
};
