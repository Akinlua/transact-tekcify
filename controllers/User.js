const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())

const {Records} = require('../model/records')
const {Transact, transactSchema, ComapnyAccEnum} = require('../model/transact')
const noLayout = '../views/layouts/nothing.ejs'
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const jwtSecret = process.env.JWT_SECRET
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const generateToken = require('../middleware/token')

const {authMiddleware} = require('../middleware/authentication.js')
const {Notice} = require('../model/notification')


const registerPage = async (req, res) => {

    let error = ""
    res.render('admin/register', {layout: noLayout, error})

}
const postRegister = async (req,res) => {

    try {
        // create dummy companyID array
        let company_id = ["2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999", "1010", "1111", "1110", "2110", "1100", "1000", "0000", "1001", "1011", "2220", "2200", "2020"]
        const {username, password, companyID, email} = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        let error = ""
        if(!company_id.includes(companyID) ) {
            error = "Unnacceptable Comapny's ID"
            return res.render('admin/register', {layout: noLayout, error})
            // return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Unnacceptable Comapny's ID"})
        }

        const user = await User.create({username, password: hashedPassword, companyID, email})
        const token =  await jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
        res.cookie('token', token, {httpOnly: true})

        res.redirect('/')
    }  catch (error) {

        let error_ = "Username or Email already Exists "
        return res.render('admin/register', {layout: noLayout, error: error_})
    }    
    // res.status(201).json({message: 'User created', user})
}

const loginPage = async (req, res) => {
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)

    let error = ""
    res.render('admin/login', {layout: noLayout, notifications, error})
}

const postLogin = async (req, res) => {
    // const {username, password} = req.body
    const username = req.body.username
    const password = req.body.password

    const user = await User.findOne({username})
    console.log(username, password)

    let error = ""
    if(!user) {
        error = "Invalid credentials"
        return res.render('admin/login', {layout: noLayout, error})
        // return res.json(error)
        // return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Invalid credentials"})
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
        error = "Invalid credentials"
        return res.render('admin/login', {layout: noLayout, error})
        // return res.json(error)
        // return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Invalid credentials"})
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_LIFETIME})
    res.cookie('token', token, {httpOnly: true})

    res.redirect('/')
}

const logout = async (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/login');
}
/////////////////REST PASSWORD /////////////////////////

const resetPasswordPage = async (req, res) => {
    res.render('admin/reset_password', {layout: noLayout})
}

const forgotPasswordPage = async (req, res) => {
    res.render('admin/forgot_password', {layout: noLayout})
}

// post 
const forgotPassword = async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "Email not Found"})
    }

    //generate a unique reset token
    const resetToken = generateToken(10)
    console.log(resetToken)
    // could create a expiration time

    user.resetToken = resetToken
    await user.save()

    //send the reset email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: "test@gmail.com",
            pass: 'testpassword'
        }
    })

    const mailOptions = {
        from: '',
        to: email,
        subject: 'Password Reset',
        text: `Click on this link to reset your password: http://resetPassword?token=${resetToken}`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 500, message: "Error sending reset email"})
        }

        // OR send a page with succesful request, create a succes page
        res.redirect('/login')
    })

}

// post
const resetPassword = async (req, res) => {

    const {token, newPassword} = req.body

    if( !token) {
        return res.render("errors/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No user found"})

    }
    console.log(token, newPassword)
    const user = await User.findOne({resetToken: token})
    console.log(user)
    if (!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Not Found",statusCode: 404, message: "No user found"})
    }

    //validate the expiration time here

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    user.resetToken = undefined
    await user.save()
    
    res.redirect('/login')

}

const userPage = async (req, res) => {
    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (currentUser) {
        current_user = currentUser
    }
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)


    res.render('admin/user_page', {current_user, notifications})
}

const editUserPage = async (req, res) => {
    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (req.userId !== req.params.id) {
        return res.render("errors/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You cannot perform any action, you are unauthorized"})
    }
    if (currentUser) {
        current_user = currentUser
    }
    const user = await User.findOne({_id: req.params.id })
    if (!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID"})
    }
    const notifications = await Notice.find({}).sort("-createdAt").limit(3)


    res.render('admin/edit-page', {current_user, user, notifications})
}
const editUser = async (req, res) => {
    const {username, email, companyID} = req.body
    let company_id = ["2222", "3333", "4444", '5555', "6666", "7777", "8888", "9999", "1010", "1111", "1110", "2110", "1100", "1000", "0000", "1001", "1011", "2220", "2200", "2020"]
    if (req.userId !== req.params.id) {
        return res.render("errors/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You cannot perform any action, you are unauthorized"})
    }
    if(!company_id.includes(companyID) ) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Unnacceptable Comapny's ID"})
    }
    const user = await User.findOneAndUpdate({_id: req.params.id}, {username, email, companyID}, { new: true, runValidators: true})
    if (!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID"})
    }
    res.redirect('/user-page')
}

const deleteUserPage = async (req, res) => {
    let current_user = null
    const currentUser = await User.findById(req.userId)
    if (req.userId !== req.params.id) {
        return res.render("errors/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You cannot perform any action, you are unauthorized"})
    }
    if (currentUser) {
        current_user = currentUser
    }
    const user = await User.findOne({_id: req.params.id })
    if (!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID"})
    }

    const notifications = await Notice.find({}).sort("-createdAt").limit(3)


    res.render('admin/delete',{current_user, user, notifications})
}
const deleteUser = async (req, res) => {
    if (req.userId !== req.params.id) {
        return res.render("errors/error-500", {layout: noLayout, name: "Unauthorized",statusCode: 401, message: "You cannot perform any action, you are unauthorized"})
    }
    const user = await User.findOneAndDelete({_id: req.params.id})
    if (!user) {
        return res.render("errors/error-500", {layout: noLayout, name: "Bad Request",statusCode: 400, message: "Bad request, wrong ID"})
    }
    res.clearCookie('token');

    res.redirect('/login')
}
module.exports = {
    registerPage,
    postRegister,
    loginPage,
    postLogin,
    logout,
    forgotPassword,
    resetPassword,
    forgotPasswordPage,
    resetPasswordPage,
    userPage,
    editUserPage,
    editUser,
    deleteUser,
    deleteUserPage,
}


