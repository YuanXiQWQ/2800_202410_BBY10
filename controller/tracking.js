let model;

import tf from "@tensorflow/tfjs-node";
import * as poseDetection from "@tensorflow-models/pose-detection";
import sharp from "sharp";
export const load = async () => {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    // enableSmoothing: true,
    // minPoseScore: 0.7,
  };
  model = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
  console.log("Model loaded");
};

export const preprocessImage = async (imageBuffer) => {
  try {
    const convertedBuffer = await sharp(imageBuffer).toFormat("png").toBuffer();
    return convertedBuffer;
  } catch (error) {
    console.error("Error converting image:", error);
    throw error;
  }
};

export const detectPose = async (imageData) => {
  try {
    // Ensure TensorFlow is ready and the backend is initialized
    await tf.ready();
    // const processedImage = await preprocessImage(imageData);

    const imageTensor = tf.node.decodeImage(new Uint8Array(imageData), 3);

    const poses = await model.estimatePoses(imageTensor);
    // console.log(poses)
    imageTensor.dispose();

    return poses;
  } catch (error) {
    console.error("Error in pose detection:", error);
    throw error; // Rethrow or handle the error as needed
  }
};

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  return Math.abs((radians * 180.0) / Math.PI);
}

export function analyzeSquatForm(pose) {
  // Define the required keypoints for a squat analysis
  const requiredKeypoints = [
    "left_hip",
    "left_knee",
    "left_ankle",
    "right_hip",
    "right_knee",
    "right_ankle",
  ];

  // Check if all required keypoints are present and have a confidence score above a certain threshold (e.g., 0.5)
  const allKeypointsDetected = requiredKeypoints.every((keypointName) => {
    const keypoint = pose.keypoints.find((p) => p.name === keypointName);
    return keypoint && keypoint.score > 0.5; // Ensure keypoint exists and is reliably detected
  });

  if (!allKeypointsDetected) {
    return {
      message:
        "Not all required keypoints for squat analysis are detected or confident enough."
         
    }; // Could return more detailed info about what's missing if needed
  }

  // Proceed with existing angle calculations if all keypoints are present
  const leftHip = pose.keypoints.find((p) => p.name === "left_hip");
  const leftKnee = pose.keypoints.find((p) => p.name === "left_knee");
  const leftAnkle = pose.keypoints.find((p) => p.name === "left_ankle");
  const rightHip = pose.keypoints.find((p) => p.name === "right_hip");
  const rightKnee = pose.keypoints.find((p) => p.name === "right_knee");
  const rightAnkle = pose.keypoints.find((p) => p.name === "right_ankle");

  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

  // console.log(leftKneeAngle,)
  if (leftKneeAngle < 160 && rightKneeAngle < 160) {
    // Threshold angle for a good squat
    console.log("Good squat depth");
    return { message: "success", isSquat: true, extra: "Good squat depth"  };
  } else {
    console.log("Improve squat depth");
    return { message: "success", isSquat: false, extra: {leftKneeAngle, rightKneeAngle} };
  }
}


function calculateDistance(a, b) {
  return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
}

export function analyzeJumpingJack(pose) {
  const requiredKeypoints = [
      "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
      "left_wrist", "right_wrist", "left_hip", "right_hip",
      "left_ankle", "right_ankle"
  ];

  // Check if all required keypoints are present and have a confidence score above a certain threshold
  const allKeypointsDetected = requiredKeypoints.every(keypointName => {
      const keypoint = pose.keypoints.find(p => p.name === keypointName);
      return keypoint && keypoint.score > 0.5; // Ensure keypoint exists and is reliably detected
  });

  if (!allKeypointsDetected) {
      return {
          message: "Not all required keypoints for jumping jack analysis are detected or confident enough."
           
      };
  }

  // Get keypoints
  const shoulders = {
      left: pose.keypoints.find(p => p.name === "left_shoulder"),
      right: pose.keypoints.find(p => p.name === "right_shoulder")
  };
  const wrists = {
      left: pose.keypoints.find(p => p.name === "left_wrist"),
      right: pose.keypoints.find(p => p.name === "right_wrist")
  };
  const ankles = {
      left: pose.keypoints.find(p => p.name === "left_ankle"),
      right: pose.keypoints.find(p => p.name === "right_ankle")
  };

  // Calculate distances
  const armSpan = calculateDistance(wrists.left.position, wrists.right.position);
  const legSpan = calculateDistance(ankles.left.position, ankles.right.position);
  const shoulderWidth = calculateDistance(shoulders.left.position, shoulders.right.position);

  // Analyze if in correct position for jumping jack
  if (armSpan > shoulderWidth * 2 && legSpan > shoulderWidth * 1.5) {
      console.log("Correct position for a jumping jack");
      return { message: "success", lala: true , extra: "Correct position for a jumping jack"};
  } else {
      console.log("Not in correct position for a jumping jack");
      return { message: "success", lala: false, extra: "Not in correct position for a jumping jack"};
  }
}
