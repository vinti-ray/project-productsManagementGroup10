
const Joi=require("joi")


//===========================user creation===============================
const userJoi=Joi.object({
    fname:Joi.string().trim().required(),

    lname:Joi.string().trim().required(),

    email:Joi.string().trim().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),

    phone:Joi.string().trim().required().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    password:Joi.string().trim().required().min(8).max(15),

    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().trim().required(),
            city:Joi.string().required(),
            pincode:Joi.number().strict().required()
        }),

        billing:Joi.object({
            street:Joi.string().required(),
            city:Joi.string().required(),
            pincode:Joi.number().strict().required()
        })
    }),

})


//=====================login joi=================

const loginJoi=Joi.object({
    email:Joi.string().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),
    password:Joi.string().required().min(8).max(15)
})



//===================update user joi================
const updateJoi=Joi.object({
    fname:Joi.string().optional(),

    lname:Joi.string().optional(),

    email:Joi.string().optional().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),

    phone:Joi.string().optional().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    password:Joi.string().optional().min(8).max(15),

    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().optional(),
            city:Joi.string().optional(),
            pincode:Joi.number().strict().optional()
        }),

        billing:Joi.object({
            street:Joi.string().optional(),
            city:Joi.string().optional(),
            pincode:Joi.number().strict().optional()
        })
    }),
})


//====================pincode regex==============


const isValidPinCode = (value) => {
    const regEx = /^\s*([0-9]){6}\s*$/
    const result = regEx.test(value)
    return result
}

module.exports={userJoi,loginJoi,updateJoi,isValidPinCode}

