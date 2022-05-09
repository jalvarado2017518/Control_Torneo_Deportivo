const express = require('express');
const equiposController = require('../controllers/equipos.controller');
const md_autenticacion = require('../middlewares/autenticacion');

var api = express.Router();

api.get('/Equipos/:idLiga?/:idUsuario?', md_autenticacion.Auth, equiposController.listarEquiposLiga);
api.get('/Equipos/PDF/:idLiga?/:idUsuario?', md_autenticacion.Auth, equiposController.listarEquiposLigaPDF);
api.post('/Equipo/crearEquipo/:idLiga?/:idUsuario?', md_autenticacion.Auth, equiposController.crearEquipo);
api.put('/Equipo/editarEquipo/:idLiga?/:idEquipo?/:idUsuario?', md_autenticacion.Auth, equiposController.editarEquipo);
api.delete('/Equipo/eliminarEquipo/:idLiga?/:idEquipo?/:idUsuario?', md_autenticacion.Auth, equiposController.eliminarEquipo);

module.exports = api;