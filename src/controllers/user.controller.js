import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

const generateAccesAndRefreshToken = async (userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken, refreshToken};
    }        
    catch(error){
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
}



const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty, email format, password strength
    // check if user already exists : username or email
    //check for image upload - avatar and cover image
    //uploas them to cloudinary and get the url
    // create use object - create entry in db

    // remove passord and refresh token field from the response
    // check for user creation
    // return response
     
    const { fullName , email, username, password } = req.body;
    //console.log("email" , email);


    if([fullName , email, username, password].some((field) => field?.trim() === "")){
         throw new ApiError(400, "All fields are required");
    }

    //now if for format validation we can use regex or we can use some library like joi or express-validator

    if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        throw new ApiError(400, "Invalid email format");
    }

    //user exist

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
       throw new ApiError(409, "User with the same username or email already exists"); 
    }

    // we will handle image upload later

    const avatarLocalPath = req.files?.avatar?.[0]?.path         // files acceds by multer
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    //console.log(req.files);
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatarfile is required");
    }

    //console.log(process.env.CLOUDINARY_CLOUD_NAME);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        username : username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


})


const loginUser = asyncHandler(async(req,res) => {
        //req->body -> data
        // username or email
        // find user in db
        // password check
        //acces and refresh token
        //send cookie

        const {username, email, password} = req.body;

        if(!username && !email){
            throw new ApiError(400, "Username or email is required");
        }

        const user = await User.findOne({
            $or : [{username},{email}]
        })

        if(!user){
            throw new ApiError(404, "User not found");
        }

        const isPasswpordValid = await user.comparePassword(password);

        if(!isPasswpordValid){
            throw new ApiError(401, "Invalid user credentials");
        }

        const {accessToken, refreshToken} = await generateAccesAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};