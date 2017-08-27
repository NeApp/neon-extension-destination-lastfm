import MessagingBus from 'eon.extension.framework/messaging/bus';
import {isDefined} from 'eon.extension.framework/core/helpers';

import querystring from 'querystring';
import uuid from 'uuid';

import Plugin from 'eon.extension.destination.lastfm/core/plugin';


(function() {
    let communicationTimeout;

    let $status = document.querySelector('.status');
    let $title = document.querySelector('.title');
    let $description = document.querySelector('.description');

    function updateStatus(status, {title, description}) {
        // Update status classes
        if(!$status.classList.contains(status)) {
            $status.classList.remove('success', 'error');
            $status.classList.add(status);
        }

        // Update message title
        if(isDefined(title)) {
            $title.textContent = title;
        } else {
            $title.textContent = '';
        }

        // Update message description
        if(isDefined(description)) {
            $description.textContent = description;
        } else {
            $description.textContent = '';
        }
    }

    function onSuccess() {
        // Clear the communication timeout handler
        if(isDefined(communicationTimeout)) {
            clearTimeout(communicationTimeout);
        }

        // Display completion message
        updateStatus('success', {
            'title': 'Authentication complete',
            'description': 'You may now close this page.'
        });
    }

    function onError(error) {
        // Display error
        updateStatus('error', error);
    }

    function onTimeout() {
        onError({
            title: 'Unable to communicate with the configuration page',
            description: 'Please ensure you don\'t close the configuration page during the authentication process.'
        });
    }

    function process() {
        // Create messaging bus
        let bus = new MessagingBus(Plugin.id + ':callback:' + uuid.v4());

        // Connect to channel
        bus.connect(Plugin.id + ':authentication');

        // Bind to authentication events
        bus.on('authentication.success', onSuccess);
        bus.on('authentication.error', onError);

        // Ensure search parameters exist
        if(window.location.search.length < 2) {
            onError({
                title: 'Invalid callback parameters',
                description: 'No parameters were found.'
            });
            return;
        }

        // Decode query parameters
        let query = querystring.decode(
            window.location.search.substring(1)
        );

        // Ensure token is defined
        if(!isDefined(query.token)) {
            onError({
                title: 'Invalid callback parameters',
                description: 'No "token" parameter was found.'
            });
            return;
        }

        // Emit authentication token
        bus.emit('authentication.callback', query);

        // Display communication error if no response is returned in 5 seconds
        communicationTimeout = setTimeout(onTimeout, 5000);
    }

    // Process callback
    process();
})();
