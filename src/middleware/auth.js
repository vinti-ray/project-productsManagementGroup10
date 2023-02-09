const jwt=require("jsonwebtoken")
const mongoose=require("mongoose")
const userModel = require("../model/userModel")

//=================authentication=======================================

const authentication=async (req,res,next)=>{
try {
        let token = req.headers["authorization"]
        if(!token) return res.status(400).send({status:false,message:"please enter token"})
      
        let a= token.split(" ")[1]
    
        jwt.verify(a,"ProductManagementGroup10",(err,decode)=>{
            if(err){
    
                return res.status(401).send({status:false,message:err.message})
            }else{
                req.decode=decode
                 next()
            }
        })
} catch (error) {
    return res.status(500).send({status:false,message:error.message})
}
     
}
//===========================authorisation===========================
const authorisation=async (req,res,next)=>{
try {
    
        let userId=req.params.userId
    
    
        if(!mongoose.isValidObjectId(userId))  return res.status(400).send({status:false,message:"userId is not valid"})

        const findUser=await userModel.findById(userId)
        if(!findUser) return res.status(404).send({status:false,message:"no user present with this userID"})
    
        if(req.decode.userId!==userId) return res.status(403).send({status:false,message:"you are not authorised "})

        next()
} catch (error) {
    return res.status(500).send({status:false,message:error.message})
}
}

module.exports={authentication,authorisation}
