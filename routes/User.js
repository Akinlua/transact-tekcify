const express = require('express')
const router = express.Router()
const { registerPage,
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
    deleteUserPage,} = require('../controllers/User')
const {authMiddleware} = require('../middleware/authentication.js')


router.get('/register', registerPage)
router.get('/login', loginPage)
// router.get('/register', getRegister)
router.post('/register', postRegister)
// router.get('/login', getLogin)
router.post('/login', postLogin)
router.get('/logout',authMiddleware, logout)

//reset Password
router.get('/forgot-password', forgotPasswordPage) //page that accepts email so as to send email with the link to reset
router.get('/resetPassword', resetPasswordPage) // page that accepts the new password and resetToken

router.post('/forgot-password', forgotPassword) //page that accepts email so as to send email with the link to reset
router.post('/resetPassword', resetPassword)
router.get('/user-page',authMiddleware, userPage)
router.get('/edit-user/:id', authMiddleware, editUserPage)
router.patch('/edit-user/:id', authMiddleware, editUser)
router.get('/delete-user/:id',authMiddleware, deleteUserPage)
router.delete('/delete-user/:id', authMiddleware, deleteUser)


module.exports = router