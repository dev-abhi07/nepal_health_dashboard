const express = require('express');
const { login, createUser, UserList,updateUser, updateUserStatus } = require('../conntroller/auth/login');
const router = express.Router();


router.post('/login',login)
router.post('/create-user',createUser)
router.post('/get-user-list',UserList)
router.post('/update-user',updateUser)
router.post('/update-user-status',updateUserStatus)
module.exports = router