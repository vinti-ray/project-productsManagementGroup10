const productModel=require("../model/productModel")
const {uploadFile}=require("../aws/aws")
const {productJoi}=require("../validator/joiValidation")
const userModel = require("../model/userModel")
const { default: mongoose } = require("mongoose")

//=======================create Product===============================

const createProduct=async (req,res)=>{
    let data=req.body              //check for data type

   if(data.availableSizes){
    data.availableSizes=JSON.parse(data.availableSizes)
   }
   
    //validation

    let error
    const validation=await productJoi.validateAsync(data).then(()=>true).catch((err)=>{error=err.message;return null})
    if(!validation) return res.status(400).send({status:false,message:error})

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
        filter.availableSizes = size
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


module.exports={createProduct,getProduct,getProductbyId,deleteProductbyId}


