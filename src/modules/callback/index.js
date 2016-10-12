import {isDefined} from 'eon.extension.framework/core/helpers';
import MessagingBus from 'eon.extension.framework/messaging/bus';

import querystring from 'querystring';


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

    // Retrieve callback identifier
    let id;

    if(isDefined(query.id)) {
        id = 'eon.popup/' + query.id;
    } else if(window.name !== '') {
        id = window.name;
    } else {
        console.error('Unable to retrieve callback identifier');
        return;
    }

    // Connect to relay messaging bus
    let bus = new MessagingBus(id + '/callback').connect(
        'eon.extension.core:relay'
    );

    // Emit response event
    if(typeof query.token !== 'undefined') {
        bus.relay(id, 'popup.resolve', query.token);
    } else {
        bus.relay(id, 'popup.reject', 'Unable to retrieve token');
    }

    // Close window
    window.close();
}

// Process callback
try {
    process();
} catch(e) {
    console.error('Unable to process callback:', e.stack);
}
