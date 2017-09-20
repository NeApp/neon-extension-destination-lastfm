import {Group, Page, EnableOption, SelectOption} from 'eon.extension.framework/services/configuration/models';

import AuthenticationOption from './models/authentication';
import Plugin from '../../core/plugin';


export default [
    new Page(Plugin, null, Plugin.title, [
        new EnableOption(Plugin, 'enabled', 'Enabled', {
            default: false,

            type: 'plugin'
        }),

        new AuthenticationOption(Plugin, 'authorization', 'Authentication', {
            requires: ['enabled']
        }),

        new Group(Plugin, 'scrobble', 'Scrobble', [
            new EnableOption(Plugin, 'scrobble:enabled', 'Enabled', {
                default: true,
                requires: ['enabled'],

                type: 'service'
            })
        ]),

        new Group(Plugin, 'debugging', 'Debugging', [
            new SelectOption(Plugin, 'debugging.log_level', 'Log Level', [
                {key: 'error', label: 'Error'},
                {key: 'warning', label: 'Warning'},
                {key: 'notice', label: 'Notice'},
                {key: 'info', label: 'Info'},
                {key: 'debug', label: 'Debug'},
                {key: 'trace', label: 'Trace'}
            ], {
                default: 'warning'
            })
        ])
    ])
];
