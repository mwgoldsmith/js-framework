/*global merge,toArray,makeArray*/
define([
    '../core',
    '../var/keys',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './RemoteData'
], function (mdsol, keys) {
    mdsol.data.sites = (function () {
        var SERVICE = 'Sites',
            TEMPLATE = {
                id: 0,
                product_id: 0,
                client_id: 0,
                environment_code: '10',
                environment_order: 0,
                project: null,
                url: null,
                schema_version: null,
                database_name: null,
                import_profile_id: null,
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _minFields = [
                'id',
                'client_id', 
                'client_name', 
                'abbreviation', 
                'project', 
                'environment_code',
                'environment_order', 
                'product_id', 
                'environment'
            ],
            _serviceSitesFields = [
                'id', 
                'site_id', 
                'client_id', 
                'client_name',
                'environment', 
                'active'
            ],
            _maxFields = keys(TEMPLATE).concat('client_name', 'abbreviation', 'project'),
            _methods = {
                getSites: _request(SERVICE, 'GetSites')
                    .fields(_minFields),
                getSitesByProductId: _request(SERVICE, 'GetSitesByProductId', 'product_id')
                    .fields(_minFields),
                getSitesByEnvironment: _request(SERVICE, 'GetSitesByEnvironment')
                    .params('product_id', 'environment_code', 'environment_order')
                    .fields(_minFields),
                getUsageSitesByTableId: _request(SERVICE, 'GetUsageSitesByTableId')
                    .params('environment_code', 'environment_order', 'table_id'),
                getSitesByServiceId: _request(SERVICE, 'GetSitesByServiceId')
                    .params('environment_code', 'environment_order', 'service_id')
                    .fields(_serviceSitesFields),
                getSitesByClientId: _request(SERVICE, 'GetSitesByClientId', 'client_id')
                    .fields(_maxFields),
                encryptSiteCredentials: mdsol.ajax.Method(SERVICE, 'EncryptSiteCredentials')
                    .params('username', 'password'),
                upsertSites: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertSites'),
                upsertServiceSites: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertServiceSites')
            };

        return mdsol.data.RemoteData(TEMPLATE, _methods, 'getSitesByProductId', 'upsertSites');
    } ());
});
