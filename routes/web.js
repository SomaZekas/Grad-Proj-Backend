//Importing packages.
const express = require('express');
const router = express.Router();

//Importing models used in this route.
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Owner = require('../models/Owner');
const Guest = require('../models/Guest');

//Importing logs module.
const addLogs = require('../modules/Log');

