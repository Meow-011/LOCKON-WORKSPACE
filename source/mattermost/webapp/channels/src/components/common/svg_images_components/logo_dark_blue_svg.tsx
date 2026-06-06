// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import lockonLogo from '../../../images/logo.png';

type Props = {
    width?: number | string;
    height?: number | string;
    className?: string;
}

export default (props: Props) => (
    <img
        src={lockonLogo}
        className={props.className}
        width={props.width || 116}
        height={props.height || 20}
        alt="LOCKON Workspace"
        style={{
            objectFit: 'contain', 
            objectPosition: 'left center',
            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))',
            transform: 'scale(1.6)',
            transformOrigin: 'left center'
        }}
    />
);
