'use strict'
import  Jwt  from "jsonwebtoken"
import userModel from "../User/user.model.js"

export const validateJwt =async(req,res,next)=>{
    try {
        let secretKey = process.env.SECRET_KEY 
        console.log(secretKey)
        let {token} = req.headers
        if(!token) return res.status(401).send({message:'No autorizado'})
        let {uid} = Jwt.verify(token,secretKey)
        let user = await userModel.findOne({_id:uid})
        if(!user) return res.status(404).send({message: 'Usuario no encontrado - No autorizado'})
        req.user = user
        next()

    } catch (err) {
        console.error(err)
        return res.status(401).send({message:'Token invalido o esta expirado'})
        
    }
}

export const admin = async(req,res,next)=>{
    try {
        let {rol,usuario} = req.user
        if(!rol || rol !== 'ADMIN') return res.status(403).send({message: `El usuario ${usuario} no tiene acceso a esta función`})
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).send({message: 'Tu no eres Admin'})
        
    }
}
