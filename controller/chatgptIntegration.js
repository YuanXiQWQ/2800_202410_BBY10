import { sendMessageToChatGPT } from "./ChatGPT.js";
import { generatePrompt } from "./prompt.js";
import { exercises } from "../model/exercises.js";
import { User } from "../model/User.js";

async function getUserId(username) {
  const user = await User.findOne({ username }).select("_id");
  return user._id;
}

function saveExercises(userId, exercise) {

  new exercises({ exercises: exercise, user: userId })
    .save()
    .then((doc) => console.log("Exercise saved successfully:"))
    .catch((err) => console.error("Error saving exercise:", err));
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
