'use strict'

import productoModel from "../Productos/producto.model.js"
import userModel from "../User/user.model.js"
import facturalModel from "./factural.model.js"

export const agregaCarrito = async(req,res)=>{
    try {
        let datos = req.body
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
        let usuario = await userModel.findOne({_id: datos.usuario})
        if(!usuario) return res.status(400).send({message: 'Usuario no encontrado'})
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
        let { id } = req.params;
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
        return res.status(500).send({ message: 'Error al obtener la factura' });
    }
};
