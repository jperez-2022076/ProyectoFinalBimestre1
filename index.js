import { initServer } from './configs/app.js'
import { connect } from './configs/mongo.js'
import { DefectoAdmin } from './src/User/user.controller.js'
import { agregarPorDefecto } from './src/categoria/categoria.controller.js'
initServer()
connect()
agregarPorDefecto()
DefectoAdmin()