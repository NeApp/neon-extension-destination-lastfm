import Account from 'eon.extension.destination.lastfm/core/account';
import Client from 'eon.extension.destination.lastfm/core/client';
import Plugin from 'eon.extension.destination.lastfm/core/plugin';
import Preferences from 'eon.extension.framework/preferences';
import Log from 'eon.extension.framework/core/logger';
import Registry from 'eon.extension.framework/core/registry';
import MigrateService from 'eon.extension.framework/services/migrate';
import {isDefined} from 'eon.extension.framework/core/helpers';


export class LastFmMigrateService extends MigrateService {
    constructor() {
        super(Plugin);
    }

    onPreferences(preferences) {
        if(!isDefined(preferences.lastfm)) {
            return;
        }

        Log.info('Migrating last.fm preferences...');

        // Migrate session
        if(isDefined(preferences.lastfm.session)) {
            this.migrateSession(preferences.lastfm.session.key)
                // Refresh account details
                .then(() => Account.refresh());
        }
    }

    migrateSession(key) {
        if(!isDefined(key)) {
            return Promise.reject();
        }

        // Update client session
        Client.session = { key };

        // Update preferences
        Log.info('Migrating last.fm session...');

        return Promise.all([
            Preferences.putBoolean(Plugin.id + ':enabled', true),
            Preferences.putBoolean(Plugin.id + ':scrobble:enabled', true),

            // Session
            Plugin.storage.putObject('session', { key })
        ]);
    }
}

// Register service
Registry.registerService(new LastFmMigrateService());
