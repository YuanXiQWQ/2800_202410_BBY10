import { exercises } from "../model/exercises.js";

export async function getListOfExercises(req, res) {
  const userid = req.session.userData.id;

  const data = await exercises
    .findOne({ user: userid })
    .sort({ createdAt: -1 });

    

  return res.render("exercises", { data : data?.exercises});
}
