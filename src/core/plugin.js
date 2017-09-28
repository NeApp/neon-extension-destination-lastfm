import DestinationPlugin from 'neon-extension-framework/base/plugins/destination';

import Manifest from '../../module.json';


export class LastFmPlugin extends DestinationPlugin {
    constructor() {
        super('lastfm', Manifest);
    }
}

export default new LastFmPlugin();
