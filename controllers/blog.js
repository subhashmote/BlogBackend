const bcrypt = require('bcrypt');
const User = require('../models/User'); // import user model Here
const jwt = require("jsonwebtoken");
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs');
const Post = require('../models/Post'); // Import your Post model

require("dotenv").config();

const JWT_SECRET = 'Subhash44871';

exports.registeruser = async (req, res) => {
    try {
        // get data
        const { username, password } = req.body;

        // If user already exists
        let existingUser = await User.findOne({ username: username });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already exists",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and insert it into the database
        const user = await User.create({
            username: username,
            password: hashedPassword // Assign the hashed password to the 'password' field
        });

        return res.status(200).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cannot register. Please try again later.",
        });
    }
};


exports.loginuser = async (req, res) => {
    try {
        // data fetch from req
        const { username, password } = req.body;

        // validate email and password
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'fill all the details',
            });
        }

        // find user by username

        let user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user does not exist",
            });
        }

        const payload = {
            username: user.username,
            id: user._id,
            role: user.role,
        };
        // check for password 
        if (await bcrypt.compare(password, user.password)) {
            // password matched

            // now create jwt token 
            let token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: "2h",
            });

            // user vale object ke andar token ko insert kar diya
            user = user.toObject();
            user.token = token;
            // password ko nahi dhejna hai user object ke andar so usko undefined kar diya
            user.password = undefined;



            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                id: user._id,
                username,
                token,
                user,
                message: "user Logged in successfully",
            });
        }
        else {
            // password not matched 
            return res.status(403).json({
                success: false,
                message: "password incorrect",
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
}


exports.getprofile = async (req, res) => {
    try {
        const { token } = req.cookies;
        const JWT_SECRET = process.env.JWT_SECRET;
        jwt.verify(token, JWT_SECRET, {}, (err, info) => {
            if (err) throw err;
            res.json(info);
        })
        // res.send(req.cookies);
    }
    catch (error) {
        console.log("Error in get  profile");
    }
}

exports.logoutUser = async (req, res) => {
    try {
        res.cookie('token', '').json("ok");
    }
    catch (error) {
        console.log("Error in Logout");
    }
}



exports.createpost = async (req, res) => {
    try {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext; // Define newPath after renaming the file
        fs.renameSync(path, newPath);

        const { token } = req.cookies;

        jwt.verify(token, JWT_SECRET, {}, async (err, info) => {
            
            if (err) throw err;

            const { title, summary, content } = req.body;
            // console.log(info.id);
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
            });

            res.json(postDoc);
        })



    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Failed to create post' }); // Sending an error response and returning
    }
};

exports.getposts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', ['username']).sort({ createdAt: -1 }).limit(20);
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

exports.getpost = async (req, res) => {
    try {
        const { id } = req.params;
        const postDoc = await Post.findById(id).populate('author', ['username']);
        res.json(postDoc);
    }
    catch (error) {
        console.log(error);
    }
}



exports.editpost = async (req, res) => {
    try {

        // res.send(req.file);
        let newPath = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const parts = originalname.split('.');
            const ext = parts[parts.length - 1];
            newPath = path + '.' + ext;
            fs.renameSync(path, newPath);
        }

        const {id,title,content,summary} = req.body;

        const postDoc = await Post.findById(id);

        const {token} = req.cookies;
        // res.send(token);

        // res.send(postDoc);

        const updatedPost = await Post.findByIdAndUpdate(id,{
            title,content,summary,cover:newPath,
        },{
            new:true,
        });

        res.send(updatedPost);
        // res.send(id);

        // res.send(newPath);

        

        // const { token } = req.cookies;

        
        // jwt.verify(token, JWT_SECRET, {}, async (err, info) => {
        //     if (err) throw err;
        //     const { id, title, summary, content } = req.body;
        //     // console.log(id);
        //     const postDoc = await Post.findById(id);
        //     // console.log(postDoc);
            // const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            // if (!isAuthor) {
            //     return res.status(400).json('you are not the author');
        //     // }
        //     // const newBlog = await Post.findByIdAndUpdate(id,title,summary,content);
        //     const newpost = await postDoc.update({
        //         title,
        //         summary,
        //         content,
        //         cover: newPath ? newPath : postDoc.cover,
        //     });

        //     res.send(newpost);
        //     // res.status(200).json({
        //     //     success:true,
        //     //     postDoc,
        //     //     message:"Post Edited Successfully",
        //     // });
        // });
        
    }
    catch (error) {
        console.log("Error in Editing the Post");
    }
}
