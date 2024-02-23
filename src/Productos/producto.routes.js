'use strict'
import  Express  from "express"
import { actulizarProducto, agregarProducto, eliminarProducto, listaNombre, listar, listarCategoria, test } from "./producto.controller.js"

const api  = Express.Router()

api.get('/testProducto',test)
api.get('/listarProducto',listar)
api.get('/listarPorCategoria/:id',listarCategoria)
api.post('/listarPorNombre',listaNombre)
api.post('/agregarProducto',agregarProducto)
api.put('/actulizarProducto/:id',actulizarProducto)
api.get('/eliminarProducto/:id',eliminarProducto)



export default api