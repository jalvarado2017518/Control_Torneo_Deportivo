const express = require('express');
const jornadasController = require('../Controllers/jornadas.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/mostrarJornadas/:idLiga?', md_autenticacion.Auth, jornadasController.mostrarJornadas);
api.post('/crearJornada/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.crearJornada);
api.put('/editarJornada/:idJornada?/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.editarJornada);
api.delete('/eliminarJornada/:idJornada?/:idLiga?/:idCreador?', md_autenticacion.Auth, jornadasController.eliminarJornada);


module.exports = api;