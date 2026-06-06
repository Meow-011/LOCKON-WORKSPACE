// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl} from 'react-intl';
import type {WrappedComponentProps} from 'react-intl';

import {WithTooltip} from '@mattermost/shared/components/tooltip';

import IconButton from 'components/global_header/header_icon_button';
import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import PolicyModal from './PolicyModal';
import ReportProblemModal from './ReportProblemModal';

import {ModalIdentifiers} from 'utils/constants';

import type {PropsFromRedux} from './index';

const askTheCommunityUrl = 'https://mattermost.com/pl/default-ask-mattermost-community/';

type Props = WrappedComponentProps & PropsFromRedux;

type State = {
    buttonActive: boolean;
};

class UserGuideDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            buttonActive: false,
        };
    }

    openKeyboardShortcutsModal = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
            dialogType: KeyboardShortcutsModal,
        });
    };

    openPrivacyPolicy = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: 'privacy_policy_modal',
            dialogType: PolicyModal,
            dialogProps: {
                title: 'Privacy Policy',
                icon: 'icon-shield-outline',
                content: (
                    <>
                        <p><em>Last Updated: June 6, 2026</em></p>
                        <h3>Information We Collect</h3>
                        <p>When you use LOCKON Workspace, we collect minimal data necessary to provide our services. This includes:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Your name, email, and authentication credentials.</li>
                            <li><strong>Usage Data:</strong> System logs, communication metadata, and feature engagement metrics.</li>
                        </ul>
                        <h3>How We Use Your Data</h3>
                        <p>Your data is used strictly for operational purposes, such as maintaining service reliability, monitoring for security threats, and improving product features. We do not sell your personal data.</p>
                        <h3>Data Security</h3>
                        <p>We employ enterprise-grade security measures including encryption at rest and in transit. Access to production data is strictly controlled and audited.</p>
                        <h3>Your Rights</h3>
                        <p>You have the right to access, correct, or request the deletion of your personal data. Please contact your system administrator for assistance regarding corporate privacy guidelines.</p>
                    </>
                ),
            },
        });
    };

    openTermsOfService = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: 'terms_of_service_modal',
            dialogType: PolicyModal,
            dialogProps: {
                title: 'Terms of Service',
                icon: 'icon-file-text-outline',
                content: (
                    <>
                        <p><em>Last Updated: June 6, 2026</em></p>
                        <h3>Acceptance of Terms</h3>
                        <p>Welcome to LOCKON Workspace. By accessing or using this software, you agree to abide by these Terms of Service. If you do not agree with any part of these terms, you must not use the platform.</p>
                        <h3>Account Responsibilities</h3>
                        <p>You are responsible for safeguarding your account credentials. You must promptly notify your administrator of any unauthorized access or security breaches.</p>
                        <h3>Intellectual Property</h3>
                        <p>All software, design, and branding (including the LOCKON trademark) are the intellectual property of LOCKON, Inc. Content created within the workspace remains the property of your organization.</p>
                        <h3>Limitation of Liability</h3>
                        <p>LOCKON Workspace is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, or consequential damages arising from the use or inability to use the platform.</p>
                    </>
                ),
            },
        });
    };

    openAcceptableUse = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: 'acceptable_use_modal',
            dialogType: PolicyModal,
            dialogProps: {
                title: 'Acceptable Use Policy',
                icon: 'icon-check-circle-outline',
                content: (
                    <>
                        <p><em>Last Updated: June 6, 2026</em></p>
                        <h3>Professional Conduct</h3>
                        <p>Users of LOCKON Workspace must adhere to professional conduct at all times. Treat your colleagues with respect and maintain a constructive communication environment.</p>
                        <h3>Prohibited Activities</h3>
                        <p>The following activities are strictly prohibited:</p>
                        <ul>
                            <li>Harassing, bullying, or discriminating against other users.</li>
                            <li>Transmitting spam, malware, or any malicious code.</li>
                            <li>Attempting to bypass security controls or access unauthorized areas of the system.</li>
                        </ul>
                        <h3>Sensitive Information</h3>
                        <p>Do not share highly sensitive, classified, or PII (Personally Identifiable Information) in public channels unless explicitly authorized. Always ensure compliance with your organization's IT security policies.</p>
                        <h3>Enforcement</h3>
                        <p>Violations of this policy may result in immediate account suspension and further disciplinary action as determined by your organization.</p>
                    </>
                ),
            },
        });
    };

    openReportProblem = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: 'report_problem_modal',
            dialogType: ReportProblemModal,
            dialogProps: {
                currentUsername: this.props.currentUsername || 'unknown',
            },
        });
    };

    buttonToggleState = (menuActive: boolean) => {
        this.setState({
            buttonActive: menuActive,
        });
    };

    renderDropdownItems = (): React.ReactNode => {
        const {
            intl,
            pluginMenuItems,
        } = this.props;

        const pluginItems = pluginMenuItems?.map((item) => {
            return (
                <Menu.ItemAction
                    id={item.id + '_pluginmenuitem'}
                    iconClassName='icon-thumbs-up-down'
                    key={item.id + '_pluginmenuitem'}
                    onClick={item.action}
                    text={item.text}
                />
            );
        });

        return (
            <Menu.Group>
                <Menu.ItemAction
                    id='privacyPolicy'
                    iconClassName='icon-shield-outline'
                    onClick={this.openPrivacyPolicy}
                    text='Privacy Policy'
                />
                <Menu.ItemAction
                    id='termsOfService'
                    iconClassName='icon-file-text-outline'
                    onClick={this.openTermsOfService}
                    text='Terms of Service'
                />
                <Menu.ItemAction
                    id='acceptableUse'
                    iconClassName='icon-check-circle-outline'
                    onClick={this.openAcceptableUse}
                    text='Acceptable Use Policy'
                />
                {this.props.reportAProblemLink && (
                    <Menu.ItemAction
                        id='reportAProblemLink'
                        iconClassName='icon-alert-outline'
                        onClick={this.openReportProblem}
                        text={intl.formatMessage({id: 'userGuideHelp.reportAProblem', defaultMessage: 'Report a problem'})}
                    />
                )}
                <Menu.ItemAction
                    id='keyboardShortcuts'
                    iconClassName='icon-keyboard-return'
                    onClick={this.openKeyboardShortcutsModal}
                    text={intl.formatMessage({id: 'userGuideHelp.keyboardShortcuts', defaultMessage: 'Keyboard shortcuts'})}
                />
                {pluginItems}
            </Menu.Group>
        );
    };

    render() {
        const {intl} = this.props;
        const tooltipText = (
            <FormattedMessage
                id={'channel_header.userHelpGuide'}
                defaultMessage='Help'
            />
        );

        return (
            <MenuWrapper
                id='helpMenuPortal'
                className='userGuideHelp'
                onToggle={this.buttonToggleState}
            >
                <WithTooltip
                    title={'LOCKON Support'}
                >
                    <IconButton
                        icon={'help-circle-outline'}
                        onClick={() => {}} // icon button currently requires onclick ... needs to revisit
                        active={this.state.buttonActive}
                        aria-controls='AddChannelDropdown'
                        aria-expanded={this.state.buttonActive}
                        aria-label={'LOCKON Support'}
                    />
                </WithTooltip>
                <Menu
                    openLeft={false}
                    openUp={false}
                    id='AddChannelDropdown'
                    ariaLabel={'LOCKON Support'}
                >
                    {this.renderDropdownItems()}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(UserGuideDropdown);
