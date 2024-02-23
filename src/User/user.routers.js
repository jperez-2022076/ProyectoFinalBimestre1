'use strict'
import { Router } from "express"
import { actulizar, agregarUser, eliminar, login } from "./user.controller.js"

const api = Router()

api.post('/registrar',agregarUser)
api.post('/login',login)
api.put('/actualizarCuenta/:id',actulizar)
api.delete('/eliminarCuenta/:id',eliminar)


export default api