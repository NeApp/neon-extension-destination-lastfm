import SyncService from 'eon.extension.framework/base/services/destination/sync';
import Registry from 'eon.extension.framework/core/registry';

import Plugin from '../../core/plugin';


export class LastFmSyncService extends SyncService {
    constructor() {
        super(Plugin);
    }
}

// Register service
Registry.registerService(new LastFmSyncService());
