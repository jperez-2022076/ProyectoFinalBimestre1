'use strict'
import  Express  from "express"
import { actulizarProducto, agregarProducto, eliminarProducto, listaNombre, listar, listarCategoria, listarProductosAgotados, listarProductosPorContador, test } from "./producto.controller.js"
import { admin, validateJwt } from "../middlewares/validate-jwt.js"

const api  = Express.Router()
//todos
api.get('/testProducto',test)
api.get('/listarProducto',[validateJwt],listar)
api.get('/listarPorCategoria/:id',[validateJwt],listarCategoria)
api.get('/listarPorCompra',[validateJwt],listarProductosPorContador)
api.post('/listarPorNombre',[validateJwt],listaNombre)
api.get('/listadoPorMasComprado',[validateJwt],listarProductosPorContador)
// admin
api.get('/listarProductosAgotados',[validateJwt,admin],listarProductosAgotados)
api.post('/agregarProducto',[validateJwt,admin],agregarProducto)
api.put('/actulizarProducto/:id',[validateJwt,admin],actulizarProducto)
api.get('/eliminarProducto/:id',[validateJwt,admin],eliminarProducto)



export default api