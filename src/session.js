// @DONE (2013-09-17 11:11)
define([
    './core',
    './core/Class',
    './abstract/api',
    './abstract/subscribable'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        var SESSION_SERVICE = 'Sessions',
            _method = mdsol.ajax.Method,
            _methods = {
                userLogout: _method(SESSION_SERVICE, 'UserLogout', 'session_id'),
                userLogin: _method(SESSION_SERVICE, 'UserLogin')
                    .params('username', 'password_hash'),
                resumeSession: _method(SESSION_SERVICE, 'ResumeSession')
                    .params('session_id', 'username'),
                guestLogin: _method(SESSION_SERVICE, 'GuestLogin'),
                getUserLoginToken: _method(SESSION_SERVICE, 'UserGetLoginToken', 'username'),
                getNextSaltValue: _method(SESSION_SERVICE, 'GetNextSaltValue')
            },
            _user = null;

        function getSessionCookie() {
            var value = mdsol.getCookie('metabaselogin'),
                cookie = null,
                raw, a;

            raw = value && mdsol.decodeBase64(value);
            if (raw) {
                a = raw.split('/');

                try {
                    cookie = {
                        username: a[0],
                        session_id: a[1],
                        expires: new Date(parseInt(a[2], 10))
                    };
                } catch (e) {
                    cookie = null;
                }
            }

            return cookie;
        };

        function initialize() {
            var cookie;

            // 1. Check for presence of login cookie
            cookie = getSessionCookie();
            // 2. If the session stored in the cookie has not yet expired:
            if (cookie && cookie.username.length && cookie.username !== 'guest' && cookie.expires > now()) {
                // 2a. Attempt to resume the session.
                // 2a1. If successful, go to step 4 
            }

            /*
            3. Else, attempt to login as guest user.
            3a. If successful, go to step 4 
            3b. Else, if failure:
            3b1. Alert user the system is currently unavailable
            3b2. Terminate
            4. Create the new user session
            4a. Set the user information (see action F - SETTING USER INFORMATION)
            4b. Set the user access (see action D - SETTING USER ACCESS)
            5. Initialize the navigation bar
            6. Attempt to load the products
            7. Attempt to load the dialogs
            */
        }

        function login(username, password) {
            this.publish('beforeLogin', { username: username });

        }

        function logout() {
            this.publish('beforeLogout', { user: _user });

        }

        function isAdmin() {

        }

        function getUserData() {

        }

        function getDialogAccess() {

        }

        function getDataObjectAccess() {

        }

        function getSubDataObjectAccess() {

        }

        function dispose() {
            return mdsol;
        }

        function onTokenLoaded(success, data, xhrMethod) {
            var apiLogin;

            if (success && data && data.length) {

            } else {
                apiLogin = this.apiGetMethod('userLogin');
                
                _user.login_token = data[0].login_token;
                _user.salt = data[0].salt;
                _user.password = mdsol.sha1(_user.password + _user.salt);
                
                apiLogin.execute(onLogin, _user.username, mdsol.sha1(_user.password + _user.login_token));
            }
        }

        function onLogin(success, data, xhrMethod) {
            if (success) {
                // TODO: Implement

                this.publish('afterLogin', { _user: _user });
            } else {
                // TODO: Implement
            }
        }

        function onLogout(success, data, xhrMethod) {
            var username = _user.username;

            // TODO: Implement

            this.publish('afterLogout', { username: username });
        }

        var session = mdsol.Class.implement(['subscribable', 'api'], {
            initialize: initialize,

            login: login,

            logout: logout,

            isAdmin: isAdmin,

            getUserData: getUserData,

            getDialogAccess: getDialogAccess,

            getDataObjectAccess: getDataObjectAccess,

            getSubDataObjectAccess: getSubDataObjectAccess,

            dispose: dispose
        });

        session.apiMethods(_methods);

        // Expose public members
        mdsol.Class.namespace('mdsol.session', session);
    } ());
});
