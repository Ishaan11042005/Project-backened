import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
export const verifyJWT=asyncHandler(async(req,res,next)=>{
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
    if(!token){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodeToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
)
if(!user){
        throw new ApiError(401,"unauthorized user")
    }
    req.user=user
    next();
    } catch (error) {
        throw new ApiError(401,"unauthorized request")
    }
})