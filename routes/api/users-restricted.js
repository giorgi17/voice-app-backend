const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const TimeFormat = require('hh-mm-ss');

// Aws
const aws = require('aws-sdk');
const awsConfig = require('../../config/aws-keys');

// Load Models
const User = require("../../models/User");
const Post = require("../../models/Post");

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
	// Set configuration for aws s3 
	aws.config.update({
		  			accessKeyId: awsConfig.AWSAccessKeyId,
		  			secretAccessKey: awsConfig.secretKey,
		  			region: awsConfig.region
					});

	// @route POST api/restricted-users/get-user-search-result-data
	// @desc Fetch search results
	// @access Authentication needed
	router.post("/get-user-search-result-data",
		passport.authenticate('jwt', { session: false }),
		async (req, res) => {
			let users;
		    if (req.body.searchText){
		    	try {
		    		const searchText = req.body.searchText;
		    		const splitText = searchText.split(' ');
		    		const splitTextFiltered = splitText.filter(item => {
		    			return item !== '';
		    		});
		    		let finalStringForRegex = splitTextFiltered.join('|');
		    		const regexp = new RegExp(finalStringForRegex, 'i');
		    		users = await User.find({name: {$regex: regexp}}, {name: 1, avatarImage: 1});
		    		// return res.status(400).json({users});
		    	} catch (e) {
		    		res.status(400).json({errors: e.message});
		    	}
		    } else {
		    	res.status(400).json({errors: "Searchtext wasn't provided!"});
		    }

		    if (users) {
		      res.status(201).json({users});
		    }
		});

	// @route POST api/restricted-users/get-post-author-user-posts
	// @desc Get post author posts based on page number
	// @access Authentication needed
	router.post("/get-post-author-user-posts", 
		  passport.authenticate('jwt', { session: false }),
		  async (req, res) =>  {
		    // Fetch the posts
		    try {
		    	// If user profile is opened through search 'user_id' is sent else 'id' is sent for post id
		    	let user_id;
		    	if (req.body.user_id) {
		    			user_id = req.body.user_id;
		    		} else if (req.body.id) {
		    			let post = await Post.findOne( { _id: req.body.id } );
		    			user_id = post.user_id;
		    		}

		    	// let post = await Post.findOne( { _id: req.body.id } );
		        let page = parseInt(req.body.page);
		        const posts = await Post.find({ user_id: user_id })
		            .sort( { created_at: -1 } )
		            .skip(page).limit(page+10);

		        const postsTransformed = await Promise.all(posts.map( async item => {
		        	// Calculate duration for each audio and return as string
		        	const itemObj = item.toObject();
		        	await getAudioDurationInSeconds(itemObj.sound).then((duration) => {
					  const secondsRounded = Math.round(duration);
					  itemObj.audio_duration =  TimeFormat.fromS(secondsRounded, 'hh:mm:ss'); 
					});

		        	// Find user by id for profile image and username
		    		await User.findOne({ _id: itemObj.user_id }).then(user => {
		    			itemObj.profile_picture = user.avatarImage;
		    			itemObj.user_name = user.name;
		    		});

		        	delete itemObj.user_id;
		        	return itemObj;
		        }));

		        res.status(201).json(postsTransformed);  
		    } catch (err) {
		        res.status(400).json({error: err.message});
		    }
		    
		  }
	);

	// @route POST api/restricted-users/get-post-author-user-data
	// @desc Fetch user data for post author
	// @access Authentication needed
	router.post("/get-post-author-user-data",
		passport.authenticate('jwt', { session: false }),
		async (req, res) => {
			let user;
		    if (!req.body.id || !req.body.user_id){
		    	try {
		    		// If user profile is opened through search 'user_id' is sent else 'id' is sent for post id
		    		let user_id;
		    		if (req.body.user_id) {
		    			user_id = req.body.user_id;
		    		} else if (req.body.id) {
		    			let post = await Post.findOne( { _id: req.body.id } );
		    			user_id = post.user_id;
		    		}

		    		user = await User.findOne( { _id: user_id } );
		    	} catch (e) {
		    		res.status(400).json({errors: e.message});
		    	}
		    } else {
		    	res.status(400).json({errors: "User id wasn't provided!"});
		    }

		    if (user) {
		      res.status(201).json({name: user.name, email: user.email, avatarImage: user.avatarImage});
		    }
		});

	// @route POST api/restricted-users/get-posts-with-page
	// @desc Get posts based on page number
	// @access Authentication needed
	router.get("/get-posts-with-page", 
		  passport.authenticate('jwt', { session: false }),
		  async (req, res) =>  {
		    // Fetch the posts
		    try {
		        let page = parseInt(req.query.page);
		        const posts = await Post.find()
		            .sort( { created_at: -1 } )
		            .skip(page).limit(page+10);

		        const postsTransformed = await Promise.all(posts.map( async item => {
		        	// Calculate duration for each audio and return as string
		        	const itemObj = item.toObject();
		        	await getAudioDurationInSeconds(itemObj.sound).then((duration) => {
					  const secondsRounded = Math.round(duration);
					  itemObj.audio_duration =  TimeFormat.fromS(secondsRounded, 'hh:mm:ss'); 
					});

		        	// Find user by id for profile image and username
		    		await User.findOne({ _id: itemObj.user_id }).then(user => {
		    			itemObj.profile_picture = user.avatarImage;
		    			itemObj.user_name = user.name;
		    		});

		        	delete itemObj.user_id;
		        	return itemObj;
		        }));

		        res.status(201).json(postsTransformed);  
		    } catch (err) {
		        res.status(400).json({error: err.message});
		    }
		    
		  }
	);

	// @route POST api/restricted-users/add-new-post
	// @desc Add new post
	// @access Authentication needed
	router.post("/add-new-post", 
		  passport.authenticate('jwt', { session: false }),
		  upload.fields([{
          	name: 'postSound', maxCount: 1
          }, {
          	name: 'postPicture', maxCount: 1
          }]),
		  async (req, res) =>  {
		  	let soundFileName = null, pictureFileName = null, uploadedSoundLink = null, uploadedImageLink = null;

		  	// Check if recorded voice is sent and send error if not change it's name
		  	if (!req.files.postSound) {
		  		return res.status(400).json({errors: "Recorded voice wasn't sent"});
		  	} else {
		  		soundFileName = new Date().toISOString() + 'soundFile.mp3';
		  		req.files.postSound[0].filename = soundFileName;
		  	}

		  	// Check if image was sent and if so, change it's name
		  	if (req.files.postPicture) {
			  	const imageFile = req.files.postPicture[0];
		  		pictureFileName = new Date().toISOString() + imageFile.originalname;
		  		imageFile.filename = pictureFileName;
		  	} 

		  	const s3 = new aws.S3();	

		  	// Uploading audio to AWS S3 BUCKET
	  		const audioUploadParams = {
		         Bucket: 'voice-social-network', // bucket name
		         Key: 'posts-audio/' + soundFileName, // file will be saved with new unique name
		         Body: fs.createReadStream(req.files.postSound[0].path)
		         };
	    	const audioUploadResult = s3.upload(audioUploadParams).promise();
	    	await audioUploadResult.then(data => {
	    		uploadedSoundLink = data.Location
	    		console.log(`The audio file was successfully uploaded - ${data.Location}`)
	    	}).catch(err => {
	    		return res.status(400).json({errors: 'Error while uploading audio file - ' + err});
	    	});

		    // Uploading image to AWS S3 BUCKET
		    if (!req.files.postPicture) {
		    	uploadedImageLink = 'https://voice-social-network.s3.us-east-2.amazonaws.com/post-pictures/stripes.png';
		    } else {
		    	const pictureUploadParams = {
		         Bucket: 'voice-social-network', // bucket name
		         Key: 'post-pictures/' + pictureFileName, // file will be saved with new unique name
		         Body: fs.createReadStream(req.files.postPicture[0].path)
		         };
			    const pictureUploadResult = s3.upload(pictureUploadParams).promise();
			    await pictureUploadResult.then(data => {
			    	uploadedImageLink = data.Location;
		    		console.log(`The picture file was successfully uploaded - ${data.Location}`);
		    	}).catch(err => {
		    		return res.status(400).json({errors: 'Error while uploading picture file - ' + err});
		    	});
		    }
	  		
		    // Update the use information
		    const newPost = new Post({
	          user_id: req.body.user_id,
	          picture: uploadedImageLink,
	          sound: uploadedSoundLink,
	          description: req.body.description
	        }).save()
              .then(post => res.status(201).json("Post saved successfully"))
              .catch(err => res.status(400).json({errors: "Error while saving post to database - " + err}));
		  }
	);

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
		  		// aws.config.update({
		  		// 	accessKeyId: awsConfig.AWSAccessKeyId,
		  		// 	secretAccessKey: awsConfig.secretKey,
		  		// 	region: awsConfig.region
		  		// });

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
		    		user = await User.findOne( { _id: req.body.id } );
		    	} catch (e) {
		    		res.status(400).json({errors: e.message});
		    	}
		    } else {
		    	res.status(400).json({errors: "User id wasn't provided!"});
		    }

		    if (user) {
		      res.status(201).json({name: user.name, email: user.email, avatarImage: user.avatarImage});
		    }
		});



	return router;
}

