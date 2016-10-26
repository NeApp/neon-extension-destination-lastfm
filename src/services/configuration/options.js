import {
    Page,
    EnableOption
} from 'eon.extension.framework/services/configuration/models';

import AuthenticationOption from './models/authentication';

import Plugin from '../../core/plugin';


export default [
    new Page(Plugin, null, Plugin.title, [
        new EnableOption(Plugin, 'enabled', 'Enabled', {
            default: false,

            type: 'plugin',
            permissions: true,
            contentScripts: true
        }),

        new AuthenticationOption(Plugin, 'authorization', 'Authentication', {
            requires: ['enabled']
        })
    ])
];
