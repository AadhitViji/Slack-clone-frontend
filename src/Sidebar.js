import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ currentRoom, setRoom }) => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Fetch available rooms from the backend
        const fetchRooms = async () => {
            try {
                const response = await fetch('http://localhost:5000/rooms');
                const data = await response.json();
                setRooms(data);
            } catch (err) {
                console.error('Error fetching rooms:', err);
            }
        };

        fetchRooms();
    }, []);

    return (
        <div className="sidebar">
            <h3>Rooms</h3>
            <ul>
                {rooms.map((room) => (
                    <li
                        key={room}
                        className={room === currentRoom ? 'active-room' : ''}
                        onClick={() => setRoom(room)}
                    >
                        {room}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
