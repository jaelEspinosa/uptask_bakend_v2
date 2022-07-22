import jwt from "jsonwebtoken"

//******** */ instalar npm i jsonwebtoken*****


const generarJWT = (id)=>{
 return jwt.sign({id}, process.env.JWT_SECRECT,{expiresIn:"30d"})

}

export default generarJWT