import Account from 'neon-extension-destination-lastfm/core/account';
import Client from 'neon-extension-destination-lastfm/core/client';
import Log from 'neon-extension-framework/core/logger';
import MigrateService from 'neon-extension-framework/services/migrate';
import Plugin from 'neon-extension-destination-lastfm/core/plugin';
import Preferences from 'neon-extension-framework/preferences';
import Registry from 'neon-extension-framework/core/registry';
import {isDefined} from 'neon-extension-framework/core/helpers';


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
