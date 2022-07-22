import Usuario from "../models/Usuario.js"
import generarID from "../helpers/generarID.js";
import generarJWT from "../helpers/generarJWT.js";
import {emailRegistro} from '../helpers/emails.js'
import {emailOlvidePassword} from '../helpers/emails.js'


const registrar = async (req,res)=> {
   
    //Evitar registros duplicados

    const{email} = req.body;
    const existeUsuario = await Usuario.findOne({email});

    if(existeUsuario){
        const error = new Error('El Usuario ya está registrado');
        return res.status(400).json({msg: error.message})
    }
    
    try {
       const usuario = new Usuario(req.body) 
       usuario.token = generarID()
       await usuario.save()

       //enviar el email de confirmacion
       emailRegistro({
        email : usuario.email,
        nombre : usuario.nombre,
        token : usuario.token

       })

       res.json({msg : "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"})       
    } catch (error) {
       console.log(error) 
    }    
};

// **** AUTENTICAR USUARIO


const autenticar = async (req, res)=>{
    const {email, password} = req.body;

   // comprobar si el usuario existe

    const usuario = await Usuario.findOne({email})
    if (!usuario){
        const error = new Error('USUARIO NO ENCONTRADO');
        return res.status(404).json({msg: error.message})       
   
    } 
    // comprobar si está confirmado   
   
    if (!usuario.confirmado){
        const error = new Error('LA CUENTA NO ESTA CONFIRMADA');
        return res.status(400).json({msg: error.message})    
    }
    
   // comprobar su password

   if(await usuario.comprobarPassword(password)){
    res.json({
        _id:usuario._id,
        nombre: usuario.nombre,
        email:usuario.email,
        token: generarJWT(usuario._id),
    })
   }else{
    const error = new Error('PASSWORD INCORRECTO');
    return res.status(403).json({msg: error.message}) 
   }
}
const confirmar = async (req, res)=>{
    const {token} = req.params
    const usuarioConfirmar = await Usuario.findOne({token})
    if(!usuarioConfirmar){
        const error = new Error('HUBO UN ERROR DE CONFIRMACIÓN');
    return res.status(403).json({msg: error.message}) 
    }
    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ""
        await usuarioConfirmar.save()

        res.json({msg:'Usuario Confirmado Correctamente'})
    } catch (error) {
        console.log(error)
        
    }
}
const olvidePassword = async (req, res)=>{
    const {email} = req.body;
    // comprobar que el usuarion existe
    const usuario = await Usuario.findOne({email})
    if (!usuario){
        const error = new Error('USUARIO NO ENCONTRADO');
        return res.status(404).json({msg: error.message})       
    } 
    try {
        usuario.token= generarID()
        await usuario.save()
        res.json({msg : "Hemos enviado un email con las instrucciones"})
        emailOlvidePassword({
            email : usuario.email,
            nombre : usuario.nombre,
            token : usuario.token
    
           })
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res)=>{
      const {token} = req.params

      const tokenValido = await Usuario.findOne({token})
      if (tokenValido){
        res.json({msg:'Token Válido y el Usuario existe'})
      }else{
        const error = new Error('Enlace inválido');
        return res.status(404).json({msg: error.message})   
      }
}

const nuevoPassword = async (req, res)=>{
   const {token} = req.params
   const {password}=req.body

   const usuario = await Usuario.findOne({token})
      
   if (usuario){
       usuario.password = password;
       usuario.token = ''
       try {
        await usuario.save()
        res.json({msg: 'Password modificado correctamente'})
       } catch (error) {
        console.log(error)
       }
      }else{
        const error = new Error('token no válido');
        return res.status(404).json({msg: error.message})   
      }
}
const perfil = async (req, res)=>{
    const {usuario} = req
    res.json(usuario)
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
   
}

