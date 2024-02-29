'use strict'

import  Express  from "express"
import { actulizarCategoria, porDefecto,agregarCategoria, eliminarCategoria, listarCategoria, test } from "./categoria.controller.js"
import { admin, validateJwt } from "../middlewares/validate-jwt.js"

const api = Express.Router()


api.get('/test', test)
api.get('/listarCategoria',[validateJwt],listarCategoria)
api.post('/agregarCategorias',[validateJwt, admin],agregarCategoria)
api.put('/actualizarCategoria/:id',[validateJwt,admin],actulizarCategoria)
api.delete('/eliminarCategoria/:id',[validateJwt,admin],eliminarCategoria)
export default api