import Registry from 'eon.extension.framework/core/registry';
import ScrobbleService from 'eon.extension.framework/services/destination/scrobble';
import {MediaTypes} from 'eon.extension.framework/core/enums';

import Client from '../../core/client';
import Plugin from '../../core/plugin';


export class Scrobble extends ScrobbleService {
    constructor() {
        super(Plugin, [
            MediaTypes.Music.Track
        ]);
    }

    onStarted(session) {
        // Build `item` for request
        let item = this._buildRequest(session.metadata);

        if(item === null) {
            console.warn('Unable to build request for session:', session);
            return;
        }

        // Update now playing status
        Client['track'].updateNowPlaying(item).then((response) => {
            console.info('TODO: Handle "updateNowPlaying" response:', response);
        }, (body, statusCode) => {
            console.info('TODO: Handle "updateNowPlaying" error, status code: %o, body: %O', statusCode, body);
        });
    }

    onStopped(session) {
        if(session.progress < 80) {
            return;
        }

        // Scrobble track
        this._scrobble(session).then((response) => {
            console.info('TODO: Handle "scrobble" response:', response);
        }, (body, statusCode) => {
            console.info('TODO: Handle "scrobble" error, status code: %o, body: %O', statusCode, body);
        });
    }

    // region Private methods

    _scrobble(session) {
        // Build `item` for request
        let item = this._buildRequest(session.metadata);

        if(item === null) {
            return Promise.reject(new Error(
                'Unable to build request for session: ' + session
            ));
        }

        // Set `item` timestamp
        item.timestamp = Math.round(Date.now() / 1000);

        // Scrobble track
        return Client['track'].scrobble([item]);
    }

    _buildRequest(item) {
        if(item.type.media !== MediaTypes.Music.Track) {
            return null;
        }

        return {
            artist: item.artist.title,
            album: item.album.title,
            track: item.title,

            duration: item.duration / 1000
        };
    }

    // endregion
}

// Register service
Registry.registerService(new Scrobble());
