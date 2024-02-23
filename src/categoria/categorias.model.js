import mongoose from "mongoose"

const CategoriaSchema = mongoose.Schema({
    categoria:{
        type:String,
        required: true
    },
    descripcion:{
        type: String,
        required: true
    }
})


export default mongoose.model('categoria',CategoriaSchema)