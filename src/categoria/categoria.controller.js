'use strict'
import productoModelo from '../Productos/producto.model.js'
import categoriaModelo from './categorias.model.js'
export const test = (req,res)=>{
    return res.send('Hello Word')
}

export const agregarCategoria = async(req,res)=>{
    try {
        let datos = req.body
        let categoria = new categoriaModelo(datos)
        await categoria.save()
        return res.send({message: 'Se agrego exitosamente ',categoria})
        
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No se pudo agregar Categoria'})
    }
}
export const listarCategoria = async(req,res)=>{
    try {
        let categoria  = await categoriaModelo.find()
        if(categoria.length === 0) return res.status(400).send({message: 'No funciono'})
        return res.send({categoria})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'No hay categorias existentes'})
    }
}

export const actulizarCategoria = async(req,res)=>{
    try {
        let {id} = req.params
        let datos = req.body
        let actulizarCategoria = await categoriaModelo.findOneAndUpdate(
            {_id: id},
            datos,
            {new: true}

        )
        if(!actulizarCategoria)return res.status(401).send({message: 'No se pudieron actulizar los datos'})
        return res.send({message:'Actualizado',actulizarCategoria})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message:'Error al actulizar'})
    }
}

export const eliminarCategoria = async (req, res) => {
    try {
        let { id } = req.params
        let eliminarCategoria = await categoriaModelo.findOneAndDelete({ _id: id })
        if (!eliminarCategoria) return res.status(404).send({ message: 'No se encontró la categoría y no se eliminó' })
        await porDefecto(id, res)
        return res.send({ message: `La categoría ${eliminarCategoria.categoria} fue eliminada` })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al eliminar' })
    }
}
export const porDefecto = async (id, res) => {
    try {
        let productos = await productoModelo.find({ categoria: id })
        if (!productos || productos.length === 0) return res.status(400).send({ message: 'Se elimino Exitosamente la categoria no tenia ningun producto agregado' })
        let categoriaPorDefecto = await categoriaModelo.findOne({ categoria: 'Por_Defecto' })
        if (!categoriaPorDefecto)return res.status(400).send({ message: 'No se encontró la categoría por Defecto' })
        await productoModelo.updateMany({ categoria: id }, { categoria: categoriaPorDefecto._id })
        return res.send({ message: 'Productos actualizados a la categoría por defecto' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error al realizar la operación por defecto' });
    }
}


export const agregarPorDefecto = async()=>{
    try {
        let buscarCategoria = await categoriaModelo.findOne({ categoria: 'Por_Defecto' })
        if (!buscarCategoria) {
            let datos = {
                categoria: 'Por_Defecto',
                descripcion: 'Por defecto no tiene categoria'
            }
            let categoria = new categoriaModelo(datos)
            await categoria.save()
            return console.log('Se acaba de agregar categoria Por Defecto')
        } 
        return console.log('Ya se creo el Por Defecto')   
    } catch (err) {  
    }
}