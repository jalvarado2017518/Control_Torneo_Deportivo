const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();


api.post('/usuarios/agregarAdministradores',md_autenticacion.Auth, usuariosController.agregarAdministradores);
api.post('/registar/usuario', usuariosController.registrarUsuario);
api.put('/usuarios/editar/:idUsuario?', md_autenticacion.Auth, usuariosController.editarUsuario);
api.delete('/usuarios/eliminar/:idUsuario?', md_autenticacion.Auth, usuariosController.eliminarUsuario);
api.post('/login', usuariosController.Login);

module.exports = api;