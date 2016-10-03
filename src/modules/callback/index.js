import Messaging from 'eon.extension.framework/messaging/window';

import querystring from 'querystring';


function process() {
    if(window.location.search.length < 2) {
        Messaging.emit('reject', 'Missing search parameters');
        return;
    }

    let parent = (window.opener || window.parent);

    if(parent === null) {
        Messaging.emit('reject', 'Unable to find parent window');
        return;
    }

    // Decode query string
    let query = querystring.decode(window.location.search.substring(1));

    // Emit response event
    if(typeof query.token !== 'undefined') {
        Messaging.emit('resolve', query.token);
    } else {
        Messaging.emit('reject', 'Unable to retrieve token');
    }
}

// Process callback
try {
    process();
} catch(e) {
    console.error('Unable to process callback:', e.stack);
}
