import {MediaTypes} from 'eon.extension.framework/core/enums';
import Registry from 'eon.extension.framework/core/registry';
import ScrobbleService from 'eon.extension.framework/services/destination/scrobble';

import Client from '../../core/client';
import Plugin from '../../core/plugin';


export class Scrobble extends ScrobbleService {
    constructor() {
        super(Plugin, [
            MediaTypes.Music.Track
        ]);

        this._latestScrobbles = {};
    }

    onStarted(session) {
        // Build `item` for request
        var item = this._buildRequest(session.item);

        if(item === null) {
            console.warn('Unable to build request for session:', session);
            return;
        }

        // Update now playing status
        Client['track'].updateNowPlaying(item).then((response) => {
            console.debug('TODO: Handle "updateNowPlaying" response:', response);
        }, (body, statusCode) => {
            console.debug('TODO: Handle "updateNowPlaying" error, status code: %o, body: %O', statusCode, body);
        });
    }

    onProgress(session) {
        if(session.progress < 0.8 || !this._shouldScrobble(session)) {
            return;
        }

        // Scrobble track
        this._scrobble(session).then((response) => {
            console.debug('TODO: Handle "scrobble" response:', response);
        }, (body, statusCode) => {
            console.debug('TODO: Handle "scrobble" error, status code: %o, body: %O', statusCode, body);
        });
    }

    onEnded(session) {
        if(session.progress < 0.8 || !this._shouldScrobble(session)) {
            return;
        }

        // Scrobble track
        this._scrobble(session).then((response) => {
            console.debug('TODO: Handle "scrobble" response:', response);
        }, (body, statusCode) => {
            console.debug('TODO: Handle "scrobble" error, status code: %o, body: %O', statusCode, body);
        });
    }

    // region Private methods

    _shouldScrobble(session) {
        if(typeof this._latestScrobbles[session.source.id] === 'undefined') {
            return true;
        }

        return session.key > this._latestScrobbles[session.source.id];
    }

    _scrobble(session) {
        // Build `item` for request
        var item = this._buildRequest(session.item);

        if(item === null) {
            console.warn('Unable to build request for session:', session);
            return;
        }

        // Set `item` parameters
        item.timestamp = Math.round(Date.now() / 1000);

        // Set latest scrobble
        this._latestScrobbles[session.source.id] = session.key;

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
