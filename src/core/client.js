import {Storage} from 'eon.extension.browser';

import {Client as LastFM} from '@fuzeman/lastfm/src/index';

import Plugin from './plugin';


var Client = new LastFM(
    '2c794d3b3415a2fb072f41fc8a8edcc7',
    '92a0a2adaf14f954e8d8999a9fb95524'
);

// Retrieve account token
Client.ready = Storage.getObject(Plugin.id + ':session')
    .then((session) => {
        // Update client authorization
        Client.session = session;
    });

export default Client;
