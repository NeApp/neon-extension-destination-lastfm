module.exports = {
    babel: {
        include: [
            'node_modules/@fuzeman/lastfm/src'
        ]
    },
    children: [
        'callback'
    ],
    services: [
        'configuration',

        'destination/scrobble',
        'destination/sync'
    ]
};
