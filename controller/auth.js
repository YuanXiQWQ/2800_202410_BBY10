import bcrypt from 'bcrypt';
import {findByUsername, validatePassword} from '../model/user.js';

export function register() {

}

export function login() {

}

export async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;

    try {
            const user = await findByUsername(req.session.username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await validatePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}