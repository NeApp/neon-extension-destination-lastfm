import ScrobbleService from 'eon.extension.framework/services/destination/scrobble';
import Registry from 'eon.extension.framework/core/registry';

import Plugin from '../../core/plugin';


export class LastFmScrobbleService extends ScrobbleService {
    constructor() {
        super(Plugin);
    }
}

// Register service
Registry.registerService(new LastFmScrobbleService());
