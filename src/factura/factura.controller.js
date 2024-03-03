'use strict'

import productoModel from "../Productos/producto.model.js"
import userModel from "../User/user.model.js"
import facturalModel from "./factural.model.js"

export const agregaCarrito = async(req,res)=>{
    try {
        let datos = req.body
        let {id} = req.user
        let fecha =  new Date()
        const opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',    
        }
        const fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFormato).format(fecha)
        datos.fecha = fechaFormateada
        let usuario = await userModel.findOne({_id: id})
        if(!usuario) return res.status(400).send({message: 'Usuario no encontrado'})
        datos.usuario = usuario._id
        let producto = await productoModel.findOneAndUpdate(
         {_id : datos.producto,estado: true},
         { $inc: { contador: 1 } }
        )
        if(!producto)return res.status(400).send({message: 'No se encontro el producto'})
        if(producto.stock <= 0 ){ 
            return  res.send({message: 'No tenemos el producto seleccionado en stock'})
         }
        else{
            if(datos.cantidadProducto > producto.stock){return  res.send({message: `No tenemos el suficiente stock del producto solo tenemos ${producto.stock} unidades`})}
        }
        datos.subtotal = datos.cantidadProducto * producto.precio
        if (Number.isInteger(datos.subtotal)) {
            datos.subtotal = datos.subtotal.toFixed(2)
        }
        datos.estado = true // true significa que todavia no a pagado 
        let factura = new facturalModel(datos)
        await factura.save()
        return res.send({message: `Se agrego al usuario ${usuario.nombre} el producto ${producto.nombreProducto} la cantidad de  ${datos.cantidadProducto}, el subtotal es Q.${datos.subtotal}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error al agregar al carrito'})
    }
}


export const factura = async (req, res) => {
    try {
        let { id } = req.user;
        let fecha =  new Date()
        const opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }
        const fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFormato).format(fecha)
        let facturas = await facturalModel.find({ usuario: id, estado: true })

        if (!facturas || facturas.length === 0) {
            return res.status(401).send({ message: 'Usuario no ha agregado nada nuevo al carrito' })
        }
        await facturalModel.updateMany({ usuario: id, estado: true }, { $set: { estado: false,fecha: fechaFormateada }})
        let totalFactura = 0
        let detallesFactura = []
       
        for (let factura of facturas) {
            let producto = await productoModel.findOne({ _id: factura.producto })
            if (!producto)return res.status(401).send({ message: 'Producto no encontrado' })
            await productoModel.findOneAndUpdate({ _id: factura.producto },{stock: producto.stock - factura.cantidadProducto})
            
            let productoStock =await productoModel.findOne({_id:factura.producto})
            if(productoStock.stock ===0) await productoModel.findOneAndUpdate({_id: factura.producto},{estado : false})
            let totalPorProducto = factura.cantidadProducto * producto.precio
            detallesFactura.push({
                nombreProducto: producto.nombreProducto,
                cantidad: factura.cantidadProducto,
                precio: producto.precio,
                subtotal: totalPorProducto.toFixed(2) // Redondear a dos decimales
            })
            totalFactura += totalPorProducto
        }
        return res.send({
            message: `${  fechaFormateada}`,
            factura: detallesFactura,
            total: totalFactura.toFixed(2) 
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener la factura' })
    }
}

export const FacturaAdmin = async(req,res)=>{
    try {
        let{id} = req.params
        let facturas = await facturalModel.find({usuario: id})
        let detallesFactura = []
       let totalFactura = 0
        for (let factura of facturas) {
            let producto = await productoModel.findOne({ _id: factura.producto })
            if (!producto)return res.status(401).send({ message: 'Producto no encontrado' })
            let totalPorProducto = factura.cantidadProducto * producto.precio
            detallesFactura.push({
                fecha: factura.fecha,
                nombreProducto: producto.nombreProducto,
                cantidad: factura.cantidadProducto,
                precio: producto.precio,
                subtotal: totalPorProducto.toFixed(2) 
            })
            totalFactura += totalPorProducto
        }
        return res.send({
            factura: detallesFactura,
            total: totalFactura.toFixed(2) 
        })
    } catch (err) {
        console.error(err)
        
    }
}

export const actualizarCarrito = async(req,res)=>{
    try {
        let {uid} = req.params
        let datos = req.body
        let {id} = req.user
        let facturaBuscar = await facturalModel.findOne({_id: uid})
        if(!facturaBuscar) return res.status(404).send({message: 'No se encontro la factura'})
        if(facturaBuscar.usuario ==  id){
            if ('fecha' in datos || 'usuario' in datos|| 'estado' in datos) {
                return res.status(400).send({ message: 'Hay datos que no se pueden actualizar' })
            }
            if ('cantidadProducto' in datos && 'producto' in datos) {
                // Obtener el producto actualizado (nuevo) desde la base de datos
                let productoActualizado = await productoModel.findOne({ _id: datos.producto })
                    datos.subtotal = productoActualizado.precio * datos.cantidadProducto
            } else if ('cantidadProducto' in datos) {
                let producto= await productoModel.findOne({_id: facturaBuscar.producto})
                // Si solo se proporciona la cantidad, calcular el subtotal basado en esa cantidad y el precio actual de la factura
                datos.subtotal = producto.precio * datos.cantidadProducto
            }
            let facturaActualizada = await facturalModel.findOneAndUpdate(
                {_id: uid},
                datos,
                {new: true}
                )
            if(!facturaActualizada)return res.status(403).send({message:'No se pudo actualizar'})
            return res.send({message: 'Actualizado',facturaActualizada})
        }
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error al actualizar la factura'})
    }
   
}

export const actualizarFacturaAdmin = async(req,res)=>{
    try {
        let {uid} = req.params
        let datos = req.body
        
        let facturaBuscar = await facturalModel.findOne({_id: uid})
        if(!facturaBuscar) return res.status(404).send({message: 'No se encontro la factura'})
       
            if ('fecha' in datos || 'usuario' in datos) {
                return res.status(400).send({ message: 'Hay datos que no se pueden actualizar' })
            }
            if ('cantidadProducto' in datos && 'producto' in datos) {
                // Obtener el producto actualizado (nuevo) desde la base de datos
                let productoActualizado = await productoModel.findOne({ _id: datos.producto })
                    datos.subtotal = productoActualizado.precio * datos.cantidadProducto
            } else if ('cantidadProducto' in datos) {
                let producto= await productoModel.findOne({_id: facturaBuscar.producto})
                // Si solo se proporciona la cantidad, calcular el subtotal basado en esa cantidad y el precio actual de la factura
                datos.subtotal = producto.precio * datos.cantidadProducto
            }
            let facturaActualizada = await facturalModel.findOneAndUpdate(
                {_id: uid},
                datos,
                {new: true}
                )
            if(!facturaActualizada)return res.status(403).send({message:'No se pudo actualizar'})
            return res.send({message: 'Actualizado',facturaActualizada})
        
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error al actualizar la factura'})
    }
   
}


