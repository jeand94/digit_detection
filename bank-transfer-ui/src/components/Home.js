import React, { useState } from 'react';
import DrawingArea from './DrawingArea';

const Home = () => {
  const [number, setNumber] = useState(0);

    return (
        <div style={homeStyles.container}>
            <h1 style={homeStyles.header}>Digit Detection</h1>
            <h2 style={homeStyles.number}>{number}</h2>
            <DrawingArea onNumberChange={setNumber}/>
        </div>
    )
}

const homeStyles = {
    container : {
        backgroundColor: "#1d2124",
        display: 'flex', 
        flexDirection: 'column',
        flex: 1,
        height: '100vh',
        alignItems: 'center',
        paddingTop: 200
    },
    header : {
        color: 'white',
        fontSize : 35
    },
    number : {
        color: 'white',
        fontSize : 60
    }
}

export default Home

