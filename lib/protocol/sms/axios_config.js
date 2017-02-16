var x = require('axios');
var errors = require('../../errors');
var queryString = require('query-string');

var axios = x.create();
axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response && error.response.data) {
        return Promise.reject(errors.getProtocolError(error.response.data.error, error.response.data.message || ''));
    }

    return Promise.reject(new errors.ConnectionError());
});

axios.defaults.timeout = 30000;
axios.defaults.paramsSerializer = function(params) {
    return queryString.stringify(params);
};

module.exports = axios;
