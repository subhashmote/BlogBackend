

const express = require("express");
const router = express.Router();

const multer  = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })


const {registeruser,loginuser,getprofile,logoutUser,createpost,getposts,getpost,editpost} = require("../controllers/blog"); // import all the Handlers from controllers



router.post("/register",registeruser); // for registering the user
router.post("/login",loginuser);  // for login the user
router.get("/profile",getprofile);  
router.post("/logout",logoutUser);
router.post("/post",uploadMiddleware.single('file'),createpost);
router.get("/post",getposts);
router.get("/post/:id",getpost);
router.put("/post",uploadMiddleware.single('file'),editpost);


module.exports = router;