import {FaceFeatureDetector} from "./FaceFeatureDetector";
import {GazeTargetElement} from "./GazeTargetElement";
import {GazePredictor} from "./GazePredictor";

customElements.define('gaze-target-element', GazeTargetElement);

const video = document.querySelector("video") as HTMLVideoElement;
const gazeTargetElement : GazeTargetElement = document.querySelector("gaze-target-element") as GazeTargetElement;
const faceFeatureDetector: FaceFeatureDetector = new FaceFeatureDetector(video);
// 478 is size of face detector mesh
const faceDetectorMeshShape = [478 * 3];
faceFeatureDetector.load().then(() => {
    const gazePredictor: GazePredictor = new GazePredictor(faceDetectorMeshShape, faceFeatureDetector, gazeTargetElement);
});

