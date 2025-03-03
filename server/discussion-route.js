const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()
const User = require('../models/user')



module.exports = router