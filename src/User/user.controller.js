'use strict'

import productoModel from '../Productos/producto.model.js'
import facturalModel from '../factura/factural.model.js'
import { generarJwt } from '../utils/jwt.js'
import { encriptar, verificarActualizacion, verificarContraseña } from '../utils/validator.js'
import userModel from './user.model.js'
import moment from 'moment';

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


export const login = async (req, res) => {
    try {
        let { email, usuario, contraseña } = req.body
        let user = await userModel.findOne({
            $or: [
                { usuario: usuario },
                { email: email }
            ]
        })
        let facturas = await facturalModel.find({ usuario: user.id, estado: false })
        let totalFactura = 0
        let facturasPorFecha = {}
        for (let factura of facturas) {
            let producto = await productoModel.findOne({ _id: factura.producto })
            if (!producto) return res.status(401).send({ message: 'Producto no encontrado' })
            let totalPorProducto = factura.cantidadProducto * producto.precio
            // Obtener la fecha de la factura y formatearla
            const fechaFactura = moment(factura.fecha, 'DD/MM/YYYY, HH:mm:ss')
            const fechaFormateada = fechaFactura.format('DD-MM-YYYY')
            // Organizar las facturas por fecha
            if (!facturasPorFecha[fechaFormateada]) {
                facturasPorFecha[fechaFormateada] = {
                    detalles: [],
                    total: 0
                }
            }
            facturasPorFecha[fechaFormateada].detalles.push({
                nombreProducto: producto.nombreProducto,
                cantidad: factura.cantidadProducto,
                precio: producto.precio,
                subtotal: totalPorProducto.toFixed(2) // Redondear a dos decimales
            })
            facturasPorFecha[fechaFormateada].total += totalPorProducto;
            totalFactura += totalPorProducto;
        }
        if (user && await verificarContraseña(contraseña, user.contraseña)) {
            let usuarioLogeado = {
                uid: user._id,
                usuario: user.usuario,
                nombre: user.nombre,
                rol: user.rol,
            }
            let token = await generarJwt(usuarioLogeado)
            return res.send({
                message: `Bienvenido ${user.nombre} `,
                usuarioLogeado,
                token,
                facturasPorFecha
            })
        }
        return res.status(404).send({ message: 'Contraseña o usuario incorrectos' })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Fallo al iniciar sesión' })
    }
}



export const actulizar = async(req,res)=>{
    try {
        let{rol,id} = req.user
        let {uid} = req.params
        let datos = req.body
        if(rol === 'ADMIN'){
            let actualizarDatos = await userModel.findOneAndUpdate(
                {_id : uid},
                datos,
                {new: true}
                )
                if(!actualizarDatos) return res.status(401).send({message: 'Usuario no se puedo actulizar'})
                return res.send({message: 'Actualizado',actualizarDatos})
        }
            if(rol === 'CLIENTE'){
                if(id === uid){

                    let actualizar = verificarActualizacion(datos,id)
                      if(!actualizar)return res.status(400).send({message: 'Hay datos que no se pueden actualizar'})
                    let actualizarDatos = await userModel.findOneAndUpdate(
                        {_id : uid},
                        datos,
                        {new: true}
                        )
                        if(!actualizarDatos) return res.status(401).send({message: 'Usuario no se puedo actulizar'})
                        return res.send({message: 'Actualizado',actualizarDatos})
                }else{
                    return res.status(400).send({message: 'No tienes permiso de actualizar otra cuenta que no sea la tuya '})
                }
               
            }
        
        
    } catch (err) {
        console.error(err)
        if(err.keyValue.usuario) return res.status(400).send({message:`Ya existe el usuario ${err.keyValue.usuario} `})
        return res.status(500).send({message:'Error al actualizar'})
        
    }
}

export const eliminar = async(req,res)=>{
    try {
        let{rol,id} = req.user
       
        let {uid} = req.params
        console.log(id)
        console.log(uid)
        if(rol ==='ADMIN') {
            let eliminarUsuario = await userModel.findOneAndDelete({_id:uid})
            return  res.send({message: `Se elimino el usuario ${eliminarUsuario.usuario} exitosamente`})}
        if(rol ==='CLIENTE'){

            if(uid === id){
                let eliminarUsuario = await userModel.findOneAndDelete({_id:uid})
                return  res.send({message: `Se elimino el usuario ${eliminarUsuario.usuario} exitosamente`})
            }else{
                return res.status(400).send({message:'No puedes eliminar una cuenta que no es tuya'})
            }
        }
            
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al eliminarlo '})
        
    }

}

export const DefectoAdmin = async()=>{
    try {
        let buscarUser = await userModel.findOne({usuario: 'Jnoj'})
        if(!buscarUser){
            let datos = {
                nombre: 'Josue',
                apellido: 'Noj',
                email: 'josueNoj@gmail.com',
                usuario: 'Jnoj',
                contraseña: await encriptar('12345678'),
                telefono: '12345678',
                rol: 'ADMIN'
            }
            let user = new userModel(datos)
            await user.save()
            return console.log('Se caba de agregar el usuario Jnoj su rol es ADMIN su contraseña es 12345678')
        }
        return console.log('Ya esta creado el usuario Jnoj su rol es ADMIN su contraseña es 12345678')
    } catch (err) {
    }
}