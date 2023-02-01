const Joi=require("joi")

//===========================user creation===============================
const userJoi=Joi.object({
    fname:Joi.string().required().regex(/^[a-zA-Z ]+$/).message("please enter valid fname"),

    lname:Joi.string().required().regex(/^[a-zA-Z ]+$/).message("please enter valid lname"),

    email:Joi.string().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),

    phone:Joi.string().required().regex(/^[5-9]{1}[0-9]{9}$/).message("please enter valid mobile number"),

    password:Joi.string().required().regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("please enter valid password"),

    address:Joi.object({
        shipping:Joi.object({
            street:Joi.string().required(),
            city:Joi.string().required(),
            pincode:Joi.number().required()
        }),

        billing:Joi.object({
            street:Joi.string().required(),
            city:Joi.string().required(),
            pincode:Joi.number().required()
        })
    }),


})


//=====================login joi=================

const loginJoi=Joi.object({
    email:Joi.string().required().regex(/^[A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1,}[A-Za-z.]{2,8}$/).
    message("please enter valid email"),
    password:Joi.string().required().regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("please enter valid password")
})

module.exports={userJoi,loginJoi}

