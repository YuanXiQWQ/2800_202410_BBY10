import { exercises } from "../model/exercises.js";
import { User } from "../model/User.js";


async function getUserId(username) {
  const user = await User.findOne({ username }).select("_id");
  return user._id;
}

export async function getListOfExercises(req, res) {
  const userid = await getUserId(req.session.userData.username)

  const data = await exercises
    .findOne({ user: userid })
    .sort({ createdAt: -1 });

  return res.render("exercises", { data : data?.exercises});
}
