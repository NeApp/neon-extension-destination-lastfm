import Storage from 'eon.extension.browser/storage';

import MessagingBus from 'eon.extension.framework/messaging/bus';

import querystring from 'querystring';

import Plugin from '../../core/plugin';


function getCallbackId() {
    if(window.name !== '') {
        return Promise.resolve(window.name);
    }

    return Storage.getString(Plugin.id + ':authentication.latestPopupId')
        .then((callbackId) =>
            'eon.popup/' + callbackId
        );
}

function sendResponse(callbackId, token) {
    return new Promise((resolve) => {
        // Connect to relay messaging bus
        let bus = new MessagingBus(callbackId + '/callback').connect(
            'eon.extension.core:relay'
        );

        // Emit response event
        if(typeof token !== 'undefined') {
            bus.relay(callbackId, 'popup.resolve', token);
        } else {
            bus.relay(callbackId, 'popup.reject', 'Unable to retrieve token');
        }

        // Disconnect messaging bus
        bus.disconnectAll();

        resolve();
    });
}

function process() {
    // Validate search parameters
    if(window.location.search.length < 2) {
        console.error('Missing search parameters');
        return;
    }

    // Decode query string
    let query = querystring.decode(
        window.location.search.substring(1)
    );

    // Send code to configuration page
    getCallbackId().then((callbackId) => {
        sendResponse(callbackId, query.token);
    }).then(() => {
        window.close();
    });
}

// Process callback
try {
    process();
} catch(e) {
    console.error('Unable to process callback:', e.stack);
}
