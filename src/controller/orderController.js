
const { object } = require("joi")
const { default: mongoose } = require("mongoose")
const cartModel = require("../model/cartModel")
const orderModel=require("../model/orderModel")
const userModel=require("../model/userModel")
 

// =====================create order===============================

const createOrder=async (req,res)=>{
try {
        let userId=req.params.userId
        // let cartId=req.body.cartId
        if(Object.keys(req.body).length==0)  return res.status(400).send({status:false,message:"please enter required field in body "})

        let {cartId,cancellable,...rest}=req.body
        if(Object.keys(rest).length!=0) return res.status(400).send({status:false,message:"user are allowed to send cartId and cancellable status only from request body"})

        if(!cartId) return res.status(400).send({status:false,message:"cartId is mandatory"})
        if(!mongoose.isValidObjectId(cartId)) return res.status(400).send({status:false,message:"cartId is not a valid objectId"})
    
        // const findUser=await userModel.findById(userId)
    

    
        const findCart=await cartModel.findById(cartId).select({__v:0,_id:0,createdAt:0,updatedAt:0}).lean()

        if(!findCart) return res.status(404).send({status:false,message:"no cart  found with for this cartId "})
      
        if(findCart.totalItems==0) return res.status(404).send({status:false,message:"there is no items present in cart please add some items before ordering"})


        //set cancellable 
        if(Object.keys(req.body).includes("cancellable")){
            findCart.cancellable=cancellable
        }
    
        let items=findCart.items
        //fetching quantity and adding them
        findCart.totalQuantity=items.map(a=>a.quantity).reduce((a,b)=>{
            a=a+b
            return a
        },0)
          //(acc,curr)==(a,b), 0==initial value of acc
    
          let createOrder =await orderModel.create(findCart)

          //empty cart
        await cartModel.findOneAndUpdate({userId:userId},{items:[],totalItems:0,totalPrice:0})
       
        createOrder = createOrder._doc
        delete createOrder.isDeleted

          return res.status(200).send({status:true,message:"success",data:createOrder})
    
} catch (error) {
    return res.status(500).send({status:false,message:error.message})
}
}

//==================== PUT /users/:userId/orders==================================

const updateOrder=async (req,res)=>{
    try {
        let userId=req.params.userId
        
        if(Object.keys(req.body).length==0)  return res.status(400).send({status:false,message:"please enter required field in body "})

        let {orderId,status,...rest} =req.body

        if(Object.keys(rest).length!=0) return res.status(400).send({status:false,message:"user are allowed to send orderID and  status key only from request body"})

    
        if(!orderId)   return res.status(400).send({status:false,message:"please enter orderID in body "})
        if(!mongoose.isValidObjectId(orderId)) return res.status(400).send({status:false,message:"please enter valid orderID in body "})

         if(!status)  return res.status(400).send({status:false,message:"please enter status  in body "})

         if(status!="pending"&&status!="completed"&&status!="cancled") return res.status(400).send({status:false,message:"status can be only pending cancled or completed "})

    
        const orderDoc= await orderModel.findById(orderId) 
    
      //- Make sure the order belongs to the user
        if(orderDoc.userId!=userId) return res.status(403).send({status:false,message:"this order doesnt belong to the logined  user "})
    
     //only a cancellable order could be canceled
       if(orderDoc.cancellable==true){
        const updateStatus=await orderModel.findByIdAndUpdate(orderId,{$set:{status:status}},{new:true})
        return res.status(200).send({status:true,message:"update successful",data:updateStatus})
       }else{
        return res.status(400).send({status:false,message:"this order is not cancellable sorry for your inconvenience"})     ///status code review
       } 
    
    } catch (error) {
        return res.status(500).send({status:false,message:error.message})
    }
 
}
module.exports={createOrder,updateOrder}