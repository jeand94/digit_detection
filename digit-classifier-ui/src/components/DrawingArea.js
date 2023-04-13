import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

// Define the DrawingArea component
const DrawingArea = (props) => {
    // References for canvas and its 2D context
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // State variables for drawing and capture timeout
    const [isDrawing, setIsDrawing] = useState(false);
    const [captureTimeout, setCaptureTimeout] = useState(null);

    // State variable to store the loaded model
    const [model, setModel] = useState(null);

    // useEffect hook to load the model and set up canvas and context on component mount
    useEffect(() => {
        // Function to load the model asynchronously
        const loadModel = async () => {
            const model = await tf.loadLayersModel(`${process.env.PUBLIC_URL}/model/model.json`);
            setModel(model);
        };

        // Call the loadModel function
        loadModel();

        // Set up the canvas and context
        const canvas = canvasRef.current;
        canvas.width = 140;
        canvas.height = 140;
        const context = canvas.getContext('2d');
        context.scale(1, 1);
        context.lineCap = 'round';
        context.strokeStyle = 'white';
        context.lineWidth = 7;
        contextRef.current = context;
    }, []);

    // Function to start drawing on canvas when the mouse is pressed
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    // Function to stop drawing on canvas when the mouse is released
    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);

        // Clear the capture timeout and set a new timeout for image capture
        clearTimeout(captureTimeout);
        setCaptureTimeout(
            setTimeout(() => {
                handleImageCapture();
            }, 1000)
        );
    };

    // Function to draw on canvas while the mouse is moving and pressed
    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();

        // Clear the capture timeout and set a new timeout for image capture
        clearTimeout(captureTimeout);
        setCaptureTimeout(
            setTimeout(() => {
                handleImageCapture();
            }, 1000)
        );
    };

    // Function to preprocess the image data before feeding it into the model
    const preprocessImage = (pixelData) => {
        const tensor = tf.browser.fromPixels(pixelData).resizeNearestNeighbor([28, 28]);
        const normalizedTensor = tensor.toFloat().div(tf.scalar(255));
        const inputTensor = normalizedTensor.expandDims(0);
        return inputTensor;
    };

    // Function to handle image capture and prediction
    const handleImageCapture = async () => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 28;
            canvas.height = 28;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, 28, 28);
            const imageData = ctx.getImageData(0, 0, 28, 28);

            // Check if the model is loaded, then preprocess
            // the image data, make the prediction, and pass
            // the result to the onNumberChange prop function
            if (model) {
                const inputTensor = preprocessImage(imageData);
                const outputTensor = model.predict(inputTensor);
                const prediction = outputTensor.argMax(-1).dataSync()[0];

                props.onNumberChange(prediction);
            } else {
                console.log('Model not loaded yet');
            }
        };

        // Convert the drawn image on the canvas to a data URL
        // and set it as the source of the new Image object
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 1);
        image.src = dataUrl;

        // Clear the canvas after capturing the image
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // Return the canvas element for drawing, with event listeners
    // for mouse interactions
    return (
        <canvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            style={{
                display: 'block',
                border: '1px solid black',
                backgroundColor: 'black',
                maxHeight: '140px',
                minHeight: '140px',
            }}
        />
    );
};

// Export the DrawingArea component
export default DrawingArea;

