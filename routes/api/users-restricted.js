const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

// Aws
const aws = require('aws-sdk');
const awsConfig = require('../../config/aws-keys');

// Load User model
const User = require("../../models/User");

const storage = multer.diskStorage({
	// destination: (req, file, cb) => {
	// 	cb(null, './avatar-images');
	// },
	// filename: (req, file, cb) => {
	// 	cb(null, new Date().toISOString() + file.originalname);
	// }
});

const upload = multer({storage, limits: {
	fileSize: 1024 * 1024 * 16
}});

// Load input validation
const validateUpdateUserInput = require("../../validation/update-user");
const validateUpdateUserPasswordInput = require("../../validation/update-user-password");

module.exports = (passport) => {

	// @route POST api/restricted-users/update-user-avatar-picture
	// @desc Update user data
	// @access Authentication needed
	router.post("/update-user-avatar-picture", 
		  passport.authenticate('jwt', { session: false }),
		  upload.single('avatarPicture'),
		  async (req, res) =>  { 
		  	try {
		  		// Check if image was sent
		  		if(!req.hasOwnProperty('file')){
				    return res.status(400).json('Image was not sent.');
				} 

				// Check if user id was sent
		  		if(!req.body.id){
				    return res.status(400).json('user id was not sent.');
				}

		  		// Check if currently chosen picture is in right format
		        if (req.file.mimetype !== 'image/gif' && req.file.mimetype !== 'image/png'
		        && req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/jpg') {
		        	return res.status(400).json('Please only choose png, jpeg, jpg or gif.');
		        }

		  		// FETCHING ALL BUCKET DATA
		  		// aws.config.setPromiseDependency();
		  		aws.config.update({
		  			accessKeyId: awsConfig.AWSAccessKeyId,
		  			secretAccessKey: awsConfig.secretKey,
		  			region: awsConfig.region
		  		});

		  		const s3 = new aws.S3();
		  		// const response = await s3.listObjectsV2({
		  		// 	Bucket: 'voice-social-network'		  			
		  		// }).promise();

		  		// console.log(response);
		  		// END OF FETCHING ALL BUCKET DATA

		  		// res.status(201).json({response.Contents[1]});
		  		// console.log(response.Contents[1])

		  		// res.status(201).json({});
		  		


		  		const imageFile = req.file;
		  		// console.log(req.body.avatarPictureOriginalName);
		  		const fileName = new Date().toISOString() + req.body.avatarPictureOriginalName;
		  		imageFile.filename = fileName;

		  		// Uploading image to AWS S3 BUCKET
		  		const params = {
			         Bucket: 'voice-social-network', // bucket name
			         Key: 'avatar-pictures/' + fileName, // file will be saved with new unique name
			         Body: fs.createReadStream(req.file.path)
			     };
			     
		     	s3.upload(params, async function(s3Err, data) {
			         if (s3Err) throw s3Err;			    

				    // Delete the old picture from aws s3
			         var params = {  Bucket: 'voice-social-network', Key: req.body.currentPicturePath };
			         await s3.deleteObject(params).promise();
						    
						
			        // Update users avatar picture path in mongodb
			    	const updateResult = await User.updateOne(
		              { _id: req.body.id }, 
		              {$set: {avatarImage: data.Location}}
	          		);

			    	if (!data)
			    		res.status(400).json({errors: "Error uploading picture to aws s3"});
			        console.log(`File uploaded successfully at ${data.Location}`); 
		     	});
			    

		  		res.status(201).json("Successfully updated profile picture");
		  	} catch (e) {
		  		res.status(400).json({errors: {full_error: e, error_message: e.message}});
		  	}
		  }
	);

	// // @route POST api/restricted-users/update-user-avatar-picture
	// // @desc Update user data
	// // @access Authentication needed
	// router.post("/update-user-avatar-picture", 
	// 	  passport.authenticate('jwt', { session: false }),
	// 	  upload.single('avatar-picture'),
	// 	  async (req, res) =>  { 
	// 	  	console.log(req.file);
	// 	  	// res.status(201).json({req.file});
	// 	  }
	// );

	// @route POST api/restricted-users/update-user-data
	// @desc Update user data
	// @access Authentication needed
	router.post("/update-user-data", 
		  passport.authenticate('jwt', { session: false }),
		  async (req, res) =>  { 
		  	// Form validation
	  		const { errors, isValid } = validateUpdateUserInput(req.body);
	  		// Check validation
		    if (!isValid) {
		      return res.status(400).json(errors);
		    }

		    // Update the use information
		    try {
			    	const updateResult = await User.updateOne(
		              { _id: req.body.id }, 
		              {$set: {name: req.body.name}}
	          		);
	        		res.status(201).json(updateResult);
		    } catch (e) {
		    	res.status(400).json({errors: e.message});
		    }
		    
		  }
	);

	// @route POST api/restricted-users/update-user-password
	// @desc Update user password
	// @access Authentication needed
	router.post("/update-user-password",
		passport.authenticate('jwt', { session: false }),
		async (req, res) => { 
			// Form validation
	  		const { errors, isValid } = validateUpdateUserPasswordInput(req.body);
	  		// Check validation
		    if (!isValid) {
		      return res.status(400).json(errors);
		    }

		    // Find user by id
		    User.findOne({ _id: req.body.id }).then(user => {
		      // Check if user exists
		      if (!user) {
		        return res.status(404).json({ userNotFound: "User not found" });
		      }

		  // Check password
		      bcrypt.compare(req.body.password, user.password).then(async isMatch => {
		        if (isMatch) {

		          // Password was correct, updating password
				    try {

				    		// Hash password before saving in database
					        bcrypt.genSalt(10, (err, salt) => {
					          bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
					            if (err) throw err;
					            user.password = hash;
					            user
					              .save()
					              .then(user => res.status(201).json(user))
					              .catch(err => res.status(400).json({errors: err.message}));
					          });
					        });

				    } catch (e) {
				    	res.status(400).json({errors: e.message});
				    }
		 	
		        } else {
		          return res
		            .status(400)
		            .json({ password: "Password incorrect" });
		        }
		      });
		    });
		});

	// @route POST api/restricted-users/get-user-data
	// @desc Fetch user data
	// @access Authentication needed
	// TODO don't sent current password
	router.post("/get-user-data",
		passport.authenticate('jwt', { session: false }),
		async (req, res) => {
			let user;
		    if (req.body.id){
		    	try {
		    		user = await User.find( { _id: req.body.id } );
		    	} catch (e) {
		    		res.status(400).json({errors: e.message});
		    	}
		    } else {
		    	res.status(400).json({errors: "User id wasn't provided!"});
		    }

		    if (user) {
		      res.status(201).json({name: user[0].name, email: user[0].email, avatarImage: user[0].avatarImage});
		    }
		});



	return router;
}

