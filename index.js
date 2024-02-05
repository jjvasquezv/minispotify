'use strict'

const mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;


mongoose.connect('mongodb://localhost:27017/cm2').then(
    res => console.log(`La base de datos se ha conectado exitosamente`),
    err => console.log(`Error de conexión a la base de datos: $err`),
    app.listen(port, function(){
        console.log("Servidor API REST del servicio de Música escuchando en http://localhost:"+port);
    })
    );