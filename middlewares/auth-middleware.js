const HttpError = require("../models/http-error")


const authenReq = (req,res,next)=>{

    if (req.isAuthenticated()) {

        next()

    }else{
        res.redirect("/signin")
    }


} 

const adminAuthorReq = (req,res,next)=>{

    if (req.isAuthenticated()) {

        if(req.user.admin==true){
            next()
        }else{
            return next(new HttpError("Only admin accounts are authorized to access the requested route.", 401))
        }

    }else{
        res.redirect("/signin")
    }


} 



exports.authenReq = authenReq
exports.adminAuthorReq = adminAuthorReq