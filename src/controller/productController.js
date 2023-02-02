const productModel=require("../model/productModel")
const {uploadFile}=require("../aws/aws")
const {productJoi}=require("../validator/joiValidation")
const userModel = require("../model/userModel")
const { default: mongoose } = require("mongoose")

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

  

    delete createProduct["__V"]

   return res.status(201).send({status:true,message:"success",data:responseData})


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

// - Create a product document from request body.
// - Upload product image to S3 bucket and save image public url in document.
// - __Response format__
//   - _**On success**_ - Return HTTP status 201. Also return the product document. The response should be a JSON object like [this](#successful-response-structure)
//   - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)

// ### GET /products
// - Returns all products in the collection that aren't deleted.
// - __Filters__
//   - Size (The key for this filter will be 'size')
//   - Product name (The key for this filter will be 'name'). You should return all the products with name containing the substring recieved in this filter
//   - Price : greater than or less than a specific value. The keys are 'priceGreaterThan' and 'priceLessThan'. 
  
// > **_NOTE:_** For price filter request could contain both or any one of the keys. For example the query in the request could look like { priceGreaterThan: 500, priceLessThan: 2000 } or just { priceLessThan: 1000 } )
  
// - __Sort__
//   - Sorted by product price in ascending or descending. The key value pair will look like {priceSort : 1} or {priceSort : -1}
// _eg_ /products?size=XL&name=Nit%20grit
// - __Response format__
// - _**On success**_ - Return HTTP status 200. Also return the product documents. The response should be a JSON object like [this](#successful-response-structure)
// - _**On error**_ - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)