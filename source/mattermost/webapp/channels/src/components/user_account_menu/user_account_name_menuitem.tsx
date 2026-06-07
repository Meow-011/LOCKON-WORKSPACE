// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import {openModal} from 'actions/views/modals';

import * as Menu from 'components/menu';
import UserSettingsModal from 'components/user_settings/modal';
import Avatar from 'components/widgets/users/avatar/avatar';

import {ModalIdentifiers} from 'utils/constants';

interface Props extends Menu.FirstMenuItemProps {
    profilePicture?: string;
}

export default function UserAccountNameMenuItem({profilePicture, ...rest}: Props) {
    const dispatch = useDispatch();

    const currentUser = useSelector(getCurrentUser);

    function handleClick() {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {isContentProductSettings: false},
        }));
    }

    function getRoleBadge() {
        if (!currentUser) return null;
        
        let roleName = 'Member';
        let badgeClass = 'role-badge-member';
        
        const roles = currentUser.roles || '';
        if (roles.includes('system_admin')) {
            roleName = 'System Admin';
            badgeClass = 'role-badge-admin';
        } else if (roles.includes('system_guest')) {
            roleName = 'Guest';
            badgeClass = 'role-badge-guest';
        }

        return (
            <span className={`user-role-badge ${badgeClass}`}>
                {roleName}
            </span>
        );
    }

    function getLabel() {
        const roleBadge = getRoleBadge();

        if (
            currentUser?.first_name?.length > 0 ||
            currentUser?.last_name?.length > 0
        ) {
            const name = `${currentUser?.first_name} ${currentUser?.last_name}`?.trim();

            return (
                <>
                    <span className='userAccountMenu_nameMenuItem_primaryLabel'>
                        {name}
                    </span>
                    <span className='userAccountMenu_nameMenuItem_secondaryLabel'>
                        {'@' + currentUser?.username}
                    </span>
                    {roleBadge}
                </>
            );
        }

        const username = `@${currentUser?.username}`?.trim();

        return (
            <>
                <h2 className='userAccountMenu_nameMenuItem_primaryLabel'>
                    {username}
                </h2>
                {roleBadge}
            </>
        );
    }

    return (
        <Menu.Item
            className='userAccountMenu_nameMenuItem'
            leadingElement={
                <Avatar
                    size='lg'
                    url={profilePicture}
                    aria-hidden='true'
                />
            }
            labels={getLabel()}
            onClick={handleClick}
            aria-haspopup={true}
            {...rest}
        />
    );
}
