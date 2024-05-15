import bcrypt from 'bcrypt';
import {findByUsername, validatePassword} from '../model/user.js';
import { User } from '../model/user.js';


export async function register(req, res) {

    const saltRounds = 10;

    try {

        var user_name = req.body.user_name;
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var email = req.body.email;
        var birthday = req.body.birthday;
    
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    
    
        req.session.userData = {
          username: user_name,
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: hashedPassword,
          birthday: birthday
        };
    
        
    
        
        res.redirect('/additional-info');
      } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Internal Server Error');
      }
}

export async function AdditionalUserInfo(req, res){
  var weight = req.body.weight;
  var height = req.body.height;
  var workoutLevel = req.body.workoutLevel;
  var time = req.body.time;
  var goal = req.body.goal;

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

  console.log(newUser);

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