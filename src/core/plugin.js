import DestinationPlugin from 'neon-extension-framework/base/plugins/destination';


export class LastFmPlugin extends DestinationPlugin {
    constructor() {
        super('lastfm');
    }
}

export default new LastFmPlugin();
