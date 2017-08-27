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
        'migrate',

        'destination/scrobble',
        'destination/sync'
    ]
};
