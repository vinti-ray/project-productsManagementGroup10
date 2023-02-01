const userModel=require("../model/userModel")
const aws=require("aws-sdk")
const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
const {userJoi,loginJoi}=require("../validator/joiValidation")
const bcrypt=require("bcrypt")
const {uploadFile}=require("../aws/aws")

//===============================create user================================
const createUser=async (req,res)=>{
try {

	    let data=req.body
     
        data.address=JSON.parse(data.address)

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Enter email and password to LogIn" })
        }

	
      let error
	  const validation=await userJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
	  if(!validation) return res.status(400).send({  status: false,message: error})

	
	  const existingData=await userModel.findOne({$or:[{email:data.email},{phone:data.phone}]})
	  if(existingData){
	    if(existingData.email==data.email.trim()) {return res.status(400).send({status:false,message:"email already exist"})}
	    if(existingData.phone==data.phone.trim()) {return res.status(400).send({status:false,message:"phone already exist"})}
	  }
	
	  const saltRounds = 10;           //check stackoverflow
	  let password=data.password.trim()
	
	let encryptPassword =await bcrypt.hash(password, saltRounds)
	
	data.password=encryptPassword
	
	//==============aws s3==================
       let profileUrl
       let files= req.files
       if(files && files.length>0){ 

           let uploadedFileURL= await uploadFile( files[0] )
           profileUrl=uploadedFileURL
       }
       else{
          return res.status(400).send({ msg: "No file found" })
       }
       
      data.profileImage=profileUrl

	  const createData=await userModel.create(data)
	  return res.status(201).send({status:true,message:createData})
} catch (error) {
	return res.status(500).send({status:false,message:error.message})
}
}

//========================================login=====================================//

const userLogin = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Enter email and password to LogIn" })
        }

        let data=req.body

        let error
        const validation=await loginJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
        if(!validation) return res.status(400).send({  status: false,message: error})

        const email = req.body.email
        const password = req.body.password

        const findUser = await userModel.findOne({ email })

        if (!findUser) {
            return res.status(404).send({ status: false, message: `User not found for this email: ${email}` })
        }
        //statusCode check

        const decodePassword = await bcrypt.compare(password, findUser.password)
        if (decodePassword) {         
            const token = jwt.sign(
                {
                    userId: findUser._id.toString()

                },
                "ProductManagementGroup10",
                { expiresIn: "30h" })          
            return res.status(200).send({ status: true, message: "User login successfull, token will be valid for 30 Minute", data: { userId: findUser._id, token } })
        }
        else {
            return res.status(404).send({ status: false, message: `Password is wrong for this email: ${email}` })
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message})
 }
  
  }

  //===================================## GET /user/:userId/profile ===================

  const getData=async (req,res)=>{
      let userId=req.params.userId

       
       const findData=await userModel.find()
       if(!findData) return res.status(404).send({status:false,message:"no data found"})
       return res.status(200).send({status:true,message:findData})
  }

module.exports={createUser,userLogin,getData}



// ## GET /user/:userId/profile (Authentication required)
// - Allow an user to fetch details of their profile.
// - Make sure that userId in url param and in token is same
// - __Response format__
//   - _**On success**_ - Return HTTP status 200 and returns the user document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)
// ```yaml

