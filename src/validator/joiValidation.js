
const Joi=require("joi")


//===========================user creation===============================
const userJoi=Joi.object({
    fname:Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please provide valid fname"),

    lname:Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please provide valid lname"),

    email:Joi.string().trim().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).message("please enter valid email"),

    profileImage:Joi.required(),

    phone:Joi.string().trim().required().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    password:Joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password must contain one upper case one lower case one special character and one numerical value"),

    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().trim().required(),
            city:Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please provide valid city name"),
            pincode:Joi.number().integer().strict().required()
        }).required(),

        billing:Joi.object({
            street:Joi.string().trim().required(),
            city:Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please provide valid city name"),
            pincode:Joi.number().integer().strict().required() //Joi.string().required().regex(/^[0-9]+$/).cast('number');
        }).required()
    }).required(),

})


//=====================login joi=================

const loginJoi=Joi.object({
    email:Joi.string().trim().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).message("please enter valid email"),
    password:Joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password must contain one upper case one lower case one special character and one numerical value")
})



//===================update user joi================
const updateJoi=Joi.object({
    fname:Joi.string().trim().optional().regex(/^[a-zA-Z ]+$/).message("please provide valid fname"),

    lname:Joi.string().trim().optional().regex(/^[a-zA-Z ]+$/).message("please provide valid lname"),

    email:Joi.string().trim().optional().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).message("please enter valid email"),

    phone:Joi.string().trim().optional().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    profileImage:Joi.optional(),

    password:Joi.string().trim().optional().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password must contain one upper case one lower case one special character and one numerical value"),

    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().trim().optional(),
            city:Joi.string().trim().optional().regex(/^[a-zA-Z ]+$/).message("please provide valid city name"),
            pincode:Joi.number().strict().optional()
        }),

        billing:Joi.object({
            street:Joi.string().trim().optional(),
            city:Joi.string().trim().optional().regex(/^[a-zA-Z ]+$/).message("please provide valid city name"),
            pincode:Joi.number().strict().optional()

        })
    }),
})


//====================pincode regex==============


const isValidPinCode = (value) => {
    const regEx = (/^([1-9]{4}|[0-9]{6})$/)
    const result = regEx.test(value)
    return result
}


//==========================create Product joi===========================
const productJoi=Joi.object({
    title: Joi.string().trim().required(),
    description:Joi.string().trim().required(),
    price:Joi.number().required(),

    currencyId:Joi.string().trim().required().valid("INR"),
    currencyFormat: Joi.string().trim().required().valid("₹"),
    isFreeShipping: Joi.boolean().optional(),
    productImage:Joi.required(),
    style:Joi.string().trim().optional(),
    availableSizes:Joi.string().trim().optional(),
    installments: Joi.number().optional(),
    // deletedAt: Joi.date(), 
    // isDeleted: Joi.boolean(),
})

//=============================update Product======================

const updateProductJoi=Joi.object({
    title: Joi.string().optional(),
    description:Joi.string().optional(),
    price:Joi.number().optional(),
    productImage:Joi.optional(),
    currencyId:Joi.string().optional().valid("INR"),
    currencyFormat: Joi.string().optional().valid("₹"),
    isFreeShipping: Joi.boolean().optional(),
    style:Joi.string().optional(),
    availableSizes:Joi.string().optional(),
    installments: Joi.number().optional(),
    deletedAt: Joi.date(), 
    isDeleted: Joi.boolean(),
})

//===================get product joi============================
const getProductByQuery=Joi.object({
    size:Joi.string().optional(),
    name:Joi.string().optional(),
    priceGreaterThan:Joi.number().optional(),
    priceLessThan:Joi.number().optional(),
    priceSort:Joi.number().valid(1,-1).optional()
   // size, name, priceGreaterThan, priceLessThan, priceSort
})

//===========================create cart joi==================
const createcartJoi=Joi.object({
    productId:Joi.string().required(),
    cartId:Joi.string().optional()
})


//==================update cart joi =====================
const cartJoi=Joi.object({
       productId:Joi.string().required(),
       cartId:Joi.string().required(),
       removeProduct:Joi.number().strict().valid(1,0)
})
module.exports={userJoi,loginJoi,updateJoi,isValidPinCode,productJoi,updateProductJoi,getProductByQuery,cartJoi,createcartJoi}

