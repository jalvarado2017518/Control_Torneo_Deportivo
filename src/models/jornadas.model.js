const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var JornadasSchema = Schema({ 
    nombreJornada: String,
    Liga: { type: Schema.Types.ObjectId, ref: 'Ligas'},
    UsuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuarios'}
});

module.exports = mongoose.model('Jornadas', JornadasSchema);