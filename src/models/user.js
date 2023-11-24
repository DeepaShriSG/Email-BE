import mongoose from '../models/index.js';
import validator from 'validator';

const validateEmail = (e) => {
  return validator.isEmail(e);
};

const userschema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: { validator: validateEmail, message: 'Invalid email format' },
    },
    password: { type: String, required: [true, "Password is required"] },
    resetToken: [String],
    status: { type: Boolean, default: true },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now() },
  },
  {
    collection: "users",
    versionKey: false,
  }
);

const userModel = mongoose.model("user", userschema);
export default userModel;
