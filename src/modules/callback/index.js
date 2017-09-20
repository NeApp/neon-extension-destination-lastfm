import QueryString from 'querystring';

import Plugin from 'eon.extension.destination.lastfm/core/plugin';
import {isDefined} from 'eon.extension.framework/core/helpers';


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
        let messaging = Plugin.messaging.service('authentication');

        // Bind events
        messaging.once('success', onSuccess);
        messaging.once('error', onError);

        // Ensure search parameters exist
        if(window.location.search.length < 2) {
            onError({
                title: 'Invalid callback parameters',
                description: 'No parameters were found.'
            });
            return;
        }

        // Decode query parameters
        let query = QueryString.decode(
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
        messaging.emit('callback', query);

        // Display communication error if no response is returned in 5 seconds
        communicationTimeout = setTimeout(onTimeout, 5000);
    }

    // Process callback
    process();
})();
