## Virtual Patient Clinic

Patients get a url for virtual appointment with which they are connected to the clinic operator.  The clinic operator sees all patients with their doctor to be seen and can then connect a patient to the doctor.

Prior to connecting a patient to a doctor the communication is done via socket.io, without Circuit involvement. Once the operator connects the patient with a doctor, the patient make use of Circuit's guest feature. A bot is monitoring the calls which is how the operators console is kept up to date. 

Future enhancements:

 - Socket.io messaging between operator and patient, prior to connecting to doctor
 - Provide patient dial in number in addition to url
 - Circuit integration into the operator console so that operator can easily communicate with doctors 


#### Live demo

https://med.circuitsandbox.net


### Getting Started

Rename `config.json.template` to `config.json` and add your bot credentials.
Edit `appointments.json` with your appointments. In real life this would pull from the clinic database.


#### Install the app

```bash
    git clone https://github.com/circuit/virtual-patient-clinic.git
    cd virtual-patient-clinic
    cp config.json.template config.json
    // Add your bot credentials to config.json
    // Edit appointments.json with userId of your doctors
    npm install
    curl "https://circuitsandbox.net/circuit.tgz" -o "circuit.tgz"
    npm install circuit.tgz
    node server.js
    // Open browsers at http://localhost:3000 and http://localhost:3000/operator
```


