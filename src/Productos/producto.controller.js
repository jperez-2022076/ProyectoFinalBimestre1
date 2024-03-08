'use string'
import categoriasModel from "../categoria/categorias.model.js"
import productoModel from "./producto.model.js"

export const test = (req,res)=>{
    return res.send('Hello Word')
}

export const agregarProducto = async(req,res)=>{
    try {
        let datos = req.body
        let categoria = await categoriasModel.findOne({_id: datos.categoria} )
        if(!categoria) return res.status(400).send({message:'No se encontro la categoria'})
        let producto = new productoModel(datos)
        await producto.save()
        return res.send({message: `Se pudo agregar exitosamente el producto ${producto.nombreProducto} a la categoria ${categoria.categoria}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No se pudo agregar Nuevo Producto'})

    }
}

export const listar =async(req,res)=>{
    try {
        let producto = await productoModel.find({estado: true}).populate('categoria',['categoria','descripcion'])
        if(producto.length === 0) return res.status(400).send({message: 'No funciono'})
        return res.send({producto})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No hay productos'})
        
    }
}

export const listaNombre = async(req,res)=>{
    try {
        let {nombreProducto} = req.body
        let producto = await productoModel.find(({nombreProducto: new RegExp(nombreProducto, 'i'), estado: true})).populate('categoria',['categoria','descripcion'])
        if(!producto || producto.estado === false)return res.status(404).send({message: 'Ningun producto tiene este nombre'})
        return res.send({message:'Producto encontrado',producto})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al listar por nombre'})
    }
}

export const listarCategoria = async(req,res)=>{
    try {
        let {id} = req.params
        let producto = await productoModel.findOne({categoria: id},{estado: true})
        if(!producto || producto.estado === false)return res.status(404).send({message: 'Ningun producto tiene este nombre'})
        let productoEncontrado = await productoModel.findOne({_id: producto._id}).populate('categoria',['categoria','descripcion'])
        return res.send({message:'Producto encontrado',productoEncontrado})
     } catch (err) {
        console.error(err)
        return res.status(500).send({message:'No se encontro Productos'})
        
    }
}
export const listarProductosAgotados = async (req,res)=>{
    try {
        let producto = await productoModel.find({stock: 0})
        if(producto.length === 0 ||!producto )return res.status(404).send({message: 'No hay productos agotados'})
        return res.send({producto})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al listar prodcutos ya agotados'})
    }
}

export const listarProductosPorContador = async (req, res) => {
    try {
        const productos = await productoModel.find().sort({ contador: -1 })
        if (!productos || productos.length === 0) return res.status(404).send({ message: 'No hay productos disponibles' })
        return res.send({ productos })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al obtener la lista de productos' })
    }
}


export const actulizarProducto = async(req,res)=>{
           try {
            let {id}= req.params
            let datos = req.body
            let actulizarProducto = await productoModel.findOneAndUpdate(
                {_id: id},
                datos,
                {new: true}
            )
            if(!actulizarProducto) return res.status(401).send({message: 'No se pudo actulizar'})
            return res.send({message: 'Se actulizo', actulizarProducto})        
        } catch (err) {
            console.error(err)
            return res.status(500).send({message: 'Error al actualizar'})
        }
}

export const eliminarProducto = async(req,res)=>{
    try {
        let {id} = req.params
        let eliminarProducto = await productoModel.findOneAndUpdate({_id: id},{estado: false})
        if(eliminarProducto.estado === false) return res.send({message: 'Producto ya eliminado '})
        if(!eliminarProducto) return res.status(404).send({message: 'No se encotro el Producto y no se pudo eliminar' })
        return res.send({message: `Producto ${eliminarProducto.nombreProducto} se elimino exitosamente`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al eliminarlo'})
        
    }
}

