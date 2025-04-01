import express from 'express';
import {signupUser, loginUser,verifyToken, getMutualFriends, getUserFriends, searchUsersByName,verify } from '../controller/users.js';

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken,verify);
router.get('/mutual-friends', getMutualFriends);
router.get('/friends', getUserFriends);
router.get('/search', searchUsersByName);

export default router;
