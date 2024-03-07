import { Schema, model } from "mongoose"

const FacturaSchema =Schema({
    fecha:{
        type: String,
        default: "0/0/0"
    },
    nit:{
         type:String,
        default: 'C/F'
    },
    carritoCompra: [{
        producto: {
            type: Schema.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidadProducto: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true  
        }
    }],
    usuario:{
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    estado:{
        type: Boolean,
        required: true
        
    }
})

export default model('factura',FacturaSchema)