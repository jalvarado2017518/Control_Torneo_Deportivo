const Ligas = require('../models/ligas.model');

function mostrarLigas(req, res) {
    if (req.user.rol == 'Usuario') return res.status(500).send({ message: 'No puedes acceder a esta información' });

    Ligas.find((err, listaLigas) => {
        if (err) return res.status(500).send({ message: 'error al mostrar' });
        if (!listaLigas) return res.status(500).send({ message: 'Aún no se han creado ligas' });

        return res.status(200).send({ Ligas: listaLigas });
    });
}

function crearLiga(req, res) {
    var parametros = req.body;
    var ligaModel = new Ligas();
    var UsuarioCreador;

    if (parametros.nombreLiga) {
        ligaModel.nombreLiga = parametros.nombreLiga;
        if (req.user.rol == 'Usuario') {
            UsuarioCreador = req.user.sub;
            ligaModel.UsuarioCreador = req.user.sub;
        } else if (req.user.rol == 'Admin') {
            if (req.params.UsuarioCreador == null) {
                return res.status(500).send({ message: 'No ha podido enviar el id de usuario' })
            } else {
                UsuarioCreador = req.params.UsuarioCreador
                ligaModel.UsuarioCreador = UsuarioCreador;
            }
        }
        Ligas.find({ nombreLiga: parametros.nombreLiga, UsuarioCreador: UsuarioCreador }, (err, ligaEncontrada) => {
            if (ligaEncontrada == 0) {
                ligaModel.save((err, ligaGuardada) => {
                    if (err) return res.status(500).send({ message: 'Ocurrio un error al guardar' });
                    if (!ligaGuardada) return res.status(500).send({ message: 'No se pudo guardar' });

                    return res.status(200).send({ Liga: ligaGuardada })
                });
            } else {
                return res.status(500).send({ message: 'Ya hay una liga con este nombre' })
            }
        });
    } else {
        return res.status(500).send({ message: 'Por favor, llene los campos' })
    }
}

function editarLiga(req, res) {
    var parametros = req.body;
    var liga = req.params.idLiga;
    if (parametros.nombreLiga) {
        if (req.user.rol == 'Usuario') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga, UsuarioCreador: req.user.sub }, (err, ligaEncotradas) => {
                if (ligaEncotradas != null && parametros.nombreLiga != ligaEncotradas.nombreLiga) {
                    return res.status(500).send({ mensaje: 'Ya hay una liga con este nombre, ingresa otro' });
                } else {
                    Ligas.findByIdAndUpdate({ _id: liga, UsuarioCreador: req.user.sub }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ mensaje: 'No se ha podido editar la liga' });
                        if (!ligaEditada) return res.status(500).send({ mensaje: 'No se ha podido editar la liga, intenta de nuevo' });

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })
                }
            });
        } else if (req.user.rol == 'Admin') {
            Ligas.findOne({ nombreLiga: parametros.nombreLiga }, (err, ligaEncotradas) => {
                if (ligaEncotradas == null && liga == ligaEncotradas._id) {
                    Ligas.findByIdAndUpdate({ _id: liga }, parametros, { new: true }, (err, ligaEditada) => {
                        if (err) return res.status(500).send({ mensaje: 'No se ha podido editar la liga, intenta de nuevo' });
                        if (!ligaEditada) return res.status(500).send({ mensaje: 'No se pudo editar los datos' });

                        return res.status(200).send({ ligaEditada: ligaEditada })
                    })
                } else {
                    return res.status(500).send({ mensaje: 'Ya hay una liga con este nombre, ingresa otro' });
                }
            });
        }
    } else {
        return res.status(500).send({ mensaje: 'Llena todos los campos, por favor' });
    }
}

function eliminarLiga(req, res) {
    var liga = req.params.idLiga;
    if (req.user.rol == 'Usuario') {
        Ligas.findByIdAndDelete({ _id: liga, UsuarioCreador: req.user.sub }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ mensaje: 'No se ha podido eliminar la liga, intenta de nuevo' });
            if (!ligaEliminada) return res.status(500).send({ mensaje: 'No se ha podido eliminar los datos, intenta de nuevo' });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    } else if (req.user.rol == 'ADMIN') {
        Ligas.findByIdAndDelete({ _id: liga }, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ mensaje: 'No se ha podido eliminar la liga, intenta de nuevo' });
            if (!ligaEliminada) return res.status(500).send({ mensaje: 'No se ha podido eliminar los datos, intenta de nuevo' });

            return res.status(200).send({ ligaEliminada: ligaEliminada })
        })
    }
}

module.exports = {
    mostrarLigas,
    crearLiga,
    editarLiga,
    eliminarLiga
}