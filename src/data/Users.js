define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.users = (function () {
        var SERVICE = 'Users',
            TEMPLATE = {
                id: 0,
                first_name: '',
                last_name: '',
                admin: 'N',
                role_id: 0,
                username: '',
                password: null,
                salt: null,
                locked: 'N',
                login_attempts: 0,
                login_count: 0,
                last_login_date: null,
                last_logout_date: null,
                last_login_attempt: null,
                login_token: null,
                session_id: null,
                uuid: null,
                active: 'Y'
            },
            _maxFields = keys(TEMPLATE).concat('role_code', 'role_name'),
            _methods = {
                getUsers: mdsol.ajax.RequestMethod(SERVICE, 'GetUsers').fields(_maxFields),
                upsertUsers: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertUsers'),
            },
            users = mdsol.data.DataTable(TEMPLATE, _methods, 'getUser', 'upsertUsers');

        return mdsol.Class.implement('subscribable', users);
    } ());
});