define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.roleAcls = (function () {
        var SERVICE = 'Roles',
            TEMPLATE = {
                id: 0,
                role_id: 0,
                dialog: null,
                data_object: null,
                sub_data_object: null,
                gui_exposed: null,
                grant_create: null,
                grant_read: null,
                grant_update: null,
                grant_delete: null,
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _maxFields = keys(TEMPLATE).concat(['role_code', 'role_name']),
            _methods = {
                getRoleAcls: _request(SERVICE, 'GetRoleAcls')
                    .fields(_maxFields),
                getRoleAclsById: _request(SERVICE, 'GetRoleAclsById', 'role_id')
                    .fields(_maxFields),
                getRoleAclsByUsername: _request(SERVICE, 'GetRoleAclsByUsername', 'username')
                    .fields(_maxFields),
                upsertRoleAcls: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertRoleAcls')
            },
            roleAcls = mdsol.data.DataTable(TEMPLATE, _methods, 'getRoleAcls', 'upsertRoleAcls');

        return mdsol.Class.implement('subscribable', roleAcls);
    } ());
});