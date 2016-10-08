import {
    EnableOption
} from 'eon.extension.framework/services/configuration/models';

import AuthenticationOption from './models/authentication';

import Plugin from '../../core/plugin';


export default [
    new EnableOption(Plugin, 'enabled', 'Enabled', {
        default: false,
        permissions: Plugin.manifest.permissions
    }),

    new AuthenticationOption(Plugin, 'authorization', 'Authentication', {
        requires: ['enabled']
    })
];
