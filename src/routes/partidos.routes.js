const express = require('express');
const partidosController = require('../Controllers/partidos.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

api.post('/crearPartido/:idJornada?', md_autenticacion.Auth, partidosController.crearPartido);

api.put('/editarPartido/:idPartido?', md_autenticacion.Auth, partidosController.editarDatosPartido);


module.exports = api;