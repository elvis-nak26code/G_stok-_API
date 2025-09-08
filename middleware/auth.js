const jwt=require("jsonwebtoken");
// require('dotenv').config();

exports.authentification=(req,res,next)=>{
    // console.log("dans le middleware")
    const Authorization = req.headers.authorization;
    if(!Authorization || !Authorization.startsWith('Bearer ')) return res.status(401).json({message: "Accès refusé"})
    try{
        // const TK = process.env.API_MONGOOSECONNECTION_URL;
        const token = Authorization.split(' ')[1]
        const decoded=jwt.verify(token,'gstockNak263secret')
        req.user=decoded
        // console.log(req.user)
        next()
    }catch(error){
        console.log("erreur")
        return res.status(400).json({message : "token invalide"})
    }
     
}


