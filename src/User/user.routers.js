'use strict'
import { Router } from "express"
import { actulizar, agregarUser, eliminar, login } from "./user.controller.js"
import { validateJwt } from "../middlewares/validate-jwt.js"

const api = Router()

api.post('/registrar',agregarUser)
api.post('/login',login)
api.put('/actualizarCuenta/:uid',[validateJwt],actulizar)
api.delete('/eliminarCuenta/:uid',[validateJwt],eliminar)


export default api