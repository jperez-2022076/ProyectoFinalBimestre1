'use strict'

import productoModel from "../Productos/producto.model.js"
import userModel from "../User/user.model.js"
import facturalModel from "./factural.model.js"
import PDFDocument from 'pdfkit'
import url from 'url'
import fs from 'fs'
import path from 'path'



export const agregaCarrito = async (req, res) => {
    try {
        const { productoId, cantidadProducto } = req.body
        const { id } = req.user
        const usuario = await userModel.findOne({ _id: id })
        if (!usuario) return res.status(400).send({ message: 'Usuario no encontrado' })
     
        const facturaExistente = await facturalModel.findOne({ usuario: usuario._id, estado: true })
        let factura
        const producto = await productoModel.findOne( { _id: productoId, estado: true },)
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
          
            if (!producto) return res.status(400).send({ message: 'No se encontró el producto' })
            if (producto.stock <= 0) {
                return res.send({ message: 'No tenemos el producto seleccionado en stock' })
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
                
                usuario: usuario._id,
                estado: true, // true significa que todavía no ha pagado
            })
            await factura.save()
        }
        return res.send({ message: `Se agregó al usuario ${usuario.nombre} el producto con una cantidad de ${cantidadProducto}, el subtotal es Q.${factura.carritoCompra[0].subtotal}` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al agregar al carrito' })
    }
}



export const factura = async (req, res) => {
    try {
        let {nit} =req.body
         let { id,usuario,nombre } = req.user
       let fecha = new Date()
        const opcionesFormato = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }
        const fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFormato).format(fecha)
        let facturasA =await facturalModel.updateMany({ usuario: id, estado: true }, { $set: { fecha: fechaFormateada,nit: nit } })
        let facturas = await facturalModel.find({ usuario: id, estado: true })
        await facturalModel.updateMany({ usuario: id, estado: true }, { $set: { estado: false } })

        if (!facturas || facturas.length === 0) return res.status(401).send({ message: 'Usuario no ha agregado nada nuevo al carrito' })
       
        let detallesFactura = []
        let totalFactura = 0
        for (let factura of facturas) {
            for (let item of factura.carritoCompra) {
                let producto = await productoModel.findOne({ _id: item.producto })
                const productoContador = await productoModel.findOneAndUpdate(
                    { _id: producto._id, estado: true },
                    { $inc: { contador: 1 } }
                )
                if (!producto) return res.status(401).send({ message: 'Producto no encontrado' })
                let productoStock = await productoModel.findOne({ _id: item.producto })
                await productoModel.findOneAndUpdate({ _id: item.producto },productoStock.stock = productoStock.stock-item.cantidadProducto)
                await productoStock.save()
                if (productoStock.stock === 0) await productoModel.findOneAndUpdate({ _id: item.producto }, { estado: false })
                let totalPorProducto = item.subtotal
                totalFactura += +totalPorProducto.toFixed(2)
                // Agregar información del producto al array de detalles
                detallesFactura.push({
                    productoId: producto._id,
                    nombreProducto: producto.nombreProducto,
                    precio: producto.precio,
                    cantidadProducto: item.cantidadProducto,
                    subtotal: item.subtotal.toFixed(2),
                })
            }
        }
        const fechaFormateadaParaArchivo = fechaFormateada.replace(/[\/:]/g, '_'); // Reemplaza '/' y ':' con '_'
        const directorioActual = path.dirname(url.fileURLToPath(import.meta.url))
        const nombreArchivo = `Factura-${usuario} ${fechaFormateadaParaArchivo}.pdf`
        const rutaCompleta = path.join(directorioActual, nombreArchivo)
        // Ruta completa donde se guardará el archivo PDF físicamente
        const filePath = path.resolve(rutaCompleta)
         // Crear un nuevo documento PDF
         const doc = new PDFDocument()
         // Configurar el nombre del archivo PDF
         res.setHeader('Content-Disposition', `inline; filename=Factura-${fechaFormateada}.pdf`)
         // Establecer el tipo de contenido
         res.setHeader('Content-Type', 'application/pdf')
 
         // Escribir contenido en el documento PDF
         doc.pipe(res)
         doc.fontSize(14).text(`Factura - ${fechaFormateada}`, { align: 'center' })
         doc.moveDown()
         doc.moveDown()
         doc.fontSize(13).text(`Nombre  del usuario: ${nombre}`)
         const nitFactura = facturas.length > 0 ? facturas[0].nit : 'N/A'
         doc.fontSize(12).text(`NIT: ${nitFactura}`)
         doc.moveDown()
         doc.fontSize(12).text(`___________________________________________________________________`)
        
 
         detallesFactura.forEach((detalle, index) => {
            doc.moveDown()
            doc.fontSize(12).text(`Producto: ${detalle.nombreProducto}`)
            doc.fontSize(12).text(`Precio:  Q.${detalle.precio} `)
            doc.fontSize(12).text(`Cantidad:  ${detalle.cantidadProducto}  `)
            doc.fontSize(12).text(`SubTotal: Q${detalle.subtotal}`, { align: 'right' })
            doc.moveDown()
             if (index < detallesFactura.length - 1) {
                doc.fontSize(12).text(`___________________________________________________________________`)
             }
         })
         
      
         doc.moveDown()
         doc.fontSize(12).text(`-------------------------------------------------------------------------------------------------------------------`)
         doc.moveDown()
         doc.fontSize(14).text(`Total: ${totalFactura.toFixed(2)}`, { align: 'right' })
 
         // Finalizar el documento PDF
         doc.end()
         const directoryPath = path.dirname(filePath)
         if (!fs.existsSync(directoryPath)) {
             fs.mkdirSync(directoryPath, { recursive: true })
         }

         doc.pipe(fs.createWriteStream(filePath))
         console.log('Ya esta el pdf en la carpeta factura en el proyecto')
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error al obtener la factura' })
    }
}


export const FacturaAdmin = async(req,res)=>{
    try {
        let{id} = req.params
        let facturas = await facturalModel.find({ usuario:id })
        let detallesFactura = []
        let totalFactura = 0
        for (let factura of facturas) {
            for (let item of factura.carritoCompra) {
                let producto = await productoModel.findOne({ _id: item.producto })
                if (!producto) return res.status(401).send({ message: 'Producto no encontrado' })
                let totalPorProducto = item.subtotal;
                totalFactura += +totalPorProducto.toFixed(2)
                // Agregar información del producto al array de detalles
                detallesFactura.push({
                    fecha: factura.fecha,
                    nit: factura.nit,
                    productoId: producto._id,
                    nombreProducto: producto.nombreProducto,
                    precio: producto.precio,
                    cantidadProducto: item.cantidadProducto,
                    subtotal: item.subtotal.toFixed(2),
                })
            }
        }
        return res.send({
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
        const factura = await facturalModel.findOne({_id:uid})
        if(!factura)return res.status(404).send({message:'Factura no encontrada'})
        if ('cantidadProducto' in datos && 'producto' in datos ) {
            const itemEnFactura = factura.carritoCompra.find(item => item.producto.toString() === datos.producto)
            if (itemEnFactura) {
                if (itemEnFactura.cantidadProducto > datos.cantidadProducto) {
                    const producto = await productoModel.findOne({ _id: datos.producto })
                    const cantidad = itemEnFactura.cantidadProducto - datos.cantidadProducto
                    if (producto.stock <= 0) {
                        return res.send({ message: 'No tenemos el producto seleccionado en stock' })
                    } else if (datos.cantidadProducto > producto.stock) {
                        return res.send({ message: `No tenemos suficiente stock del producto, solo tenemos ${producto.stock} unidades` })
                    }
                    // Restar cantidad al stock en la base de datos
                    itemEnFactura.cantidadProducto = datos.cantidadProducto
                    itemEnFactura.subtotal = datos.cantidadProducto*producto.precio
                    console.log(itemEnFactura.subtotal)
                    producto.stock += cantidad
                    await factura.save()
                    await producto.save()
                } else if (itemEnFactura.cantidadProducto < datos.cantidadProducto) {
                    const producto = await productoModel.findOne({ _id: datos.producto })
                    const cantidad = datos.cantidadProducto - itemEnFactura.cantidadProducto
                    if (producto.stock <= 0) {
                        return res.send({ message: 'No tenemos el producto seleccionado en stock' })
                    } else if (datos.cantidadProducto > producto.stock) {
                        return res.send({ message: `No tenemos suficiente stock del producto, solo tenemos ${producto.stock} unidades` })
                    }
                    // Sumar cantidad al stock en la base de datos
                    itemEnFactura.subtotal = datos.cantidadProducto*producto.precio
                    console.log(itemEnFactura.subtotal)
                    producto.stock -= cantidad
                    itemEnFactura.cantidadProducto = datos.cantidadProducto
                    await factura.save()
                    await producto.save()
                }
            }
        }
        if( 'nit' in datos || 'fecha' in datos ){ 
            console.log(datos)
            let facturaActualizada = await facturalModel.findOneAndUpdate({_id: uid},
                datos,
                {new:true})
                if(!facturaActualizada) return res.status(404).send({message: 'No se puedo actualizar los datos de la tarjeta'})
                return res.send({message:'Se actulizo perfectamente la factura',facturaActualizada})
         }
         return res.send({message:'Se actulizo perfectamente la factura',factura})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'Error al actualizar la factura'})
    }
   
}


