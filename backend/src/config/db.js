const mongoose=require('mongoose')

const Connect=async()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongooDb Connected")
  }catch(err){
    console.log(err)
  }
}
module.exports=Connect