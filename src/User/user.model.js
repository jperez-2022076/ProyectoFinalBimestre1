import { Schema, model } from "mongoose"

const UserSchema = Schema({
    nombre:{
        type:String,
        required: true
    },
    apellido:{
        type: String,
        required: true
    },
    usuario:{
        type:String,
        unique: true,
        lowerCase: true,
        required: true
    },
    contraseña:{
        type:String,
        minLength: [8,'contraseña muy pequeña'],
        required: true
    },
    telefono:{
        type:String,
        minLength:8,
        required: true
    },
    rol:{
        type:String,
        uppercase: true,
        enum:['CLIENTE','ADMIN'],
        required :true
    }
})

export default model('User',UserSchema)