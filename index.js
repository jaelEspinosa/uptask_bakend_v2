// const express = require ("express")


// al añadir "type":"module" en el package.json,
// se puede utilizar la sintaxis de EMS6
import cors from 'cors'
import express  from "express"
import dotenv from "dotenv"
import conectarDB from "./config/db.js"
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express()

app.use(express.json());

dotenv.config()

conectarDB()

// configurar CORS // 

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin : function (origin, callback){
        if(whitelist.includes(origin)){
            // Puede consultar la API
            callback(null, true);
        }else{
            // No esta permitido
            callback(new Error("Error de Cors"))
        }
    },

};

app.use(cors(corsOptions))

// asi lo hacia en el bootcamp

/* app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
    })); */

//Routing

app.use('/api/usuarios',usuarioRoutes)

app.use('/api/proyectos',proyectoRoutes)

app.use('/api/tareas',tareaRoutes)



const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, ()=>{
    console.log (`Servidor corriendo en el puerto ${PORT}`)
})


// SOCKET IO    

import {Server} from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors : {
        origin: process.env.FRONTEND_URL
    }
});

io.on('connection', (socket) =>{
    console.log('conectado a socket.io')

    // Definir los eventos de socket io

    socket.on('abrir proyecto', (proyecto)=>{
      socket.join(proyecto);
    });

    socket.on('nueva tarea', (tarea) =>{
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    });

    socket.on('eliminar tarea', tarea=>{
        const proyecto= tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    });
    socket.on('actualizar tarea', tarea=>{
        const proyecto= tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    });
    socket.on('cambiar estado', tarea=>{
        const proyecto= tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    });
});
