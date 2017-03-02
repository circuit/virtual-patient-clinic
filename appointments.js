/*jshint esnext:true*/
'use strict';

const appointments = require('./appointments.json');

function get(id) {
    return new Promise((resolve, reject) => {
        let appointment = appointments.find(a => { return a.id === id; });
        if (!appointment) {
            reject(`Appointment ${id} not found.`);
            return;
        }
        resolve(appointment);
    })
}

module.exports = {
  get
}