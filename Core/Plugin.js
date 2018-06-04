import DestinationPlugin from 'neon-extension-framework/Models/Plugin/Destination';


export class LastFmPlugin extends DestinationPlugin {
    constructor() {
        super('lastfm');
    }
}

export default new LastFmPlugin();
