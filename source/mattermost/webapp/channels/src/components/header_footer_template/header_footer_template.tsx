// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {Modal} from 'react-bootstrap';

type Props = {
    children?: React.ReactNode | React.ReactNodeArray;
}

const HeaderFooterNotLoggedIn = (props: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [modalContent, setModalContent] = useState<{title: React.ReactNode, body: React.ReactNode} | null>(null);

    useEffect(() => {
        document.body.classList.add('sticky');
        const rootElement: HTMLElement | null = document.getElementById('root');
        if (rootElement) {
            rootElement.classList.add('container-fluid');
        }

        return () => {
            document.body.classList.remove('sticky');
            const rootElement: HTMLElement | null = document.getElementById('root');
            if (rootElement) {
                rootElement.classList.remove('container-fluid');
            }
        };
    }, []);

    const openModal = (e: React.MouseEvent, title: React.ReactNode, body: React.ReactNode) => {
        e.preventDefault();
        setModalContent({title, body});
    };

    const aboutContent = (
        <div style={{color: 'var(--center-channel-color)'}}>
            <p style={{color: 'var(--center-channel-color-72)', fontStyle: 'italic', marginBottom: '24px'}}>Version 1.0.0</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px'}}>Next-Generation Team Collaboration</h4>
            <p>LOCKON Workspace is an AI-powered collaboration platform designed to bring your team's communication, tasks, and knowledge into one unified hub.</p>
            <ul style={{paddingLeft: '20px', marginTop: '12px'}}>
                <li style={{marginBottom: '8px'}}><strong>AI Assistant:</strong> Built-in AI to summarize, translate, and explain complex messages.</li>
                <li style={{marginBottom: '8px'}}><strong>Seamless Integration:</strong> Connects with your favorite tools.</li>
                <li style={{marginBottom: '8px'}}><strong>Enterprise Grade Security:</strong> Your data is protected with industry-leading encryption.</li>
            </ul>
        </div>
    );

    const privacyContent = (
        <div style={{color: 'var(--center-channel-color)'}}>
            <p style={{color: 'var(--center-channel-color-72)', fontStyle: 'italic', marginBottom: '24px'}}>Last Updated: {new Date().toLocaleDateString()}</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>INFORMATION WE COLLECT</h4>
            <p>When you use LOCKON Workspace, we collect minimal data necessary to provide our services. This includes:</p>
            <ul style={{paddingLeft: '20px', marginTop: '12px'}}>
                <li style={{marginBottom: '8px'}}><strong>Account Information:</strong> Your name, email, and authentication credentials.</li>
                <li style={{marginBottom: '8px'}}><strong>Usage Data:</strong> System logs, communication metadata, and feature engagement metrics.</li>
            </ul>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>HOW WE USE YOUR DATA</h4>
            <p>Your data is used strictly for operational purposes, such as maintaining service reliability, monitoring for security threats, and improving product features. We do not sell your personal data.</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>DATA SECURITY</h4>
            <p>We employ enterprise-grade security measures including encryption at rest and in transit. Access to production data is strictly controlled and audited.</p>
        </div>
    );

    const termsContent = (
        <div style={{color: 'var(--center-channel-color)'}}>
            <p style={{color: 'var(--center-channel-color-72)', fontStyle: 'italic', marginBottom: '24px'}}>Last Updated: {new Date().toLocaleDateString()}</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>1. ACCEPTANCE OF TERMS</h4>
            <p>By accessing or using LOCKON Workspace, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>2. USER CONDUCT</h4>
            <p>You agree to use LOCKON Workspace only for lawful purposes. You must not use the platform to transmit harmful, illegal, or abusive content.</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>3. SERVICE AVAILABILITY</h4>
            <p>We strive for 99.9% uptime, but we do not guarantee uninterrupted service. We reserve the right to suspend or terminate accounts that violate our policies.</p>
        </div>
    );

    const helpContent = (
        <div style={{color: 'var(--center-channel-color)'}}>
            <p>Need assistance? Please contact your system administrator for help with LOCKON Workspace.</p>
            <h4 style={{fontSize: '16px', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#B3916B'}}>CONTACT ADMINISTRATOR</h4>
            <ul style={{paddingLeft: '20px', marginTop: '12px'}}>
                <li style={{marginBottom: '8px'}}>If you are unable to log in, please reach out to your IT Helpdesk or Workspace Admin.</li>
                <li style={{marginBottom: '8px'}}>For feature requests or bug reports, please use the internal feedback channel after logging in.</li>
            </ul>
        </div>
    );

    const content = [];

    content.push(
        <a
            key='about_link'
            id='about_link'
            className='footer-link'
            href="#"
            onClick={(e) => openModal(e, <><i className='icon icon-information-outline' style={{marginRight: '8px', color: '#B3916B'}} /> About LOCKON</>, aboutContent)}
        >
            {formatMessage({id: 'web.footer.about', defaultMessage: 'About'})}
        </a>,
    );

    content.push(
        <a
            key='privacy_link'
            id='privacy_link'
            className='footer-link'
            href="#"
            onClick={(e) => openModal(e, <><i className='icon icon-shield-outline' style={{marginRight: '8px', color: '#B3916B'}} /> Privacy Policy</>, privacyContent)}
        >
            {formatMessage({id: 'web.footer.privacy', defaultMessage: 'Privacy Policy'})}
        </a>,
    );

    content.push(
        <a
            key='terms_link'
            id='terms_link'
            className='footer-link'
            href="#"
            onClick={(e) => openModal(e, <><i className='icon icon-text-box-outline' style={{marginRight: '8px', color: '#B3916B'}} /> Terms of Service</>, termsContent)}
        >
            {formatMessage({id: 'web.footer.terms', defaultMessage: 'Terms'})}
        </a>,
    );

    content.push(
        <a
            key='help_link'
            id='help_link'
            className='footer-link'
            href="#"
            onClick={(e) => openModal(e, <><i className='icon icon-lifebuoy' style={{marginRight: '8px', color: '#B3916B'}} /> Help & Support</>, helpContent)}
        >
            {formatMessage({id: 'web.footer.help', defaultMessage: 'Help'})}
        </a>,
    );

    return (
        <div className='inner-wrap'>
            <div className='row content'>
                {props.children}
            </div>
            <div className='row footer'>
                <div
                    id='footer_section'
                    className='footer-pane col-xs-12'
                >
                    <div className='col-xs-12'>
                        <span
                            id='company_name'
                            className='pull-right footer-site-name'
                        >
                            {'LOCKON Workspace'}
                        </span>
                    </div>
                    <div className='col-xs-12'>
                        <span
                            id='copyright'
                            className='pull-right footer-link copyright'
                        >
                            {`© ${new Date().getFullYear()} LOCKON, Inc.`}
                        </span>
                        <span className='pull-right'>
                            {content}
                        </span>
                    </div>
                </div>
            </div>

            <Modal
                className="lockon-footer-modal"
                show={modalContent !== null}
                onHide={() => setModalContent(null)}
                dialogClassName="a11y__modal"
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title style={{fontWeight: 600, display: 'flex', alignItems: 'center'}}>{modalContent?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '70vh', overflowY: 'auto'}}>
                    {modalContent?.body}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default HeaderFooterNotLoggedIn;
