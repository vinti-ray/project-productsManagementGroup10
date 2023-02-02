const express=require("express")
const router=express.Router()
const {createUser,userLogin,getData,putData}=require("../controller/userController")
const {authentication,authforGet}=require("../middleware/auth")
const {createProduct,getProduct,getProductbyId,deleteProductbyId}=require("../controller/productController")

router.post("/register",createUser)
router.post("/login",userLogin)

router.get("/user/:userId/profile",authentication,authforGet,getData)
router.put("/user/:userId/profile",authentication,authforGet,putData)

router.post("/products",createProduct)
router.get("/products",getProduct)
router.get("/products/:productId",getProductbyId)
router.delete("/products/:productId",deleteProductbyId)

router.all("/*",function(req,res){
    return res.status(400).send({status:false,message:"invalid path"})
})

module.exports=router