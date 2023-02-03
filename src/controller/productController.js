const productModel=require("../model/productModel")
const {uploadFile}=require("../aws/aws")
const {productJoi,updateProductJoi, updateJoi}=require("../validator/joiValidation")
const userModel = require("../model/userModel")
const { default: mongoose } = require("mongoose")
const { json } = require("express")

//=======================create Product===============================

const createProduct=async (req,res)=>{
    let data=req.body              //check for data type


   
    //validation

    let error
    const validation=await productJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
    if(!validation) return res.status(400).send({status:false,message:error})

    //availablesize

    if(data.availableSizes){
   
        data.availableSizes=data.availableSizes.split(",");
        let availableSizes=data.availableSizes
        //enum validaiton
        let enumValue =["S", "XS","M","X", "L","XXL", "XL"] 
        for (let i of availableSizes){
            if(!enumValue.includes(i)){
                return res.status(400).send({status:false,message:`availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these`})
            }
            }
            data.availableSizes=availableSizes
       }

    //unique value
    const existingTitle=await productModel.findOne({title:data.title,isDeleted:false})
    if(existingTitle) return res.status(400).send({status:false,message:"title already exist please enter another one"})

    //aws s3
    let files=req.files
    let fileUrl
    if(files&&files.length>0){
        let uploadImage=await uploadFile(files[0])
    fileUrl=uploadImage
    }else{
        return res.status(400).send({satatus:false,message:"please upload image"})
    }
  data.productImage=fileUrl
    //data creation

    const createProduct=await productModel.create(data)

  

   
    console.log(createProduct);

   return res.status(201).send({status:true,message:"success",data:createProduct})


}

//========================get by query=========================
const getProduct = async (req,res)=>{
    try{
    let data = req.query
    let { size, name, priceGreaterThan, priceLessThan, priceSort,...rest} = data

    if(Object.keys(rest).length > 0) return res.status(400).send({status: false, message: "You can filter only by size, name, priceGreaterThan, priceLessThan, priceSort "})

    let filter = {isDeleted:false}

    if(size){
           size=size.split(",");
            filter.availableSizes = {$in:size} ///check whether it will apply on product creation time

    }


    if(name){
         filter.title = name
    }

    if(priceGreaterThan){
        filter.price = {$gt:priceGreaterThan}
    }

    if(priceLessThan){
        filter.price = {$lt:priceLessThan}
    }

    console.log(filter.price);
    let sortProduct
    if(priceSort){
        sortProduct = {price: priceSort}
    }

    let getData= await productModel.find(filter).sort(sortProduct)

    res.status(200).send({status:true, message:"Success", data: getData })
    }
    catch(err){
        res.status(500).send({status:false, error:err.message})
    }
}


//=============================get product==============================

const getProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }       

        if(!mongoose.isValidObjectId(productId)) return res.status(400).send({status:false,message:"product id is not valid"})

        const getproduct = await productModel.findOne({ _id: productId, isDeleted: false, });

        if (!getproduct) {
            return res.status(404).send({ status: false, message: "product not found" });
        }
        return res.status(200).send({ status: true, message: "Success", data: getproduct });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};

//===========================product update================================
const updateProduct=async (req,res)=>{
    let productId=req.params.productId
    let data=req.body
    

    //validProductId
    if(!mongoose.isValidObjectId(productId)) return res.status(400).send({status:false,message:"productId in param is not a valid product id"})

    //joiValidation
    let error
    const validation=await updateProductJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message ; return null})
    if(!validation) return res.status(400).send({status:false,message:error})

    //exist product id
    const existProduct=await productModel.findOne({_id:productId,isDeleted:false})
    if(!existProduct) return res.status(404).send({status:false,message:"no product found with this product id"})
    
    //uniqueTitle
    const titleExist=await productModel.findOne({title:data.title,isDeleted:false})
    if(titleExist) return res.status(400).send({status:false,message:"title already in use please use another one"})

   //imageurl

   let files=req.files
   if(files&&files.length>0){
    let imageUrl=await uploadFile(files[0])
    data.productImage=imageUrl
   }

   //availableSizes in array

   if(data.availableSizes){

    data.availableSizes=data.availableSizes.split(",");
    let availableSizes=data.availableSizes
    let enumValue =["S", "XS","M","X", "L","XXL", "XL"] 

    for (let i of availableSizes) {
        if(!enumValue.includes(i)){
            return res.status(400).send({status:false,message:`availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these`})
        }
        }

      data.availableSizes=availableSizes

   }


    const updatedData=await productModel.findByIdAndUpdate(productId,{$set:data},{new:true})
    return res.status(200).send({status:true,message:"successfully updated",data:updatedData})
}

// ### PUT /products/:productId
// - Updates a product by changing at least one or all fields
// - Check if the productId exists (must have isDeleted false and is present in collection). If it doesn't, return an HTTP status 404 with a response body like [this](#error-response-structure)
// - __Response format__
//   - _**On success**_ - Return HTTP status 200. Also return the updated product document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

//=========================delete product===========================
const deleteProductbyId = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId is required" });
        }
       
        //valid product id validation
        if(!mongoose.isValidObjectId(productId)) return res.status(400).send({status:false,message:"product id is not valid"})

        const product = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!product) {
            return res.status(404).send({ status: true, message: "product not found " });
        }
        return res.status(200).send({ status: true, message: "product is deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


module.exports={createProduct,getProduct,getProductbyId,updateProduct,deleteProductbyId}


