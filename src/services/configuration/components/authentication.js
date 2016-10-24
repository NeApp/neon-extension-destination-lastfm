import Extension from 'eon.extension.browser/extension';
import Storage from 'eon.extension.browser/storage';
import Popup from 'eon.extension.framework/popup';
import Registry from 'eon.extension.framework/core/registry';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {OptionComponent} from 'eon.extension.framework/services/configuration/components';

import React from 'react';
import uuid from 'uuid';

import Client from '../../../core/client';
import Plugin from '../../../core/plugin';
import './authentication.scss';


export default class AuthenticationComponent extends OptionComponent {
    constructor() {
        super();

        this.popup = null;

        this.state = {
            authenticated: false,
            account: {}
        };
    }

    componentWillMount() {
        // Ensure previous popup has been disposed
        this.disposePopup();

        // Retrieve account details
        Storage.getObject(Plugin.id + ':account')
            .then((account) => {
                if(account === null) {
                    return;
                }

                this.setState({
                    authenticated: true,
                    account: account
                });
            });
    }

    disposePopup() {
        if(!isDefined(this.popup)) {
            return;
        }

        // Dispose popup (close window, disconnect messaging channel)
        try {
            this.popup.dispose();
        } catch(e) {
            console.warn('Unable to dispose popup:', e.stack);
        }

        // Clear state
        this.popup = null;
    }

    onLoginClicked() {
        let popupId = uuid.v4();

        // Build callback url
        let callbackUrl = Extension.getCallbackUrl(
            '/destination/lastfm/callback/callback.html'
        );

        // Build authorize url
        let authorizeUrl = Client['auth'].getAuthorizeUrl({
            callbackUrl: callbackUrl
        });

        // Ensure previous popup has been disposed
        this.disposePopup();

        // Create popup
        this.popup = Popup.create(authorizeUrl, {
            id: popupId,

            location: 0,
            status: 0,
            toolbar: 0,

            position: 'center',
            width: 450,
            height: 450,

            offsetTop: 100
        });

        // Store latest popup id as fallback (for Firefox)
        Storage.putString(Plugin.id + ':authentication.latestPopupId', popupId).then(() => {
            // Open authorize popup
            return this.popup.open()
                .then((token) => Client['auth'].getSession(token))
                .then((session) => {
                    // Update client authorization
                    Client.session = session;

                    // Update authorization token
                    return Storage.putObject(Plugin.id + ':session', session).then(() => {
                        // Refresh account
                        return this.refresh();
                    });
                }, (error) => {
                    console.warn('Unable to authenticate with last.fm, error:', error.message);
                });
        });
    }

    refresh() {
        // Ensure client has been initialized
        return Client.ready.then(() =>
            // Fetch account settings
            Client['user'].getInfo().then((account) => {
                console.log('account:', account);

                // Update state
                this.setState({
                    authenticated: true,
                    account: account
                });

                // Update account settings
                Storage.putObject(Plugin.id + ':account', account);

                return account;
            }, (body, statusCode) => {
                // Clear authorization
                return this.logout().then(() => {
                    // Reject promise
                    return Promise.reject(new Error(
                        'Unable to retrieve account settings, response with status code ' + statusCode + ' returned'
                    ));
                });
            })
        );
    }

    logout() {
        // Reset last.fm client
        Client.session = null;

        // Clear token and account details from storage
        return Storage.put(Plugin.id + ':session', null)
            .then(() => Storage.put(Plugin.id + ':account', null))
            .then(() => {
                // Update state
                this.setState({
                    authenticated: false,
                    account: {}
                });
            });
    }

    render() {
        if(this.state.authenticated) {
            // Logged in
            let account = this.state.account;

            return (
                <div data-component={Plugin.id + ':authentication'} className="box active">
                    <div className="shadow"></div>

                    <div className="inner">
                        <div className="avatar" style={{
                            backgroundImage: 'url(' + account.image[account.image.length - 1]['#text'] + ')'
                        }}/>

                        <div className="content">
                            <h3 className="title">{account.realname || account.name}</h3>

                            <div className="actions">
                                <button
                                    type="button"
                                    className="button secondary small"
                                    onClick={this.refresh.bind(this)}>
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    className="button secondary small"
                                    onClick={this.logout.bind(this)}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Logged out
        return (
            <div data-component={Plugin.id + ':authentication'} className="box login">
                <div className="inner">
                    <button
                        type="button"
                        className="button small"
                        onClick={this.onLoginClicked.bind(this)}>
                        Login
                    </button>
                </div>
            </div>
        );
    }
}

AuthenticationComponent.componentId = Plugin.id + ':services.configuration:authentication';

// Register option component
Registry.registerComponent(AuthenticationComponent);
