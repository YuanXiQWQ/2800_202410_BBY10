import { exercises } from "../model/exercises.js";
import { User } from "../model/User.js";

async function getUserId(username) {
  const user = await User.findOne({ username }).select("_id");

  return user._id;
}

export async function getListOfExercises(req, res) {
  const userid = await getUserId(req.session.userData.username);

  const data = await exercises.findOne({ user: userid });

  return {
    ...data,
    exercises: data.exercises.map((ele) => ({
      ...ele,
      start: formatDate(ele?.start),
    })),
  };
}

function formatDate(date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}
