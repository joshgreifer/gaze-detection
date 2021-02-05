/**
 * @file CustomElement.ts
 * @author Josh Greifer <joshgreifer@gmail.com>
 * @copyright © 2020 Josh Greifer
 * @licence
 * Copyright © 2020 Josh Greifer
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @summary Sample custom element tobe used as a template
 * This is part of my Typescript express starter application,  which provides
 * very minimal skeleton code for custom HTML tags, simple paging, and API access.
 *
 * The starter application was designed to be as lean as possible - its only dependencies
 * are express and eventemitter3.
 *
 */
import {enterFullscreen} from "./util";

import * as glMatrix from "gl-matrix";
import {mat4} from "gl-matrix";

interface ProgramInfo {
    attribLocations: {
        vertexPosition: number;
        vertexColor: number;
    };
    program: WebGLProgram | null;
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation | null;
        modelViewMatrix: WebGLUniformLocation | null;
    };
}

export class GazeTargetElement extends HTMLElement {


    public X: number = 0;
    public Y: number = 0;


    public guessX: number = 0;
    public guessY: number = 0;


    public GetTarget() {
        const target = [this.X, this.Y];
        console.log(`*** TARGET: ${target}`);
        return target;
    }

    public set Guess(guess: number[]) {
        this.guessX = guess[0];
        this.guessY = guess[1];
    }
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
        const style = document.createElement('style');
        const my_height = window.screen.height;   // example of how to interpolate value in style
        const my_width = window.screen.width;



        canvas.height = my_height;
        canvas.width = my_width;
        canvas.addEventListener('click', async ()=> {
            await enterFullscreen(canvas);
        });
        // noinspection CssInvalidFunction,CssInvalidPropertyValue
        style.textContent = `
        canvas {
            position: absolute;
            background-color: #000000;
            width: ${my_width}px;
            height: ${my_height}tpx;
        }
        .target {
            z-index: 1;
            position: absolute;
            width: 24px;
            height: 24px;
            top: 200px;
            left: 200px;
            background-color: red;
            border-radius: 50%;
            box-shadow: 0 6px 10px 0 rgba(0,0,0,0.3);
        }
`;
        shadow.append(style, canvas);
        const fillCircle = (context: CanvasRenderingContext2D, color: string | CanvasGradient | CanvasPattern, cx: number, cy: number, r: number) =>{

            context.save(); // save state
            context.beginPath();

            context.translate(cx-r, cy-r);
            context.scale(r, r);
            context.arc(1, 1, 1, 0, 2 * Math.PI, false);

            context.restore(); // restore to original state
            //       context.stroke();
            context.fillStyle = color;
            context.fill();
        };

        const ctx = canvas.getContext("2d", { antialias: true }) as CanvasRenderingContext2D;

        let then = performance.now();
        const target_persistence_time_ms = 5000;
        let alpha = 0.0;
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        const paint = (now: number) => {

            if (now - then > target_persistence_time_ms) {
                then = now;
                alpha = 0.0;
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.X = x / canvas.width;
            this.Y = y / canvas.height;

            fillCircle(ctx, `rgb(255,255,118, ${alpha})`, x, y, 32 * alpha);
            alpha += .01;
            if (alpha > 1.0)
                alpha = 1.0;

            // Guess
            fillCircle(ctx, `rgb(255,0,0,.5)`, this.guessX * canvas.width, this.guessY * canvas.height, 16);

            requestAnimationFrame(paint);
        };
        requestAnimationFrame(paint);
      }

}