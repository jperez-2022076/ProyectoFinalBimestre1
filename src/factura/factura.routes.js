'use strict'
import { Router } from "express"
import {   actualizarFacturaAdmin, agregaCarrito, eliminarCarrito, factura,FacturaAdmin } from "./factura.controller.js"
import { admin, validateJwt } from "../middlewares/validate-jwt.js"

const api = Router()

api.post('/agregarCarrito',[validateJwt],agregaCarrito)
api.post('/factura',[validateJwt],factura)
api.put('/actualizarCarrito/:uid',[validateJwt],actualizarFacturaAdmin)
api.get('/FacturaAdmin/:id',[validateJwt,admin],FacturaAdmin)
api.put('/ActualizarFacturaAdmin/:uid',[validateJwt,admin],actualizarFacturaAdmin)
api.delete('/eliminarCarrito/:id',eliminarCarrito)

export default api