'use strict'

import  Jwt  from "jsonwebtoken"
const secretKey = '@LlaveSuperSecretaDe2022076@'

export const generarJwt = async(payload)=>{
    try {
        return Jwt.sign(payload,secretKey,{
            expiresIn: '4h',
            algorithm: 'HS256'
        })
    } catch (err) {
        console.error(err)
        return err
    }
}