const express = require("express");
const app = express();  
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSession = require("express-session");
const flash = require("connect-flash");
const { getLoginPage, loginUser } = require("./controllers/login");
const { getSignUpPage, newUserSignUp } = require("./controllers/signup");   
const { getG2Page, enterG2Data } = require("./controllers/G2");
const { getUser, updateCarDetails } = require("./controllers/G");
const getDashboardPage = require("./controllers/dashboard");
const logOutUser = require("./controllers/logOutUser");
const authMiddleware = require("./middleware/authMiddleware");
const authAdmin = require("./middleware/authAdmin");
const ApDate = require("./models/apdate");
const User = require("./models/user");
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');



app.use(flash());
// configure the app to use bodyParser()
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Config of method override
app.use(methodOverride("_method"));
app.use(
    expressSession({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: true,
    })
);



//connect to MongoDB
mongoose
    .connect(
        "mongodb+srv://raj1401patel:Abc12345@cluster0.6qml1sf.mongodb.net/?retryWrites=true&w=majority"
    )
    .then(() => console.log("Connected to MongoDB..."))
    .catch((err) => console.log(err));



app.set("view engine", "ejs");
app.use(express.static("public"));

global.userType = "";
global.isLoggedIn = null;
app.use("*", (req, res, next) => {
    loggedIn = req.session.userId;
    next();
});


app.get("/", getDashboardPage);
app.get("/login", getLoginPage);
app.get("/admin", authAdmin, (req, res) => {
    return res.render("Admin")
});


app.post("/apdateadd", async(req, res) => {


    const doc = new ApDate({
        date: req.body.date,
        slot: req.body.slots,
        isAvail: true
    });

    await doc.save();
    const data = await ApDate.find({ date: req.body.date })

    const datas = []


    for (let index = 0; index < data.length; index++) {
        datas[index] = data[index].slot;

    }


    console.log(datas);
    console.log(data);
    console.log(data.length);

    return res.render("Admin", { date: req.body.date, datas: datas })
})

app.post("/getavailabletimeslots", async(req, res) => {
    console.log(req.body);
   

})

app.get("/Book", authMiddleware, (req, res) => {
    res.render("Book")
});


app.post("/apdateaddong2", async(req, res) => {

    const data = await ApDate.find({ date: req.body.date })


    return res.render("Book", { date: req.body.date, data: data })

});

app.post("/Bookstot", async(req, res) => {

    console.log(req.body);
    const data = await ApDate.find({ date: req.body.ap_date })
    console.log(data);
    let datas = ""

    for (let index = 0; index < data.length; index++) {
        if (data[index].slot == req.body.slots) {
            datas = data[index]._id
        }
    }

    console.log("datas" + datas);
    await User.findByIdAndUpdate(req.session.userId, { $set: { appointment: datas } })
    await ApDate.findByIdAndUpdate(datas, { $set: { isAvail: false } });
    res.render("Book", { message: "Appointment Booked !!" })

});



app.post("/user/login", loginUser);

app.get("/signup", getSignUpPage);

app.post("/users/signup", newUserSignUp);


// Render the G2 Page
app.get("/G2", authMiddleware, getG2Page);


// Posts data into the database whenever user enters the data.
app.put("/g2/new/:id", authMiddleware, enterG2Data);


// Render the G page based on the condition where user has entered license number or not.
app.get("/G", authMiddleware, getUser);


// Updates the values of car details.
app.put("/update/:id", authMiddleware, updateCarDetails);


//Log out user
app.get("/logout", logOutUser);


app.listen(3000, () => {
    console.log("App listening on port 3000");
});