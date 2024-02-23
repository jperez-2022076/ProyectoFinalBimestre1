'use strict'
import { Router } from "express"
import { agregaCarrito, factura } from "./factura.controller.js"

const api = Router()

api.post('/agregarCarrito',agregaCarrito)
api.get('/factura/:id',factura)

export default api