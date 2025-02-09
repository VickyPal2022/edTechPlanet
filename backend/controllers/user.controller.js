import mongoose, { mongo } from "mongoose";
import { User } from "../models/user.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
    const { firstName, lastName, email, password} = req.body;

    const userSchema = z.object({
        firstName: z
          .string()
          .min(3, { message: "firstName must be atleast 3 char long" }),
        lastName: z
          .string()
          .min(3, { message: "lastName must be atleast 3 char long" }),
        email: z.string().email(),
        password: z
          .string()
          .min(6, { message: "password must be atleast 6 char long" }),
    });
    
    const validatedData = userSchema.safeParse(req.body);
    if (!validatedData.success) {
        return res
          .status(400)
          .json({ errors: validatedData.error.issues.map((err) => err.message) });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({error: "All feild is required"});
        };

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ errors: "User already exists" });
        };

        

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(200).json({
            message: "signup successfully",
            user,
        });
        console.log(firstName, lastName, email, password);

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Error in signup"});
    }
};

export const login = async (req, res) => {
    const { email, password }= req.body;

    try {
        const user = await User.findOne({ email: email });
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!user || !isPasswordCorrect){
            return res.status(403).json({error: "user doesn't exist"});
        };

        

        // jwt code
        const token = jwt.sign(
            {
                id: user._id,
            },
            config.JWT_USER_PASSWORD,
            {
                expiresIn: "1d"
            }
        );

        const cookieOptions={
            expires: new Date(Date.now() + 24*60*60*1000),//1day
            httpOnly: true,// can't be accessed via js directly
            secure: process.env.NOSE_ENV ==="production", // true for https only
            sameSite: "Strict" //csrf attacks
        }

        console.log(email, password);
        res.cookie("jwt", token);
        res.status(201).json({ message: "Login successful", user, token});
        
    } catch (error) {
        console.log("error in login!", error);
        res.status(500).json({ error: "error in login"});
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        console.log("Logged out Successfully");
        res.status(200).json({ message: "Logged out successfully!!"});
    } catch (error) {
        console.log("error in logout !", error);
        res.status(200).json({ errors: "error in logout"});
    }
}

export const purchasedCourses = async (req, res) => {
    const userId = req.userId;

    try {
        const purchased = await Purchase.find({ userId });

        let purchasedCourseId = [];

        for(let i=0; i<purchased.length; i++){
            purchasedCourseId.push(purchased[i].courseId);
        };

        const courseData = await Course.find({
            _id: { $in: purchasedCourseId },
        });
        res.status(200).json({ purchased, courseData })

    } catch (error) {
        console.log("Error in purchases", error);
        res.status(500).json({errors: "Error in purchases"});
    }
}