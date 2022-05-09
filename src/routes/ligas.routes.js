const express = require('express');
const ligasController = require('../controllers/ligas.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/mostarLigas', md_autenticacion.Auth, ligasController.mostrarLigas);
api.post('/crearLiga/:UsuarioCreador?', md_autenticacion.Auth, ligasController.crearLiga);
api.put('/editarLiga/:idLiga?', md_autenticacion.Auth, ligasController.editarLiga)
api.delete('/eliminarLiga/:idLiga?', md_autenticacion.Auth, ligasController.eliminarLiga)

module.exports = api;