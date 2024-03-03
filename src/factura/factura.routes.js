'use strict'
import { Router } from "express"
import {  actualizarCarrito, actualizarFacturaAdmin, agregaCarrito, factura,FacturaAdmin } from "./factura.controller.js"
import { admin, validateJwt } from "../middlewares/validate-jwt.js"

const api = Router()

api.post('/agregarCarrito',[validateJwt],agregaCarrito)
api.get('/factura',[validateJwt],factura)
api.get('/FacturaAdmin/:id',[validateJwt,admin],FacturaAdmin)
api.put('/ActualizarFacturaAdmin/:uid',actualizarFacturaAdmin)
api.put('/ActualizarCarrito/:uid',[validateJwt],actualizarCarrito)

export default api