/*
    Copyright (c) 2017 Unify Inc.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* jslint node: true */
'use strict';

const EventEmitter = require('events');
const express = require('express');
const app = express();
const circuit = require('./circuit');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Patient = require('./patient');
const PatientState = require('./patientState');
const appointments = require('./appointments');
const port = process.env.PORT || 3000;

let patients = [];
let emitter = new EventEmitter();

app.use(express.static(__dirname + '/public'));

circuit.init(emitter);

/**
 * Circuit module events
 */
emitter.on('update-operators', _ => {
    io.in('operator').emit('patients', patients.map(p => {return p.info;}));
});

emitter.on('conf-started', callId => {
    let patient = patients.find(p => { return p.session && p.session.callId === callId; });
    if (patient) {
        patient.status = PatientState.WITH_DOCTOR;
        io.in('operator').emit('patients', patients.map(p => {return p.info;}));
    }
});

emitter.on('conf-ended', callId => {
    let patient = patients.find(p => { return p.session && p.session.callId === callId; });
    if (patient) {
        patient && patients.splice(patients.indexOf(patient), 1);
        io.in('operator').emit('patients', patients.map(p => {return p.info;}));
    }
});

/**
 * Client socket.io connections
 */
io.on('connection', socket => {
    let query = socket.handshake.query;
    if (query.patient) {
        appointments.get(query.patient)
        .then(appointment => {
            // Check if the patient is already in the list. Can be the case if user goes
            // back from 'In Room' to home.
            let patient = patients.find(p => { return p.id === appointment.id; });
            patient && patients.splice(patients.indexOf(patient), 1);

            patient = new Patient(socket, appointment);

            // Update operators when wait time is updated
            patient.onWaitUpdate = _ => socket.broadcast.to('operator').emit('patients', patients.map(p => {return p.info;}));

            // Add patient to list and update patient and operator UI
            patients.push(patient);
            socket.emit('update', patient.info);
            socket.broadcast.to('operator').emit('patients', patients.map(p => {return p.info;}));
        })
        .catch(err => {
            console.error(err);
            socket.disconnect();
        });

        socket.on('disconnect', _ => {
            let patient = patients.find(p => { return p.socket.id === socket.id; });
            if (!patient) {
                console.error(`Patient disconnected, but not in the patients list.`);
                return;
            }
            if (patient.status === PatientState.IN_ROOM) {
                // Don't remove patient from list and instead have the SDK monitoring
                // take over the patient.
            } else {
                // Notify operators
                patient && patients.splice(patients.indexOf(patient), 1);
                socket.broadcast.to('operator').emit('patients', patients.map(p => {return p.info;}));
            }
        });
    } else if (query.operator) {
        // Return patients to new operator and join the room
        socket.emit('patients', patients.map(p => {return p.info;}));
        socket.join('operator');
        console.log(`Operator ${query.operator} connected.`);

        socket.on('connect-to-doctor', id => {
            let patient = patients.find(p => { return p.id === id; });
            if (patient) {
                circuit.createConversation(patient)
                .then(obj => {
                    patient.session = obj;
                    patient.status = PatientState.IN_ROOM;
                    io.in('operator').emit('patients', patients.map(p => {return p.info;}));
                    patient.redirect(obj.url);
                })
                .catch(console.error);
            }
        });

        socket.on('disconnect-patient', id => {
            let patient = patients.find(p => { return p.id === id; });
            if (patient) {
                patient.socket.disconnect();
            }
        });

        socket.on('disconnect', _ => console.log(`Operator disconnected`));
    }
});

server.listen(port, _ => console.log(`Server listening at port ${port}`));
