import MigrateService from 'neon-extension-framework/services/migrate';
import Plugin from 'neon-extension-destination-lastfm/core/plugin';
import Registry from 'neon-extension-framework/core/registry';
import {isDefined} from 'neon-extension-framework/core/helpers';


export class LastFmMigrateService extends MigrateService {
    constructor() {
        super(Plugin);
    }
}

// Register service
Registry.registerService(new LastFmMigrateService());
