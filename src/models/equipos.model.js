const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EquiposSchema = Schema({ 
    nombreEquipo: String,
    golesFavor: Number,
    golesContra: Number,
    diferenciaGoles: Number,
    cantidadJugados: Number,
    pts: Number,
    Liga: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    UsuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuarios'}
});

module.exports = mongoose.model('Equipos', EquiposSchema);