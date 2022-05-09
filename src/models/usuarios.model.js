const mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UsuariosSchema = Schema({ 
    nombre: String,
    apellido: String,
    password: String,
    rol: String,
    usuario: String,
    imagen: String,
});

module.exports = mongoose.model('Usuarios', UsuariosSchema);