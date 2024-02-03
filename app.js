'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar rutas aqui...

var user_routes = require('./routes/user');


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras http


//Cargar rutas base

app.use('/api', user_routes);

app.get('/pruebas', function(req, res){
    res.status(200).send({message: 'Bienvenido al curso de MEAN'})
});


//Exportación de módulos

module.exports = app;