import mongoose , { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },

        fullName : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type : String, // claudinary url
            required : true,
        },
        coverImage : {
            type : String, // claudinary url
            required : true,
        },

        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],

        password : {
            type : String,
            required : [true, 'Password is required']
        },

        refreshToken : {
            type : String,
        }
   },
   {
    timestamps : true
   }
);
 
userSchema.pre ('save', async function(next){             //signup se pehle password hash karne ke liye
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(password){    //login ke time password match karne ke liye
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){        //jwt token generate karne ke liye login/signup ke time
    return jwt.sign(                                       //payload
        {
            _id: this._id,
            email: this.email,                                //token me email aur username bhi bhej rahe hai taki user ke baare me pata chale token dekh ke
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){       //refresh token generate karne ke liye login/signup ke time
    return jwt.sign(
        {
            _id: this._id,           //refresh token me sirf user id hi bhej rahe hai taki pata chale ki ye token kis user ke liye hai, baki info access token me hi bhej rahe hai
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);