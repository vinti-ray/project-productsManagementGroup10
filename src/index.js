const express=require("express")
const app=express()
const mongoose=require("mongoose")
const multer=require("multer")
const route=require("./routes/route")


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(multer().any())

//error level middleware
app.use((err, req, res, next) => {
  if (err.message === "Unexpected end of JSON input") {
    return res.status(400).send({status: false, message: "Syntex error in Postman, Please Provide a Valid JSON",});
  } else {
    next()
  }
})

mongoose.set('strictQuery', true)
mongoose
  .connect(
    "mongodb+srv://vintiray:7091201680@cluster0.ahtxrqr.mongodb.net/group10Database",
    {
      useNewUrlParser: true,
    }
  )

  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/",route)

app.listen(3000, () => {
    console.log("Express app running on port " + 3000);
  });


