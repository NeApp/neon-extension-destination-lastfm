import DestinationPlugin from 'eon.extension.framework/base/plugins/destination';


export class LastFmPlugin extends DestinationPlugin {
    constructor() {
        super('lastfm', 'Last.fm');
    }
}

export default new LastFmPlugin();
