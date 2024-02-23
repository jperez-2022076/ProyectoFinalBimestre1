'use strict'
import mongoose from "mongoose"

export const connect = async()=>{
    try {
        mongoose.connection.on('error',()=>{
            console.log('No se pudo conectar mongodb')

        })
        return await mongoose.connect('mongodb://127.0.0.1:27017/ProyectoBimestral2022076')
    } catch (err) {
        console.error('Fallo la conexion',err)
        
    }
}