const userModel=require("../model/userModel")
const aws=require("aws-sdk")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const {userJoi}=require("../validator/joiValidation")
const bcrypt=require("bcrypt")


const createUser=async (req,res)=>{
    let data=req.body
 

   let error
  const validation=await userJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
  if(!validation) return res.status(400).send({  status: false,message: error})

  const saltRounds = 10;
  const password=data.password

//  let encryptPassword
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        data.password=hash
    });
  }); 


  const createData=await userModel.create(data)
  return res.status(201).send({status:true,message:createData})
}



module.exports={createUser}

//- Create a user document from request body. Request body must contain image.
// - Upload image to S3 bucket and save it's public url in user document.
// - Save password in encrypted format. (use bcrypt)
// - __Response format__
//   - _**On success**_ - Return HTTP status 201. Also return the user document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
