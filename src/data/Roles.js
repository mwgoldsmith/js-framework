define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.roles = (function () {
        var SERVICE = 'Roles',
            TEMPLATE = {
                id: 0,
                code: '',
                name: '',
                internal: 'N',
                active: 'Y'
            },
            _methods = {
                getRoles: mdsol.ajax.RequestMethod(SERVICE, 'GetRoles')
                    .fields(keys(TEMPLATE)),
                upsertRoles: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertRoles')
            },
            roles = mdsol.data.DataTable(TEMPLATE, _methods, 'getRoles', 'upsertRoles');

        return mdsol.Class.implement('subscribable', roles);
    } ());
});