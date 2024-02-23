import { compare, hash } from "bcrypt";

export const encriptar = async(contraseña)=>{
    try {
        return await hash(contraseña,10)
    } catch (err) {
        return err
        
    }
}

export const verificarContraseña = async(contraseña,hash)=>{
    try {
        return await compare(contraseña,hash)
    } catch (err) {
        return err
        
    }
}


export const verificarActualizacion =(datos,userId)=>{
    if(userId){
        if(
            Object.entries(datos).length === 0 ||
            datos.contraseña  ||
            datos.contraseña == ''||
            datos.rol  ||
            datos.rol == ''
        )return false
        return true
    }
        
}