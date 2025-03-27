import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function App() {
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);

  const [discussionMessage, setDiscussionMessage] = useState('');
  const [discussions, setDiscussions] = useState([]);

  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetings, setMeetings] = useState([]);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  // Fetch all book clubs
  useEffect(() => {
    fetch('http://localhost:5001/clubs')
      .then((response) => response.json())
      .then((data) => setClubs(data));
  }, []);

  // Fetch discussions for the selected club
  useEffect(() => {
    if (selectedClubId) {
      fetch(`http://localhost:5001/discussions/${selectedClubId}`)
        .then((response) => response.json())
        .then((data) => setDiscussions(data));
    }
  }, [selectedClubId]);

  // Fetch meetings for the selected club
  useEffect(() => {
    if (selectedClubId) {
      fetch(`http://localhost:5001/meetings/${selectedClubId}`)
        .then((response) => response.json())
        .then((data) => setMeetings(data));
    }
  }, [selectedClubId]);

  // Real-time chat
  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  const createClub = async () => {
    const response = await fetch('http://localhost:5001/create-club', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clubName, description: clubDescription }),
    });
    const data = await response.text();
    console.log(data);
  };

  const postDiscussion = async () => {
    const response = await fetch('http://localhost:5001/post-discussion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: selectedClubId, message: discussionMessage, user: 'Current User' }),
    });
    const data = await response.text();
    console.log(data);
  };

  const scheduleMeeting = async () => {
    const response = await fetch('http://localhost:5001/schedule-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clubId: selectedClubId, title: meetingTitle, date: meetingDate, description: meetingDescription }),
    });
    const data = await response.text();
    console.log(data);
  };

  const sendMessage = () => {
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div>
      <h1>Book Club Platform</h1>

      {/* Book Club Creation */}
      <div>
        <h2>Create a Book Club</h2>
        <input
          type="text"
          placeholder="Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Club Description"
          value={clubDescription}
          onChange={(e) => setClubDescription(e.target.value)}
        />
        <button onClick={createClub}>Create Club</button>
      </div>

      {/* List of Book Clubs */}
      <div>
        <h2>Book Clubs</h2>
        <ul>
          {clubs.map((club) => (
            <li key={club._id} onClick={() => setSelectedClubId(club._id)}>
              {club.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Discussions */}
      {selectedClubId && (
        <div>
          <h2>Discussions</h2>
          <ul>
            {discussions.map((discussion) => (
              <li key={discussion._id}>
                <strong>{discussion.user}</strong>: {discussion.message}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Your message"
            value={discussionMessage}
            onChange={(e) => setDiscussionMessage(e.target.value)}
          />
          <button onClick={postDiscussion}>Post Discussion</button>
        </div>
      )}

      {/* Meetings */}
      {selectedClubId && (
        <div>
          <h2>Meetings</h2>
          <ul>
            {meetings.map((meeting) => (
              <li key={meeting._id}>
                <strong>{meeting.title}</strong>: {meeting.date}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Meeting Title"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
          />
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Meeting Description"
            value={meetingDescription}
            onChange={(e) => setMeetingDescription(e.target.value)}
          />
          <button onClick={scheduleMeeting}>Schedule Meeting</button>
        </div>
      )}

      {/* Real-Time Chat */}
      <div>
        <h2>Chat</h2>
        <div>
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;