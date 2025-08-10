import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';


const socket = io('http://localhost:5000'); // Connect to backend

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('general'); // Default chat room
    const [rooms, setRooms] = useState(['general', 'development', 'design']); // Predefined rooms
    const [newRoom, setNewRoom] = useState(''); // New room name
    const [file, setFile] = useState(null); // File state
    const username = localStorage.getItem('username'); // Retrieve username from localStorage
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);

    // Fetch available rooms from backend
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:5000/rooms'); // Fetch rooms
                const roomNames = response.data.map((room) => room.roomName);
                setRooms(['general', 'development', 'design', ...roomNames]); // Include predefined rooms
            } catch (err) {
                console.error('Error fetching rooms:', err);
            }
        };

        fetchRooms();
    }, []);

    useEffect(() => {
        socket.emit('joinRoom', room); // Join the room on component mount

        // Listen for previous messages
        socket.on('previousMessages', (previousMessages) => {
            setMessages(previousMessages);
        });

        // Listen for incoming messages
        socket.on('receiveMessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('receiveMessage');
            socket.off('previousMessages');
        };
    }, [room]);

    const createRoom = async () => {
        if (newRoom.trim() === '') return;

        try {
            const response = await axios.post('http://localhost:5000/rooms/create', { roomName: newRoom });
            setRooms([...rooms, response.data.roomName]); // Add the new room to the list
            setNewRoom(''); // Clear the input field
        } catch (err) {
            console.error('Error creating room:', err);
        }
    };


    const startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                const newRecorder = new MediaRecorder(stream);
                setRecorder(newRecorder);

                newRecorder.ondataavailable = (event) => {
                    setAudioBlob(event.data);
                };

                newRecorder.start();
                setIsRecording(true);
            })
            .catch((err) => {
                console.error('Error accessing microphone:', err);
            });
    };

    const stopRecording = () => {
        if (recorder) {
            recorder.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio-message.webm');

        try {
            const response = await fetch('http://localhost:5000/files/upload-audio', {
                method: 'POST',
                body: formData,
            });

            const { filePath } = await response.json();

            // Correctly use filePath in JSX
            const msgData = {
                room,
                content: `<audio controls src="${filePath}"></audio>`, // Use as a string
                timestamp: new Date(),
                username: username,
            };

            socket.emit('sendMessage', msgData);
            setAudioBlob(null);
        } catch (err) {
            console.error('Error uploading audio:', err);
        }
    };



    const sendMessage = () => {
        const msgData = {
            room,
            content: message,
            timestamp: new Date(),
            username: username,
        };
        socket.emit('sendMessage', msgData);
        setMessage('');
    };

    const uploadFile = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/files/upload', {
                method: 'POST',
                body: formData,
            });

            const { filePath } = await response.json();

            const msgData = {
                room,
                content: filePath, // Save file path as content
                timestamp: new Date(),
                username,
                fileType: file.type, // Send the file type for rendering purposes
            };

            socket.emit('sendMessage', msgData);
            setFile(null); // Clear the file input
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };


    const renderMessageContent = (msg) => {
        if (msg.fileType) {
            const fileType = msg.fileType.split('/')[0]; // Extract the type (image, audio, video, etc.)
            if (fileType === 'image') {
                return <img src={msg.content} alt="Uploaded" style={{ maxWidth: '100%' }} />;
            } else if (fileType === 'audio') {
                return <audio controls src={msg.content}></audio>;
            } else if (fileType === 'video') {
                return <video controls src={msg.content} style={{ maxWidth: '100%' }}></video>;
            } else if (fileType === 'application' && msg.fileType === 'application/pdf') {
                return (
                    <iframe
                        src={msg.content}
                        title="PDF Viewer"
                        style={{ width: '100%', height: '500px', border: 'none' }}
                    ></iframe>
                );
            } else {
                return (
                    <a href={msg.content} target="_blank" rel="noopener noreferrer">
                        Download File
                    </a>
                );
            }
        }
        return <span>{msg.content}</span>;
    };





    const handleRoomChange = (e) => {
        setRoom(e.target.value); // Change room
        setMessages([]); // Clear messages for the new room
        socket.emit('joinRoom', e.target.value); // Join the new room
    };

    return (
        <div>
            <h2>Chat Room: {room}</h2>

            <div className="new-room">
                <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Create a new room..."
                />
                <button onClick={createRoom}>Create Room</button>
            </div>

            <select value={room} onChange={handleRoomChange}>
                {rooms.map((roomName, index) => (
                    <option key={index} value={roomName}>
                        {roomName}
                    </option>
                ))}
            </select>

            <div className="chat-box">
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.username}</strong>: {renderMessageContent(msg)}
                        <span style={{ fontSize: 'small', color: 'gray' }}>
                            ({new Date(msg.timestamp).toLocaleString()})
                        </span>
                    </p>
                ))}
            </div>

            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>

            <div>
                {!isRecording ? (
                    <button onClick={startRecording}>Start Recording</button>
                ) : (
                    <button onClick={stopRecording}>Stop Recording</button>
                )}
                {audioBlob && <button onClick={uploadAudio}>Send Audio</button>}
            </div>

            <div className="file-upload">
                <input type="file" onChange={handleFileChange} />
                <button onClick={uploadFile} disabled={!file}>
                    Upload File
                </button>
            </div>
        </div>
    );
};

export default Chat;