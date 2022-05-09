const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var LigasSchema = Schema({ 
    nombreLiga: String,
    UsuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuarios'}
});

module.exports = mongoose.model('Ligas', LigasSchema);