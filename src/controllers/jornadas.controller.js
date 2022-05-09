const Jornadas = require('../models/jornadas.model');
const Equipos = require('../models/equipos.model');
const Ligas = require('../models/ligas.model');
const Usuarios = require('../models/usuarios.model');


function mostrarJornadas(req, res) {
    var idLiga = req.params.idLiga;
    var idJornada;
    var user;

    if (req.user.rol == 'Usuario') {
        Jornadas.find({ Liga: idLiga, UsuarioCreador: req.user.sub }, (err, jornadasEncontradas) => {
            if (err) return res.status(500).send({ message: 'No perteneces a esta liga, intenta de nuevo' })
            if (jornadasEncontradas == '') return res.status(500).send({ message: 'No perteneces a esta liga, intenta de nuevo' })

            return res.status(200).send({ jornadas: jornadasEncontradas })
        })
    } else if (req.user.rol == 'ADMIN') {
        Jornadas.find({ Liga: idLiga, UsuarioCreador: req.user.sub }, (err, jornadasEncontradas) => {
            if (!jornadasEncontradas) return res.status(500).send({ message: 'No se han encontrado las jornadas' })
            return res.status(200).send({ jornadas: jornadasEncontradas })
        })
    }
}

function crearJornada(req, res) {
    var parametros = req.body;
    var joranadaModel = new Jornadas();
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }

    var JornadaMaxima;

    Equipos.find({ Liga: idLiga }, (err, equipoEnocntrado) => {
        if (!equipoEnocntrado) return res.status(500).send({ mensaje: 'No se han encontrado los equipos, intenta de nuevo'});

        if (equipoEnocntrado.length % 2 == 0) {
            JornadaMaxima = equipoEnocntrado.length - 1
        } else {
            JornadaMaxima = equipoEnocntrado.length
        }
        Jornadas.find({ Liga: idLiga }, (err, ligas) => {
            if (ligas.length >= JornadaMaxima) return res.status(500).send({ mensaje: 'Solo existen: ' + JornadaMaxima + ' jornadas maximas' });


            Ligas.findById({ _id: idLiga }, (err, ligaEncontradas) => {

                if (!ligaEncontradas) return res.status(500).send({ mensaje: 'No se ha encontrado ninguna liga' })

                Usuarios.findOne({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
    
                    UsuarioCreador = usuarioEncontrado._id;

                    if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ mensaje: 'No perteneces a esta liga, intenta de nuevo' });

                    if (parametros.nombreJornada) {

                        joranadaModel.nombreJornada = parametros.nombreJornada;
                        joranadaModel.Liga = idLiga;
                        joranadaModel.UsuarioCreador = UsuarioCreador;

                        Jornadas.findOne({ nombreJornada: parametros.nombreJornada, Liga: idLiga }, (err, jornadaEncontrada) => {

                            if (jornadaEncontrada == null) {
                                joranadaModel.save((err, jornadaGuardada) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                    if (!jornadaGuardada) return res.status(404).send({ mensaje: 'No se han encontrado los equipos' });

                                    return res.status(200).send({ jornada: jornadaGuardada });
                                })
                            } else {
                                return res.status(500).send({ mensaje: 'Esta jornada ya existe, intenta con otro nombre' })
                            }
                        })
                    } else {
                        return res.status(500).send({ mensaje: 'Por favor, llena todos los campos' })
                    }

                })
            })
        })
    })
}

function editarJornada(req, res) {
    var parametros = req.body;
    var idJornada = req.params.idJornada;
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }


    Jornadas.findById({ _id: idJornada }, (err, ligaEncontradas) => {
        if (!ligaEncontradas) return res.status(500).send({ message: 'No se ha encontrado la jornada' });

        Ligas.findById({ _id: ligaEncontradas.Liga }, (err, ligaFind) => {
            if (!ligaFind) return res.status(500).send({ message: 'No se ha encontrado la jornada' });

            Usuarios.findById({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
                if (!usuarioEncontrado) return res.status(500).send({ message: 'No se ha encontrado el usuario, intenta de nuevo' })

                if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ message: 'No pertences a esta liga, intenta de nuevo' });

                if (parametros.nombreJornada) {
                    Jornadas.findOne({ nombreJornada: parametros.nombreJornada, Liga: idLiga }, (err, jornadaEncontrada) => {

                        if (jornadaEncontrada == null) {
                            Jornadas.findByIdAndUpdate({ _id: idJornada }, parametros, { new: true }, (err, jornadaEditada) => {
                                if (err) return res.status(500).send({ message: 'Error en la peticion' });
                                if (!jornadaEditada) return res.status(404).send({ message: 'No se ha podido modificar la jornada, intenta de nuevo' });

                                return res.status(200).send({ jornada: jornadaEditada });
                            })
                        } else {
                            return res.status(500).send({ message: 'Esta jornada ya existe, intenta con otro nombre' })
                        }
                    })
                } else {
                    return res.status(500).send({ message: 'Por favor, llena todos los campos' })
                }

            })
        })
    })
}

function eliminarJornada(req, res) {
    var idJornada = req.params.idJornada;
    if (req.user.rol == 'ADMIN') {
        idLiga = req.params.idLiga
        UsuarioCreador = req.params.idCreador
    } else if (req.user.rol == 'Usuario') {
        UsuarioCreador = req.user.sub
        idLiga = req.params.idLiga
    }

    Jornadas.findById({ _id: idJornada }, (err, ligaEncontradas) => {
        if (!ligaEncontradas) return res.status(500).send({ message: 'No se ha encontrado jornada' });

        Ligas.findById({ _id: ligaEncontradas.Liga }, (err, ligaFind) => {
            if (!ligaFind) return res.status(500).send({ message: 'No se ha encontrado la liga' });

            Usuarios.findById({ _id: ligaEncontradas.UsuarioCreador }, (err, usuarioEncontrado) => {
                if (!usuarioEncontrado) return res.status(500).send({ message: 'No se ha encontrado el usuario' })

                if (req.user.rol == 'Usuario' && usuarioEncontrado._id != req.user.sub) return res.status(500).send({ message: 'No pertences a esta liga, intenta de nuevo' });

                Jornadas.findByIdAndDelete({ _id: idJornada }, { new: true }, (err, jornadaEliminada) => {
                    if (err) return res.status(500).send({ message: 'Error en la peticion' });
                    if (!jornadaEliminada) return res.status(404).send({ message: 'No se ha podido eliminar la jornada' });

                    return res.status(200).send({ jornada: jornadaEliminada });
                })

            })
        })
    })
}

module.exports = {
    mostrarJornadas,
    crearJornada,
    editarJornada,
    eliminarJornada
}