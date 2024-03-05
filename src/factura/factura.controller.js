'use strict'

import productoModel from "../Productos/producto.model.js"
import userModel from "../User/user.model.js"
import facturalModel from "./factural.model.js"


export const agregaCarrito = async (req, res) => {
    try {
        const { productoId, cantidadProducto, nit } = req.body
        const { id } = req.user
        const usuario = await userModel.findOne({ _id: id })
        if (!usuario) return res.status(400).send({ message: 'Usuario no encontrado' })
        const facturaExistente = await facturalModel.findOne({ usuario: usuario._id, estado: true })
        let factura
        const producto = await productoModel.findOneAndUpdate(
            { _id: productoId, estado: true },
            { $inc: { contador: 1 } }
        )
        if (facturaExistente) {
            const productoEnCarrito = facturaExistente.carritoCompra.find(item => item.producto.toString() === productoId)
            if (productoEnCarrito) {
                if (producto.stock <= 0) {
                    return res.send({ message: 'No tenemos el producto seleccionado en stock' })
                } else if (productoEnCarrito.cantidadProducto > producto.stock) {
                    return res.send({ message: `No tenemos suficiente stock del producto, solo tenemos ${producto.stock-productoEnCarrito.cantidadProducto} unidades` })
                }
                productoEnCarrito.cantidadProducto += +cantidadProducto
                productoEnCarrito.subtotal = productoEnCarrito.cantidadProducto * producto.precio
            } else {
                // Si el producto no está en el carrito, agrégalo
                if (producto.stock <= 0) {
                    return res.send({ message: 'No tenemos el producto seleccionado en stock' })
                } else if (cantidadProducto > producto.stock) {
                    return res.send({ message: `No tenemos suficiente stock del producto, solo tenemos ${producto.stock} unidades` })
                }

                const subtotal = cantidadProducto * producto.precio
                // Agrega el nuevo producto al carritoCompra
                facturaExistente.carritoCompra.push({
                    producto: productoId,
                    cantidadProducto: cantidadProducto,
                    subtotal: subtotal,
                    precioUnitario: producto.precio,
                })
            }

            await facturaExistente.save()
            factura = facturaExistente
        } else {
            // Si no existe una factura activa, crea una nueva
            const producto = await productoModel.findOneAndUpdate(
                { _id: productoId, estado: true },
                { $inc: { contador: 1 } }
            );

            if (!producto) return res.status(400).send({ message: 'No se encontró el producto' });

            if (producto.stock <= 0) {
                return res.send({ message: 'No tenemos el producto seleccionado en stock' });
            } else if (cantidadProducto > producto.stock) {
                return res.send({ message: `No tenemos suficiente stock del producto, solo tenemos ${producto.stock} unidades` })
            }
            const subtotal = cantidadProducto * producto.precio
            // Crea una nueva factura
            factura = new facturalModel({
                carritoCompra: [{
                    producto: productoId,
                    cantidadProducto: cantidadProducto,
                    subtotal: subtotal,
                    precioUnitario: producto.precio,
                }],
                nit: nit,
                usuario: usuario._id,
                estado: true, // true significa que todavía no ha pagado
            })
            await factura.save()
        }

        console.log("Factura agregada:", factura);

        return res.send({ message: `Se agregó al usuario ${usuario.nombre} el producto con una cantidad de ${cantidadProducto}, el subtotal es Q.${factura.carritoCompra[0].subtotal}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al agregar al carrito' });
    }
};



export const factura = async (req, res) => {
    try {
         let { id } = req.user;
       let fecha = new Date();
        const opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        const fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFormato).format(fecha);
        let facturas = await facturalModel.find({ usuario: id, estado: true });

        if (!facturas || facturas.length === 0) {
            return res.status(401).send({ message: 'Usuario no ha agregado nada nuevo al carrito' });
        }

        await facturalModel.updateMany({ usuario: id, estado: true }, { $set: { estado: false, fecha: fechaFormateada } });

        let detallesFactura = [];
        let totalFactura = 0;

        for (let factura of facturas) {
            for (let item of factura.carritoCompra) {
                let producto = await productoModel.findOne({ _id: item.producto });
                if (!producto) return res.status(401).send({ message: 'Producto no encontrado' });

                await productoModel.findOneAndUpdate({ _id: item.producto }, { stock: producto.stock - item.cantidadProducto });

                let productoStock = await productoModel.findOne({ _id: item.producto });
                if (productoStock.stock === 0) await productoModel.findOneAndUpdate({ _id: item.producto }, { estado: false });

                let totalPorProducto = item.subtotal;
                totalFactura += +totalPorProducto.toFixed(2);

                // Agregar información del producto al array de detalles
                detallesFactura.push({
                    productoId: producto._id,
                    nombreProducto: producto.nombreProducto,
                    precio: producto.precio,
                    cantidadProducto: item.cantidadProducto,
                    subtotal: item.subtotal.toFixed(2),
                });
            }
        }

        return res.send({
            message: `${fechaFormateada}`,
            detallesFactura: detallesFactura,
            total: totalFactura.toFixed(2),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener la factura' });
    }
};


export const FacturaAdmin = async(req,res)=>{
    try {
        let{id} = req.params
        let fecha = new Date();
        const opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        const fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFormato).format(fecha);
        let facturas = await facturalModel.find({ usuario:id });
        let detallesFactura = [];
        let totalFactura = 0;
        for (let factura of facturas) {
            for (let item of factura.carritoCompra) {
                let producto = await productoModel.findOne({ _id: item.producto });
                if (!producto) return res.status(401).send({ message: 'Producto no encontrado' });
                let totalPorProducto = item.subtotal;
                totalFactura += +totalPorProducto.toFixed(2);

                // Agregar información del producto al array de detalles
                detallesFactura.push({
                    productoId: producto._id,
                    nombreProducto: producto.nombreProducto,
                    precio: producto.precio,
                    cantidadProducto: item.cantidadProducto,
                    subtotal: item.subtotal.toFixed(2),
                });
            }
        }
        return res.send({
            message: `${fechaFormateada}`,
            detallesFactura: detallesFactura,
            total: totalFactura
        })
    } catch (err) {
        console.error(err)
        
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


