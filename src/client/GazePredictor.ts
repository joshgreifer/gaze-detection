import * as tf from '@tensorflow/tfjs';
import {FaceFeatureDetector} from "./FaceFeatureDetector";
import {GazeTargetElement} from "./GazeTargetElement";
require('@tensorflow/tfjs-backend-webgl');
import * as tfvis from '@tensorflow/tfjs-vis'
export class GazePredictor {

    constructor(inputShape: tf.Shape, private dataSource: FaceFeatureDetector, private targetSource: GazeTargetElement) {
        const self  = this;
        let mesh: any;
        const model = tf.sequential({
            layers: [
                tf.layers.dense({inputShape: inputShape, units: 2048, activation: 'relu'}),
                tf.layers.dense({units: 512, activation: 'relu'}),
                tf.layers.dense({units: 32, activation: 'relu'}),
                tf.layers.dense({units: 2, activation: 'linear'}),
            ]
        });
        model.compile({
            optimizer: 'sgd',
            loss: 'meanSquaredError',
            metrics: ['accuracy', 'mse']
        });

        async function* data() {
            const x = await self.dataSource.getFaceMesh();
            mesh = x.flat();
            yield mesh;

        }

        function* target() {
            yield self.targetSource.GetTarget();
        }

        const xs = tf.data.generator(<any>data);
        const ys = tf.data.generator(target);
// We zip the data and labels together, shuffle and batch 32 samples at a time.
        const ds = tf.data.zip({xs, ys}).batch(1);

        const surface : tfvis.SurfaceInfo  = { name: 'show.fitCallbacks', tab: 'Training' };

        async function onBatchEnd(epoch: number) {
            window.requestAnimationFrame(async ()=> {
                const t: tf.Tensor = model.predict( tf.expandDims(mesh), { batchSize: 1}) as tf.Tensor
                self.targetSource.Guess =  await t.array() as number[];
                console.log(`batch ${epoch}`);
            });
        }

// Train the model for 5 epochs.
        const cbs = tfvis.show.fitCallbacks(surface, ['loss', 'acc'], { callbacks:  ['onEpochEnd'], zoomToFit : true });
        cbs.onBatchEnd = onBatchEnd;
        const train1 = async () => {
            const info = await model.fitDataset(ds, {
                epochs: 1000,
                callbacks: cbs,
            });

            console.log('Loss', info.history.loss);
            window.requestAnimationFrame(train1);
        };

        window.requestAnimationFrame(train1);

    }
}