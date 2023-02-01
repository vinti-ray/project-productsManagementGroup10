const express=require("express")
const router=express.Router()
const {createUser,userLogin,getData,putData}=require("../controller/userController")
const {authentication,authforGet}=require("../middleware/auth")

router.post("/register",createUser)
router.post("/login",userLogin)

router.get("/user/:userId/profile",authentication,authforGet,getData)
router.put("/user/:userId/profile",authentication,authforGet,putData)



module.exports=router