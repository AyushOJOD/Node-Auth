import { name } from 'ejs';
import express from 'express';
import path from "path";
import mongoose, { now } from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

const app = express();
const users = [];

app.set("view engine", "ejs"); // Setting up view engine

app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());





mongoose.connect("mongodb+srv://rishiustaad:admin@project1.kpxuapn.mongodb.net/",{
    dbName: "backend",
}).then(c => console.log("Data base Connected")).catch(e => console.log(e));


// For inserting elements inside DB we first create a schemea using mongoose.Schema
const userSchema = new mongoose.Schema({
    name: String, 
    email: String,
    password: String
});



const User = mongoose.model("Users", userSchema); // Then we create a model with the collection and schema name.

// app.get("/products", (req,res) => {      USE IT FOR TESTING
//     res.json({
//         "id": 12356789,  
//         products: []
//     })
// });

const isAuthenticated = async(req,res,next) => {
    const {name} = req.cookies;

    if(name){

        const decoded = jwt.verify(name, "aifaighghwgwfhuf");
        
        req.user = await User.findById(decoded._id);

        next(); // when next is called it gives the control to the next arrow function ie in the next route
    }
    else{
        res.redirect('/login');
    }
    
}

app.get("/", isAuthenticated, (req, res) => {
    res.render("logout", {name: req.user.name});
});

app.get('/register', (req,res) => {
    res.render("register");
});


app.post('/register', async(req,res) => {

    const {name, email, password} = req.body;

    let user =  await User.findOne({email});   // We have acceses the User from DB to find if email exists.
    if(user){
        res.redirect('/login');
    }
    else{

        const hashedPassword = await bcrypt.hash(password,10)

        user = await User.create({name,email,password: hashedPassword});

        const token = jwt.sign({_id: user._id}, "aifaighghwgwfhuf");

        res.cookie("name",token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60*1000),

        }); 
        res.redirect('/')
    }

    ;
});

app.get("/login", (req,res) =>{
    res.render("login");
});

app.post("/login", async(req,res) => {
    const {email, password} = req.body;

    let user = await User.findOne({email});

    if(!user) res.redirect("/register");
    else{
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.render("login", { message: "Incorrect Password"});
        }
        else{

            const token = jwt.sign({_id: user._id}, "aifaighghwgwfhuf");
    
            res.cookie("name",token, {
            httpOnly: true,
            expires: new Date(Date.now() + 60*1000),
    
            }); 
            res.redirect('/');
        }
    }
})

app.get('/logout', (req,res) => {
    res.cookie("name",null, {
        expires: new Date(Date.now()),

    }); 
    res.redirect('/');
});


app.listen(5000, () => {
    console.log('Server is Working');
})