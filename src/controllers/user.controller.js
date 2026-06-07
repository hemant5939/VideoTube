import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";



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
     
    const { fullname , email, username, password } = req.body;
    console.log("email" , email);


    if([fullname , email, username, password].some((field) => field?.trim() === "")){
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

    const avatarLocalPath = req.files?.avatar[0]?.path         // files acceds by multer
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatarfile is required");
    }

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


export { registerUser };