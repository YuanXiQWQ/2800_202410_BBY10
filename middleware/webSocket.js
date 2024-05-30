import { WebSocketServer } from "ws";
import { analyzeSquatForm, detectPose, load } from "../controller/tracking.js";
const wss = new WebSocketServer({ port: 3001 });
import sharp from "sharp";
import { dataUriToBuffer } from "data-uri-to-buffer";

export default function runWebSocket() {
  wss.on("connection", function connection(ws) {
    ws.on("message", async function incoming(message) {
      try {
        // Convert the data URI to a Buffer
        const imageBuffer = await dataUriToBuffer(message);

        // Use sharp to convert the image buffer to PNG format
        const nodeBuffer = Buffer.from(imageBuffer.buffer);

        sharp(nodeBuffer)
          .toFormat("png")
          .toBuffer()
          .then(async (buffer) => {
            console.log("PNG buffer length:", buffer.length);
            const poses = await detectPose(buffer);
            console.log("Detected Poses:", poses);

            if (poses.length > 0) {
              console.log(poses[0]);
              const squatAnalysis = analyzeSquatForm(poses[0]);
              ws.send(
                JSON.stringify({ ...squatAnalysis, keypoints: poses[0].keypoints })
              );
            } else {
              ws.send(JSON.stringify({ message: "No poses detected." }));
            }
            // Send pose data back to client
            // ws.send(JSON.stringify(poses));
            // You can now send this buffer or save it as a file
          })
          .catch((err) => {
            console.error("Error processing image with Sharp:", err);
          }); // Here you can send back the PNG buffer, save it, or perform further processing
        console.log("Image converted to PNG");

        // For example, saving to the filesystem (make sure to include the 'fs' module)
        // fs.writeFileSync('output.png', pngBuffer);

        // Or sending it back to the client
        // ws.send(pngBuffer);
      } catch (error) {
        console.error("Error processing image:", error);
        ws.send("Error processing image");
      }
    });
  });

  console.log("WebSocket server started on ws://localhost:3000");
}
