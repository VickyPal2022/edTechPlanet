import mongoose, { mongo } from "mongoose";
import { Course } from "../models/course.model.js";
import { Purchase } from "../models/purchase.model.js";
import { v2 as cloudinary } from 'cloudinary';
import Stripe from "stripe";
import config from "../config.js";

export const createCourse = async(req,res)=>{
    const adminId = req.adminId;5
    const {title, description, price} = req.body;
     
    try {
        if(!title || !description || !price){
            return res.status(400).json({errors: "All fields are required"})
        }

        const {image} = req.files;
        if(!req.files || Object.keys(req.files).length===0){
            return res.status(400).json({errors: "No file uploaded"});
        }

        const allowedFormat = ["image/png", "image/jpg", "image/jpeg"];
        if(!allowedFormat.includes(image.mimetype)){
            return res.status(400).json({errors: "only jpg/ png/ jpeg allowed"});
        }

        //Cludinary code
        const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
        if(!cloud_response || cloud_response.error){
            return res.status(400).json({errors: "Error in uploading file to cloudinary"});
        }

        const courseData = {
            title,
            description,
            price,
            image:{
                public_id: cloud_response.public_id,
                url: cloud_response.secure_url,
            },
            createrId: adminId
        }
        const course = await Course.create(courseData);
        res.json({
            message: "Course created successfully",
            course,
        })
        console.log(title, description, price, image, adminId);
    } catch (error) {
        console.log(error);
        res.status(500).json({errors: "Error in creating course"});
    }
    
};

export const updateCourse = async (req,res) => {
    const adminId = req.adminId;
    const { courseId } = req.params;

    if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
    }

    const isValidId = mongoose.Types.ObjectId.isValid(courseId);
    if (!isValidId) {
        return res.status(400).json({ message: "Invalid Course ID" });
    }

    const isValidAdmin = mongoose.Types.ObjectId.isValid(adminId);
    if (!isValidAdmin) {
        return res.status(400).json({ message: "Invalid Admin" });
    }

    const { title,description, price, image } = req.body;    

    try{
        const course = await Course.updateOne(
            {
                _id: courseId,
                createrId: adminId,
            },
            {
                title,
                description,
                price,
                image: {
                    public_id: image?.public_id,
                    url: image?.url,
                }
            },
        );

        if (course.matchedCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }        

        res.json({message:"Course updated successfully"});
        console.log(courseId, title, description, price, image);
    } catch (error) {
        res.status(500).json({message:"Error in course updation"});
        console.log("Error in course Updating", error);
    }
};

export const deleteCourse = async (req, res) => {
    const adminId = req.adminId;
    const { courseId } = req.params;
    if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
    }

    const isValidId = mongoose.Types.ObjectId.isValid(courseId);
    if (!isValidId) {
        return res.status(400).json({ message: "Invalid Course ID" });
    }

    const isValidAdmin = mongoose.Types.ObjectId.isValid(adminId);
    if (!isValidAdmin) {
        return res.status(400).json({ message: "Invalid Admin" });
    }

    try {
        const course = await Course.findOneAndDelete({
            _id: courseId,
            createrId: adminId,
        });

        if (!course) {
            return res.status(404).json({ errors: "course not found" });
        }
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ errors: "Error in course deleting" });
        console.log("Error in course deleting", error);
    }
};

export const getCourses = async (req, res) => {
    try {
      const courses = await Course.find({});
      res.status(201).json({ courses });
    } catch (error) {
      res.status(500).json({ errors: "Error in getting courses" });
      console.log("error to get courses", error);
    }
};

export const courseDetails = async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
    }

    const isValidId = mongoose.Types.ObjectId.isValid(courseId);
    if (!isValidId) {
        return res.status(400).json({ message: "Invalid Course ID" });
    }
    
    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ errors: "Course not found" });
      }
      res.status(200).json({ course });
    } catch (error) {
      res.status(500).json({ errors: "Error in getting course details" });
      console.log("Error in course details", error);
    }
};

export const buyCourses = async (req, res) => {
    const {userId}= req;
    const {courseId}= req.params;
    const stripe = new Stripe(config.STRIPE_SECRET_KEY);

    try {
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({ errors: "Course not found"});
        };

        const existPurchase = await Purchase.findOne({userId, courseId});
        if(existPurchase){
            return res.status(400).json({ errors: "User has purchased course already !!"});
        };

        //stripe payment code
        const amount = course.price;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_types: ["card"],
          });

        const newPurchase = new Purchase({userId, courseId});
        await newPurchase.save();
        res.status(201).json({message: "Course purchased successfully !!", newPurchase,
            course,
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.log("error in buying course", error);
        res.status(500).json({errors: "error in buying course"})
    }
};