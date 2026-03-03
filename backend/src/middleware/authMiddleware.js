const  jwt=require('jsonwebtoken')

const tokens=(usr)=>{
  return jwt.sign(
    { id: usr._id, role: usr.role },
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_ACCESS_EXP}
  )
}

module.exports=tokens