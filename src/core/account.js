import Storage from 'eon.extension.browser/storage';

import Client from './client';
import Plugin from './plugin';


export default class Account {
    static refresh() {
        // Ensure client has been initialized
        return Client.ready.then(() =>
            // Fetch account details
            Client['user'].getInfo().then((account) => {
                console.log('account:', account);

                // Store account details
                Storage.putObject(Plugin.id + ':account', account);

                return account;
            }, (body, statusCode) => {
                return Promise.reject(new Error(
                    'Unable to retrieve account settings, response with status code ' + statusCode + ' returned'
                ));
            })
        );
    }
}
