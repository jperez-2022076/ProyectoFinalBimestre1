import  Express  from "express"
import cors from 'cors'
import helmet from "helmet"
import morgan from "morgan"
import { config } from 'dotenv'
import categoriaRouter from '../src/categoria/categoria.routers.js'
import productoRouter from '../src/Productos/producto.routes.js'
import facturaRouter  from '../src/factura/factura.routes.js'
import userRouter from '../src/User/user.routers.js'

const app = Express()
config()
const port = process.env.PORT  || 3000

app.use(Express.urlencoded({extended: false}))
app.use(Express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

app.use(categoriaRouter)
app.use(productoRouter)
app.use(facturaRouter)
app.use(userRouter)

export const initServer = ()=>{
    app.listen(port)
    console.log(`HTTP esta en el puerto ${port}`)
}