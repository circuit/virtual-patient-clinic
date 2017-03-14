document.addEventListener('DOMContentLoaded', event => {
    let name =  'Betsy Homberg';
    let socket = io({query: `operator=${name}`});

    socket.on('patients', patients => {
        app.patients = patients;
    });

    let app = new Vue({
        el: '#app',
        methods: {
            connect: function (patient) {
                socket.emit('connect-to-doctor', patient.id)
                console.log(`Connect patient ${patient.firstName} ${patient.lastName}`);
            },
            message: function () {
                alert(`Not implemented yet`);
            }
        },
        data: {
            patients: []
        }
    });
});
