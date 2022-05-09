//importaciones
const express = require('express');
const cors = require('cors');
var app = express();

const UsuariosRutas = require('./src/routes/usuarios.routes');
const LigasRoutes = require('./src/routes/ligas.routes');
const EquiposRoutes = require('./src/routes/equipos.routes');
const JornadasRoutes = require('./src/routes/jornadas.routes');
const PartidosRoutes = require('./src/routes/partidos.routes')

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(cors());

app.use('/api', UsuariosRutas, LigasRoutes, EquiposRoutes, JornadasRoutes, PartidosRoutes);

module.exports = app;