const Usuarios = require('../models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const fs = require('fs');


function AdministradorInicial() {
    Usuarios.find({ rol: "Admin", usuario: "ADMIN" }, (err, usuarioEcontrado) => {
      if (usuarioEcontrado.length == 0) {
        bcrypt.hash("deportes123", null, null, (err, passwordEncriptada) => {
          Usuarios.create({
            usuario: "ADMIN",
            password: passwordEncriptada,
            rol: "Admin",
          });
        });
      }
    });
  }

function registrarUsuario(req, res) {
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

    if (parametros.nombre && parametros.usuario && parametros.password) {
        usuarioModelo.nombre = parametros.nombre;
        usuarioModelo.usuario = parametros.usuario;
        usuarioModelo.rol = 'Usuario';
        if (parametros.rol == 'Usuario') return res.status(500).send({ mensaje: 'El Rol siempre será "Usuario", no puedes elegir' });
        Usuarios.find({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
            if (usuarioEcontrado == 0) {

                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    usuarioModelo.password = passwordEncriptada;

                    usuarioModelo.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ message: 'Error en la peticion' });
                        if (!usuarioGuardado) return res.status(404).send({ message: 'No se han encontraron usuarios' });

                        return res.status(200).send({ usuario: usuarioGuardado });
                    });
                });
            } else {
                return res.status(500).send({ mensaje: 'Este usuario ya se utiliza, prueba otro' });
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Por favor, llene todos los campos' });
    }
}

function agregarAdministradores(req, res) {
    var parametros = req.body;
    var usuarioModelo = new Usuarios();
    if (req.user.rol == 'Usuario' || req.user.rol == 'ADMIN') {
        return res.status(500).send({ mensaje: 'No puedes realizar esta acción, porque no eres ADMIN' });
    } else {
        if (parametros.nombre && parametros.apellido && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.apellido = parametros.apellido;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'ADMIN';
            Usuarios.find({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
                if (usuarioEcontrado == 0) {
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;

                        usuarioModelo.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ message: 'Error en la peticion' });
                            if (!usuarioGuardado) return res.status(404).send({ message: 'No se han los encontraron usuarios' });

                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });
                } else {
                    return res.status(500).send({ mensaje: 'Este usuario ya se utiliza, prueba otro' });
                }
            })
        } else {
            return res.status(500).send({ mensaje: 'Por favor, llene todos los campos' })
        }
    }
}

function Login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({ usuario: parametros.usuario }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (usuarioEncontrado) {
            bcrypt.compare(parametros.password, usuarioEncontrado.password, (err, verificacionPassword) => {
                if (verificacionPassword) {
                    if (parametros.obtenerToken === 'true') {
                        return res.status(200).send({ token: jwt.crearToken(usuarioEncontrado) })
                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuario: usuarioEncontrado })
                    }
                } else {
                    return res.status(500).send({ mensaje: 'la password no coincide' })
                }
            })

        } else {
            return res.status(500).send({ mensaje: "Error, usuario no se encuentra registrado" })
        }
    })
}

function editarUsuario(req, res) {
    var idUsu = req.params.idUsuario;
    var parametros = req.body;

    if (req.user.rol == 'Usuario') {
        if (parametros.rol) {
            return res.status(500).send({ message: 'No puedes modificar tu rol' })
        } else {
            Usuarios.findByIdAndUpdate({ _id: req.user.sub }, parametros, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion' });
                if (!usuarioActualizado) return res.status(404).send({ message: 'No se han los encontraron usuarios' });

                return res.status(200).send({ usuario: usuarioActualizado });
            });
        }

    } else {
        Usuarios.findById(idUsu, (err, usuarioEcontrado) => {
            if (err) return res.status(500).send({ message: 'Ocurrio un error en la peticion de usuario' });
            if (!usuarioEcontrado) return res.status(500).send({ message: 'Este usuario no existe' });

            if (usuarioEcontrado.rol == 'ADMIN') {
                return res.status(500).send({ message: 'No puedes modificar a otros administradores' })
            } else {
                Usuarios.findByIdAndUpdate({ _id: idUsu }, parametros, { new: true }, (err, usuarioActualizado) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion' });
                    if (!usuarioActualizado) return res.status(404).send({ message: 'No puedes modificar a otro admnistrador' });

                    return res.status(200).send({ usuarios: usuarioActualizado });
                });
            }
        })

    }

}

function eliminarUsuario(req, res) {
    var idUsu = req.params.idUsuario;

    if (req.user.rol == 'Usuario') {
        Usuarios.findByIdAndDelete({ _id: req.user.sub }, { new: true }, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioEliminado) return res.status(404).send({ message: "Error en la busqueda" });

            return res.status(200).send({ usuario: usuarioEliminado });
        })
    } else if (req.user.rol == 'Admin') {
        Usuarios.findById(idUsu, (err, usuarioObtenido) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioObtenido) return res.status(404).send({ message: "Error en la busqueda" });

            if (idUsu == req.user.sub) {
                Usuarios.findByIdAndDelete(idUsu, { new: true }, (err, usuarioEliminado) => {
                    if (err) return res.status(500).send({ message: "Error en la peticion" });
                    if (!usuarioEliminado) return res.status(404).send({ message: "Error en la busqueda" });

                    return res.status(200).send({ usuarios: usuarioEliminado });
                })
            } else {
                if (usuarioObtenido.rol == 'ADMIN') {
                    return res.status(500).send({ mensaje: "No se pueden eliminar los administradores" });
                } else {
                    Usuarios.findByIdAndDelete(idUsu, { new: true }, (err, usuarioEliminado) => {
                        if (err) return res.status(500).send({ message: "Error en la peticion" });
                        if (!usuarioEliminado) return res.status(404).send({ message: "Error en la busqueda" });

                        return res.status(200).send({ usuario: usuarioEliminado });
                    });
                }
            }
        });
    } 

}



module.exports = {
    AdministradorInicial,
    registrarUsuario,
    agregarAdministradores,
    Login,
    editarUsuario,
    eliminarUsuario 
}