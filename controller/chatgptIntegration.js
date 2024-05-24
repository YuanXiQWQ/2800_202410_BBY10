import { sendMessageToChatGPT } from "./ChatGPT.js";
import { generatePrompt } from "./prompt.js";
import { exercises } from "../model/exercises.js";
import { User } from "../model/User.js";

async function getUserId(username) {
  const user = await User.findOne({ username }).select("_id");
  return user._id;
}

function saveExercises(userId, exercise) {
  const filter = { user: userId };
  const update = { exercises: exercise };
  const options = { new: true, upsert: true }; // 'new: true' returns the modified document, 'upsert: true' creates it if it doesn't exist

  exercises.findOneAndUpdate(filter, update, options)
    .then(result => {
      console.log("Exercise saved or updated successfully:", result);
    })
    .catch(err => {
      console.error("Error during save or update operation:", err);
    });
}

export async function sendInformation(req, res) {
  const user = req.session.userData;
  const message = generatePrompt(user);

  const response = await sendMessageToChatGPT(message);
 
  const userId = await getUserId(user?.username);

   await saveExercises(userId, response);
  req.session.userData = { ...req.session.userData, id: userId };
  console.log(response);
  res.status(200).send("success")

}
