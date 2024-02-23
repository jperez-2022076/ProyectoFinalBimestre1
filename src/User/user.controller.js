'use strict'

import productoModel from '../Productos/producto.model.js'
import facturalModel from '../factura/factural.model.js'
import { encriptar, verificarActualizacion, verificarContraseña } from '../utils/validator.js'
import userModel from './user.model.js'

export const agregarUser = async(req,res)=>{
    try {
        let datos = req.body
        datos.contraseña = await encriptar(datos.contraseña)
        datos.rol = 'CLIENTE'
        let user = new userModel(datos)
        await user.save()
        return res.send({message: `Registrado ${user.rol} ${user.nombre} ` })
    } catch (err) {
       console.error(err)
       return res.status(500).send({message:'Error al agregar Usuario'}) 
    }
}


export const login = async(req,res)=>{
    try {
        let { usuario,contraseña} = req.body
        let user = await userModel.findOne({ usuario})
        
        let facturas = await facturalModel.find({ usuario: user.id, estado: false })
        let totalFactura = 0
        let detallesFactura = []
        for (let factura of facturas) {
            let producto = await productoModel.findOne({ _id: factura.producto })
            if (!producto) return res.status(401).send({ message: 'Producto no encontrado' })
            let totalPorProducto = factura.cantidadProducto * producto.precio;
            detallesFactura.push({
                nombreProducto: producto.nombreProducto,
                cantidad: factura.cantidadProducto,
                precio: producto.precio,
                subtotal: totalPorProducto.toFixed(2) // Redondear a dos decimales
            })
            totalFactura += totalPorProducto;
        }
        if(user && await verificarContraseña(contraseña, user.contraseña)){
            let usuarioLogeado = {
                usuario : user.usuario,
                nombre : user.nombre,
                rol : user.rol,
               
            }
           
            return  res.send({message: `Bienvenido ${user.nombre} `,usuarioLogeado,detallesFactura,totalFactura })
        }
        return res.status(404).send({message: 'Contraseña o usuario incorrectos'})
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Fallo al iniciar sesion'})
    }
}

export const actulizar = async(req,res)=>{
    try {
        let {id} = req.params
        let datos = req.body
        let actualizar = verificarActualizacion(datos,id)
        if(!actualizar)return res.status(400).send({message: 'Hay datos que no se pueden actualizar'})
        let actualizarDatos = await userModel.findOneAndUpdate(
            {_id : id},
            datos,
            {new: true}
            )
            if(!actualizarDatos) return res.status(401).send({message: 'Usuario no se puedo actulizar'})
            return res.send({message: 'Actualizado',actualizarDatos})
    } catch (err) {
        console.error(err)
        if(err.keyValue.usuario) return res.status(400).send({message:`Ya existe el usuario ${err.keyValue.usuario} `})
        return res.status(500).send({message:'Error al actualizar'})
        
    }
}

export const eliminar = async(req,res)=>{
    try {
        let {id} = req.params
        let eliminarUsuario = await userModel.findOneAndDelete({_id:id})
        if(!eliminarUsuario) return res.status(404).send({message: 'No se encontro el usuario y no se pudo eliminar'})
        return  res.send({message: `Se elimino el usuario ${eliminarUsuario.usuario} exitosamente`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al eliminarlo '})
        
    }

}