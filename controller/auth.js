import bcrypt from 'bcrypt';
//import {findByUsername, validatePassword} from '../model/user.js';
import { User } from '../model/User.js';


export async function register(req, res) {

    const saltRounds = 10;

    try {

        const user_name = req.body.username
        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const email = req.body.email
        const birthday = req.body.birthday

        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    
        req.session.userData = {
          username: user_name,
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: hashedPassword,
          birthday: birthday
        };
    
        //console.log(req.body);
        console.log(req.session.userData);
        
        res.redirect('/additional-info');
      } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Internal Server Error');
      }
}

export async function AdditionalUserInfo(req, res){
    const weight = req.body.weight
    const height = req.body.height
    const workoutLevel = req.body.workoutLevel
    const time = req.body.time
    const goal = req.body.goal

    const hashedPassword = req.session.userData.password;
  

  req.session.userData = {
    ...req.session.userData,
    weight: weight,
    height: height,
    workoutLevel: workoutLevel,
    time: time,
    goal: goal

  }

  //console.log(req.session.userData);

  const newUser = new User({
    username: req.session.userData.username, // Set username here
    first_name: req.session.userData.first_name,
    last_name: req.session.userData.last_name,
    email: req.session.userData.email,
    password: hashedPassword,
    birthday: req.session.userData.birthday,
    weight: weight,
    height: height,
    workoutLevel: workoutLevel,
    time: time,
    goal: goal
});

  //console.log(newUser);

  await newUser.save();


  res.redirect("/profile");
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