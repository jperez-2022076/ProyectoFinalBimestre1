'use strict'
import { Router } from "express"
import {   actualizarFacturaAdmin, agregaCarrito, factura,FacturaAdmin } from "./factura.controller.js"
import { admin, validateJwt } from "../middlewares/validate-jwt.js"

const api = Router()

api.post('/agregarCarrito',[validateJwt],agregaCarrito)
api.get('/factura',[validateJwt],factura)
api.get('/FacturaAdmin/:id',[validateJwt,admin],FacturaAdmin)
api.put('/ActualizarFacturaAdmin/:uid',actualizarFacturaAdmin)

export default api