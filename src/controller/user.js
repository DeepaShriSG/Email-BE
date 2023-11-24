import userModel from "../models/user.js";
import Auth from "../common/auth.js";
import emailService from '../common/emailService.js'
import crypto from 'crypto';


const createUsers = async (req, res) => {
    try {
      // Check if user with the given email already exists
      const existingUser = await userModel.findOne({ email: req.body.email });
  
      if (!existingUser) {
        // Hash the password before storing it in the database
        req.body.password = await Auth.hashPassword(req.body.password);
  
        // Create a new user
        await userModel.create(req.body);
  
        // Respond with a 201 status indicating successful creation
        res.status(201).send({
          message: "User created successfully",
        });
      } else {
        // User with the email already exists
        res.status(400).send({
          message: `User with ${req.body.email} already exists`,
        });
      }
    } catch (error) {
      // Handle internal server error
      console.error("Error creating user:", error);
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  //To get the created user
  const getUsers = async(req,res)=>{
    try {
         let users = await userModel.find({},{password:0})
         console.log(users)
         return res.status(200).send({
             message:"User Data Fetched Successfully",
             users
         })
    } catch (error) {
     console.log(error)
         res.status(500).send({
             message:"Internal Server Error",
             error:error.message
         })
    }
 }
  //To login 
  const login = async(req,res)=>{
    try {
      let user = await userModel.findOne({ email: req.body.email });
      if(user){
           let hashCompare = await Auth.hashCompare(req.body.password,user.password)
           if(hashCompare){
  
            let token = await Auth.createToken({
              name: user.name,
              email: user.email,
              role:user.role
              
            })
            res.status(200).send({
              message: "User Logged in successfully",
              token
            });
           }
           else{
              res.status(400).send({
              message: `Account with ${req.body.email} entered Invalid password`
              
            });
           }
      }
      else{
        res.status(400).send({
          message: `Account with ${req.body.email} is invalid doesn't exists`,
         
        });
      }
    } catch (error) {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  //To Reset password
  const forgotPassword = async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email }, { password: 0 });

        if (user) {
            // Generate a unique token for password reset
            let code;
            let isCodeUnique = false;

            // Keep generating a new code until it is unique
            do {
                code = crypto.randomBytes(20).toString('hex');
                // Check if the code is unique
                isCodeUnique = !(await userModel.exists({ resetToken: code }));
            } while (!isCodeUnique);

            // Save the token in the user document
            user.resetToken.push(code);
            await user.save();

           

            // Send the reset URL via email
            await emailService.forgetPassword({name: user.name,code,email:req.body.email});

           
            res.status(200).send({
                message: 'Reset Password verification code sent. Please check your email and confirm.',
                code, 
            });
        } else {
            res.status(400).send({
                message: `Account with ${req.body.email} does not exist`,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Internal Server Error',
            error: error.message,
        });
    }
};



  //To create new password
  const resetPassword = async(req,res)=>{
    try {
        let token = req.headers.authorization?.split(" ")[1]
         let data = await Auth.decodeToken(token)
  
         if(req.body.newpassword === req.body.confirmpassword)
         {
            let user = await userModel.findOne({email:data.email})
            user.password = await Auth.hashPassword(req.body.newpassword)
            await user.save()
  
            res.status(200).send({
                message:"Password Updated Successfully",
            })
         }
         else
         {
            res.status(400).send({
                message:"Password Does Not match",
            })
         }
    } catch (error) {
     console.log(error)
         res.status(500).send({
             message:"Internal Server Error",
             error:error.message
         })
    }
  }


  export default {
    getUsers,
    createUsers,
    login,
    forgotPassword,
    resetPassword
  };