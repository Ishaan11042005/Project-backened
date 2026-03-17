import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerficationMailGenContent, forogtPasswordMailGenContent, sendEmail } from "../utils/mail.js";
import { cookie } from "express-validator";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAcessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(
            500,
            "Something wrong generating token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {

    const { email, username, password, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User exist", []);
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerfied: false
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Pls verify",
        mailgenContent: emailVerficationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered successfully and verification email sent"
            )
        );
});

const login = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "user not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "password not correct");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"user logout")
    )
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "Current user fetched successfully"
        )
    )
})

const verifyEmail=asyncHandler(async(req,res)=>{
    const {verificationToken}=req.params;
    if(!verificationToken){
        throw new ApiError(400,"email verification token is missing")
    }

    let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")
    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })
    if(!user){
        throw new ApiError(400,"token is invalid")
    }
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.isEmailVerfied=true;
    await user.save({validateBeforeSave:false})
    return res
    .staus(200)
    .json(
        new ApiResponse(
            200,
            {
                isEmailVerfied:true
            },
            "email is verified",
        )
    )
})

const resendEmailVerification=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    if(user.isEmailVerfied){
        throw new ApiError(409,"email alreday verified")
    }
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Pls verify",
        mailgenContent: emailVerficationMailGenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "mail has been sent"
        )
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingrefeshtoken=req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingrefeshtoken){
        throw new ApiError(401,"unauthorized Access")
    }
    try {
        const decodedToken=jwt.verify(incomingrefeshtoken,process.env.REFRESH_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"invalid refresh token") 
        }
        if(incomingrefeshtoken!==user?.refreshToken){
            throw new ApiError(401,"refresh token expired") 
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken:newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
        user.refreshToken=newRefreshToken;
        await user.save()
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,"invalid Refresh Token")
    }
})

const ForgotPasswordRequest=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User does not exit",[])
    }
    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();
    user.forgotPasswordToken=hashedToken;
    user.forgotPasswordExpiry=tokenExpiry;
    await user.save({validateBeforeSave:false})
    await sendEmail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forogtPasswordMailGenContent(
            user.username,
            '${process.env>FORGOT_PASSWROD_REDIRECT_URL}/${unHashedToken}',
        ),
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password reset mail"
        )
    )
})

const resetForgotPassword=asyncHandler(async(req,res)=>{
    const {resetToken}=req.params
    const {newPassword}=req.body

    let hashedToken=crypto
    .createHash("sha256")
    .update("resetToken")
    .digest("hex")

    const user=await User.findOne(
        {
            forgotPasswordToken:hashedToken,
            forgotPasswordExpiry:{$gt: Date.now()}
        }
    )
    if(!user){
        throw new ApiError(489,"Token is invalid")
    }

    user.forgotPasswordExpiry=undefined
    user.forgotPasswordToken=undefined

    user.password=newPassword
    await user.save({validateBeforeSave:false});

    return res
    .staus(20)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Reset successfully"
        )
    )
})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordValid=await isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid Old Password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Changed successfully"
        )
    )
})
export { registerUser, login ,logoutUser, getCurrentUser, verifyEmail,resendEmailVerification,refreshAccessToken,ForgotPasswordRequest,resetForgotPassword,changeCurrentPassword};
