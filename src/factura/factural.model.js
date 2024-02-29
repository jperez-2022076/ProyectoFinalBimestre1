import { Schema, model } from "mongoose"

const FacturaSchema =Schema({
    fecha:{
        type: String,
        immutable: true  
    },
    producto:{
        type: Schema.ObjectId,
        ref: 'productos',
        required: true
    },
    cantidadProducto:{
        type:Number,
        required: true
    },

    subtotal:{
        type: Number,
    },
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