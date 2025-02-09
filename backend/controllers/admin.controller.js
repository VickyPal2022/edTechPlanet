import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";

export const signup = async (req, res) => {
    const { firstName, lastName, email, password} = req.body;

    const adminSchema = z.object({
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
    
    const validatedData = adminSchema.safeParse(req.body);
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

        const existingAdmin = await Admin.findOne({ email: email });
        if (existingAdmin) {
            return res.status(400).json({ errors: "Admin already exists" });
        };

        

        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        await newAdmin.save();
        res.status(200).json({
            message: "signup successfully",
            newAdmin,
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
        const admin = await Admin.findOne({ email: email });
        const isPasswordCorrect = await bcrypt.compare(password, admin.password);

        if(!admin || !isPasswordCorrect){
            return res.status(403).json({error: "admin doesn't exist"});
        };

        

        // jwt code
        const token = jwt.sign(
            {
                id: admin._id,
            },
            config.JWT_ADMIN_PASSWORD,
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
        res.status(201).json({ message: "Login successful", admin, token});
        
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