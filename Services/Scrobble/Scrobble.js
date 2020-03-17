import Get from 'lodash-es/get';
import IsNil from 'lodash-es/isNil';
import OmitBy from 'lodash-es/omitBy';

import Registry from '@radon-extension/framework/Core/Registry';
import ScrobbleService from '@radon-extension/framework/Services/Destination/Scrobble';
import {MediaTypes} from '@radon-extension/framework/Core/Enums';

import Account from '../../Api/Account';
import Client, {ApiError} from '../../Api/Client';
import Log from '../../Core/Logger';
import Plugin from '../../Core/Plugin';


export class Scrobble extends ScrobbleService {
    constructor() {
        super(Plugin, [
            MediaTypes.Music.Track
        ]);
    }

    onStarted(session) {
        // Update now playing status
        this._updateNowPlaying(session).then((response) => {
            Log.info('TODO: Handle "updateNowPlaying" response:', response);
        }, (err) => {
            Log.info('TODO: Handle "updateNowPlaying" error:', err);
        });
    }

    onStopped(session) {
        if(session.progress < 80) {
            return;
        }

        // Scrobble session
        this._scrobble(session).then((response) => {
            Log.info('TODO: Handle "scrobble" response:', response);
        }, (err) => {
            Log.info('TODO: Handle "scrobble" error:', err);
        });
    }

    // region Private methods

    _scrobble(session) {
        let request = this._buildRequest(session.item);

        if(request === null) {
            return Promise.reject(new Error('Unable to build request for session: ' + session));
        }

        // Set `item` timestamp
        request.timestamp = Math.round(Date.now() / 1000);

        // Scrobble session
        return this._onResponse(
            Client['track'].scrobble([request])
        );
    }

    _updateNowPlaying(session) {
        let request = this._buildRequest(session.item);

        if(request === null) {
            return Promise.reject(new Error('Unable to build request for session: ' + session));
        }

        // Update now playing status
        return this._onResponse(
            Client['track'].updateNowPlaying(request)
        );
    }

    _buildRequest(track) {
        if(track.type !== MediaTypes.Music.Track) {
            return null;
        }

        // Ensure duration is defined (to avoid invalid items)
        if(IsNil(track.duration)) {
            return null;
        }

        // Build request
        let request = {
            artist: Get(track, 'artist.title'),
            track: Get(track, 'title'),

            // Album (optional)
            album: Get(track, 'album.title'),
            albumArtist: Get(track, 'album.artist.title'),

            // Additional details (optional)
            duration: track.duration / 1000,
            trackNumber: Get(track, 'number')
        };

        // Remove "albumArtist" if it matches "artist"
        if(request.albumArtist === request.artist) {
            delete request.albumArtist;
        }

        // Remove undefined properties
        return OmitBy(request, IsNil);
    }

    _onResponse(promise) {
        return promise.catch((err) => {
            // Reset account on invalid session key (expired)
            if(err instanceof ApiError && err.code === 9) {
                Log.info('Authentication has expired, clearing session');

                return Account.reset().then(() =>
                    Promise.reject(err)
                );
            }

            // Unhandled error
            return Promise.reject(err);
        });
    }

    // endregion
}

// Register service
Registry.registerService(new Scrobble());
