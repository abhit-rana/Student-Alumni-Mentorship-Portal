// import {Alumni} from "../models/alumniModel.js";
import {
  Student,
  Alumni,
  Admin,
} from "../models/userModel.js";
import bcrypt, { hash } from "bcrypt";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { json } from "express";
import fs from "fs";

export const getMyProfile = async (req, res, next) => {
  try {
    const email = req.query.email;
    let user;
    let user_type;

    let out = await Student.find({ email: email });

    if (out.length !== 0) {
      user = out[0];
      user_type = "student";
    } else {
      out = await Alumni.find({ email: email });
      if (out.length !== 0) {
        user = out[0];
        user_type = "alumni";
      } else {
        out = await Admin.find({ email: email });
        if (out.length !== 0) {
          user = out[0];
          user_type = "admin";
        } else {
          return res.status(200).json({
            success: false,
            message: "Could not find the user",
          });
        }
      }
    }
    user["user_type"] = user_type;

    res.status(200).json({
      success: true,
      user_type: user_type,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const id = new mongoose.Types.ObjectId(req.query.id);

    let user;
    let user_type;

    let out = await Student.find({ _id: id });

    if (out.length !== 0) {
      user = out[0];
      user_type = "student";
    } else {
      out = await Alumni.find({ _id: id });
      if (out.length !== 0) {
        user = out[0];
        user_type = "alumni";
      } else {
        out = await Admin.find({ _id: id });
        if (out.length !== 0) {
          user = out[0];
          user_type = "admin";
        } else {
          return res.status(404).json({
            success: false,
            message: "Could not find the user",
          });
        }
      }
    }

    user.user_type = user_type;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAlumniProfile = async (req, res, next) => {
  
  //code for inserting alumni data into database

  // const data = JSON.parse(fs.readFileSync('mentorship_portal.alumni_datas.json', 'utf8'));

  // // Extract the records and insert them into the database
  // data.forEach(item => {
  //   const { _id, __v, ...dataWithoutIdAndV } = item; // Exclude _id and __v fields
  //   console.log(dataWithoutIdAndV);
  //   const document = new Alumni(dataWithoutIdAndV);
  //   document.save()
  //     .then(doc => {
  //       console.log('Document inserted:', doc);
  //     })
  //     .catch(err => {
  //       console.error('Error inserting document:', err);
  //     });
// });

  // const data = JSON.parse(fs.readFileSync('mentorship_portal.students.json', 'utf8'));

  // // Extract the records and insert them into the database
  // data.forEach(item => {
  //   const { _id, __v, ...dataWithoutIdAndV } = item; // Exclude _id and __v fields
  //   console.log(dataWithoutIdAndV);
  //   const document = new Student(dataWithoutIdAndV);
  //   document.save()
  //     .then(doc => {
  //       console.log('Document inserted:', doc);
  //     })
  //     .catch(err => {
  //       console.error('Error inserting document:', err);
  //     });
  // });

  try {
    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const { work, location } = req.body;
    console.log(work, location);

    const alumni = await Alumni.findOne({ _id: userId });
    const updated = {...alumni};
    
    updated.work = work;
    updated.location = location;
    
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Could not find the alumni",
      });
    }else {
      await Alumni.updateOne({ _id: userId }, { $set: {work: work, location: location} });
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const insertAvatar = async (req, res, next) => {
  try {
    const id = new mongoose.Types.ObjectId(req.query.userId);
    const image = req.body.avatar;

    let user;
    let user_type;
    let model;

    let out = await Student.findOne({ _id: id }).lean();

    if (out !== null) {
      user = out;
      user_type = "student";
      model = Student;
    } else {
      out = await Alumni.findOne({ _id: id }).lean();
      if (out !== null) {
        user = out;
        user_type = "alumni";
        model = Alumni;
      } else {
        out = await Admin.findOne({ _id: id }).lean();
        if (out !== null) {
          user = out;
          user_type = "admin";
          model = Admin;
        } else {
          return res.status(404).json({
            success: false,
            message: "Could not find the user",
          });
        }
      }
    }

    await model.updateOne({ _id: id }, { $set: {img: image} });
    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


export const getBatchwiseCounts = async (req, res, next) => {
  try {
    const alumniCounts = await Alumni.aggregate([
      {
        $group: {
          _id: "$batch",
          count: { $sum: 1 },
        },
      },
    ]);

    const studentCounts = await Student.aggregate([
      {
        $group: {
          _id: "$batch",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      alumniCounts,
      studentCounts,
    });
  } catch (error) {
    next(error);
  }
};

