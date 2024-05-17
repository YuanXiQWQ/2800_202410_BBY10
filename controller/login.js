import {findByUsername, validatePassword} from './auth.js';

export async function logIn(req, res) {
    const {username, password} = req.body;
    try {
        const user = await findByUsername(username);
        if (!user) {
            return res.status(404).json({message:'User not found', success: false});
        }
        const isMatch = await validatePassword(user, password);
        if (!isMatch) {
            return res.status(400).json({message:'Invalid password', success: false});
        }
        req.session.userData = user;
        res.redirect("/profile");
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({message:'Internal Server Error', success: false});
    }
}
