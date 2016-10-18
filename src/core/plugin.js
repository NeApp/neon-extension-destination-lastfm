import DestinationPlugin from 'eon.extension.framework/base/plugins/destination';

import Manifest from '../../manifest.json';


export class LastFmPlugin extends DestinationPlugin {
    constructor() {
        super('lastfm', Manifest);
    }
}

export default new LastFmPlugin();
