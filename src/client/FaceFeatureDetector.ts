import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import {AnnotatedPrediction} from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh";
import {enterFullscreen} from "./util";
require('@tensorflow/tfjs-backend-webgl');
// require('@tensorflow/tfjs-backend-cpu');

export class FaceFeatureDetector {
    constructor(private video: HTMLVideoElement) {
    }

    public data: any[] = [];

    public getFaceMesh!:  () => Promise<any | undefined>;


    async load() : Promise<boolean> {
        const video = this.video;
        return new Promise<boolean>(async (resolve, reject) => {
            const model = await faceLandmarksDetection.load({ maxFaces: 1, });
            const self = this;
            async function start_face_detection() {
                self.getFaceMesh = async () => {
                    const predictions = await model.estimateFaces({
                        input: video,
                        flipHorizontal: true,
                        returnTensors: false
                    });

                    if (predictions.length > 0) {
                        const prediction = predictions[0];
                        // Log right Iris
                        // const   annotations = (<any>prediction).annotations;
                        // const right_eye_iris = annotations.rightEyeIris;
                        // const [x, y, z] = right_eye_iris[0];
                        console.log(`*** FACE: Obtained face mesh`);
                        // for (let i = 0; i < right_eye_iris.length; i++) {
                        //     const [x, y, z] = right_eye_iris[i];
                        //
                        //     console.log(`*** FACE: Right Eye Iris: ${i}: [${x}, ${y}, ${z}]`);
                        // }
                        return prediction.scaledMesh;
                        /*
                        `predictions` is an array of objects describing each detected face, for example:

                        [
                          {
                            faceInViewConfidence: 1, // The probability of a face being present.
                            boundingBox: { // The bounding box surrounding the face.
                              topLeft: [232.28, 145.26],
                              bottomRight: [449.75, 308.36],
                            },
                            mesh: [ // The 3D coordinates of each facial landmark.
                              [92.07, 119.49, -17.54],
                              [91.97, 102.52, -30.54],
                              ...
                            ],
                            scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
                              [322.32, 297.58, -17.54],
                              [322.18, 263.95, -30.54]
                            ],
                            annotations: { // Semantic groupings of the `scaledMesh` coordinates.
                              silhouette: [
                                [326.19, 124.72, -3.82],
                                [351.06, 126.30, -3.00],
                                ...
                              ],
                              ...
                            }
                          }
                        ]
                        */


                        const keypoints = prediction.scaledMesh as Array<any>;
                        console.log(`*** KEYPOINTS LENGTH: ${keypoints.length}`)

                        // Log facial keypoints.
                        // for (let i = 0; i < keypoints.length; i++) {
                        //     const [x, y, z] = keypoints[i];
                        //
                        //     console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
                        // }


                        return keypoints;
                    } else {
                        console.log("No face detected");
                    }

                }
                // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
                // array of detected faces from the MediaPipe graph. If passing in a video
                // stream, a single prediction per frame will be returned.
                // video.onloadeddata = () => { window.requestAnimationFrame(self.do_face_detection);};

                video.onclick = async () => {
                    await enterFullscreen(video);
                    // window.requestAnimationFrame(self.do_face_detection);
                };

            }


            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function (stream) {
                        video.srcObject = stream;
                        video.onloadeddata = () => {
                            start_face_detection()
                            resolve(true);
                        };

                    })
                    .catch(function (err0r) {
                        console.log("Something went wrong!");
                    });
            }

        });

    }

}