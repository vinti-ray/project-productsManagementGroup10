const productModel=require("../model/productModel")
const {uploadFile}=require("../aws/aws")
const {productJoi,updateProductJoi,getProductByQuery}=require("../validator/joiValidation")
const userModel = require("../model/userModel")
const { default: mongoose } = require("mongoose")
const { json } = require("express")

//=======================create Product===============================

const createProduct=async (req,res)=>{
try {
        let data=req.body              //check for data type
        let files=req.files
        if (files&&files.length!=0) {
            data.productImage=files
        }
    
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "Please Enter data in body" })
             }
        //validation
    
        let error
        const validation=await productJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
        if(!validation) return res.status(400).send({status:false,message:error})
    
        //availablesize
    
        if (data.availableSizes) {
    
            data.availableSizes = data.availableSizes.split(",");
            let availableSizes = data.availableSizes
            //enum validaiton
            let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    
            let unique =[]
            for(let i = 0; i <availableSizes.length;i++){
                availableSizes[i]=availableSizes[i].toUpperCase()
                if (unique.indexOf(availableSizes[i]) == -1){
                    if(enumValue.includes(availableSizes[i])){
                        unique.push(availableSizes[i])
                    } else{ return res.status(400).send({ status: false, message: `availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these` })}
                }
            }
    
            data.availableSizes = unique
    
        }
    
    
        //unique value
        const existingTitle=await productModel.findOne({title:data.title,isDeleted:false})
        if(existingTitle) return res.status(400).send({status:false,message:"title already exist please enter another one"})
    
        //aws s3
    
        if(files&&files.length>0){
            let uploadImage=await uploadFile(files[0])
            data.productImage=uploadImage
        }
    
        //data creation
    
        const createProduct=await productModel.create(data)
    
    
       return res.status(201).send({status:true,message:"success",data:createProduct})
} catch (error) {
    return res.status(500).send({status:false,message:error.message})
}


}

//========================get by query=========================
const getProduct = async (req,res)=>{
    try{
    let data = req.query
    let { size, name, priceGreaterThan, priceLessThan, priceSort} = data

    let error
    let validaiton=await getProductByQuery.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return false})

    if(!validaiton) return res.status(400).send({status:false,message:error})

    

    let filter = {isDeleted:false}

    if(size){
           size=size.split(",");
           //enum validaiton
           let enumValue =["S", "XS","M","X", "L","XXL", "XL"] 
           for (let i of size){
            i=i.toUpperCase()
               if(!enumValue.includes(i)){
                   return res.status(400).send({status:false,message:`availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these`})
               }
               }
            let sizeNew=size.map(a=>a.toUpperCase())

            filter.availableSizes = {$in:sizeNew} 
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

   
    let sortProduct
    if(priceSort){
        sortProduct = {price: priceSort}
    }

    let getData= await productModel.find(filter).sort(sortProduct)
  

    if(getData.length==0) return res.status(404).send({status:false,message:"no data found"})

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
try {
        let productId=req.params.productId 
        let data=req.body
        let files=req.files
           //when no data provided
    
    
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
    
    
    
       //availableSizes in array
    
       if (data.availableSizes) {
    
        data.availableSizes = data.availableSizes.split(",");
        let availableSizes = data.availableSizes
        //enum validaiton
        let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    
        let unique =[]
        for(let i = 0; i <availableSizes.length;i++){
            availableSizes[i]=availableSizes[i].toUpperCase()
            if (unique.indexOf(availableSizes[i]) == -1){
                if(enumValue.includes(availableSizes[i])){
                    unique.push(availableSizes[i])
                } else{ return res.status(400).send({ status: false, message: `availableSizes can be only from "S", "XS","M","X", "L","XXL", "XL" these` })}
            }
        }
    
        data.availableSizes = unique
    
    }
    
       //imageurl
    
       if(files&&files.length>0){
        let imageUrl=await uploadFile(files[0])
        data.productImage=imageUrl
       }
    
    
       if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"please enter atleast one field in order to update it"})
    
        const updatedData=await productModel.findByIdAndUpdate(productId,{$set:data},{new:true})
        return res.status(200).send({status:true,message:"successfully updated",data:updatedData})
} catch (error) {
    return res.status(500).send({status:false,message:error.message})
}
}



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


