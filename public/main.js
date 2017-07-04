const getParams = query => {
    if (!query) {
        return { };
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
        let [ key, value ] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
    }, { });
};


var socket;

var app = new Vue({
    el: '#app',
    data: {
        info: {},
        id: null
    },
    created: function() {
        let params = getParams(window.location.search);
        if (!params || !params.id) {
            return;
        }
        this.id = params.id;
        socket = io({query: `patient=${params.id}`});

        socket.on('update', data => {
            this.info = data;
        });

        socket.on('redirect', data => {
            window.location.href = data.url;
        });

        socket.on('connect', _ => {
            console.log(`Connected.`);
        });

        socket.on('disconnect', function () {
            console.log('you have been disconnected');
        });

        socket.on('reconnect', function () {
            console.log('you have been reconnected');
        });

        socket.on('reconnect_error', function () {
            console.log('attempt to reconnect has failed');
        });
    },
    methods: {
    }
});