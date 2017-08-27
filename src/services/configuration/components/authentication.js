import Extension from 'eon.extension.browser/extension';
import Storage from 'eon.extension.browser/storage';
import MessagingBus, {ContextTypes} from 'eon.extension.framework/messaging/bus';
import Registry from 'eon.extension.framework/core/registry';
import {isDefined} from 'eon.extension.framework/core/helpers';
import {OptionComponent} from 'eon.extension.framework/services/configuration/components';

import React from 'react';
import uuid from 'uuid';

import Account from '../../../core/account';
import Client from '../../../core/client';
import Plugin from '../../../core/plugin';
import './authentication.scss';


export default class AuthenticationComponent extends OptionComponent {
    constructor() {
        super();

        this.bus = null;

        // Initial state
        this.state = {
            authenticated: false,
            account: {}
        };
    }

    componentWillMount() {
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

    componentWillUnmount() {
        // Close messaging bus
        if(isDefined(this.bus)) {
            this.bus.close();
            this.bus = null;
        }
    }

    onLoginClicked() {
        // Create messaging bus (and bind to authentication events)
        if(!isDefined(this.bus)) {
            this.bus = new MessagingBus(Plugin.id + ':authentication', {context: ContextTypes.Background});
            this.bus.on('authentication.callback', (data) => this.onCallback(data));
        }

        // Generate callback id (to validate against received callback events)
        this.callbackId = uuid.v4();

        // Open account authorization page
        window.open(Client['auth'].getAuthorizeUrl({
            callbackUrl: Extension.getCallbackUrl('/destination/lastfm/callback/callback.html?id=' + this.callbackId)
        }), '_blank');
    }

    onCallback(query) {
        if(query.id !== this.callbackId) {
            console.warn('Unable to authenticate with Last.fm: Invalid callback id');

            // Display error on the callback page
            this.bus.emit('authentication.error', {
                'title': 'Invalid callback id',
                'description': 'Please ensure you only click the "Login" button once.'
            });
            return;
        }

        // Request session key
        Client['auth'].getSession(query.token).then((session) => {
            // Update client authorization
            Client.session = session;

            // Update authorization token
            return Storage.putObject(Plugin.id + ':session', session)
                // Refresh account details
                .then(() => this.refresh())
                .then(() => {
                    // Display success message on the callback page
                    this.bus.emit('authentication.success');

                    // Close messaging bus
                    this.bus.close();
                    this.bus = null;
                });

        }, (error) => {
            console.warn('Unable to authenticate with Last.fm: %s', error.message);

            // Display error on the callback page
            this.bus.emit('authentication.error', {
                'title': 'Unable to request authentication session',
                'description': error.message
            });

            // Close messaging bus
            this.bus.close();
            this.bus = null;
        });
    }

    refresh() {
        // Ensure client has been initialized
        return Account.refresh().then((account) => {
            // Update state
            this.setState({
                authenticated: true,
                account: account
            });

            return account;
        }, (e) => {
            // Clear authorization
            return this.logout().then(() => {
                return Promise.reject(e);
            });
        });
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
