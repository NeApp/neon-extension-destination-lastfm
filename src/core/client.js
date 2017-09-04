import Storage from 'eon.extension.browser/storage';

import {Client as LastFM} from '@fuzeman/lastfm/src/index';

import Log from './logger';
import Plugin from './plugin';


const Client = new LastFM(
    '2c794d3b3415a2fb072f41fc8a8edcc7',
    '92a0a2adaf14f954e8d8999a9fb95524'
);

function updateSession() {
    // Retrieve session from storage
    Storage.getObject(Plugin.id + ':session').then((session) => {
        Log.debug('[%s] Session changed to: %o', window.location.href, session);

        // Update client
        Client.session = session;

        Log.debug('[%s] Client: %o', window.location.href, Client);
    });
}

// Update client if session changes
Storage.onChanged(Plugin.id + ':session', updateSession);

// Set initial client session
updateSession();

export default Client;
