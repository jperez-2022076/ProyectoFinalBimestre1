import {Schema,model} from "mongoose"

const productoSchema = Schema({
    nombreProducto:{
        type: String,
        required: true
    },
    descripcionProducto:{
        type:String,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    categoria:{
        type: Schema.ObjectId,
        ref: 'categoria',
        required: true
    },
    contador:{
        type: Number
        
    }

})

export default model('productos',productoSchema)