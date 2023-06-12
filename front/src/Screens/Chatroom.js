import react from "react";
import {io} from "socket.io-client";
import Message from "./Message";


class Chatroom extends react.Component{
    constructor(props){
        super(props);
        this.socket = io('http://localhost:3001', {
            cors: {
                origin: 'http://localhost:3001',
                credentials: true
            },  transports: ['websocket'],
        });
        this.state = {
            messages: [],
            text: '',
            //newMessages: '',
            username: props.username, 
            room: props.room ,
            screenName:undefined,
            // userId: undefined,
        }
        this.socket.on("chat message", (data) => {
            console.log("received message")
            this.setState((prevState) => ({
              messages: [...prevState.messages, data],
            }));
          });
    }
      
    componentWillUnmount() {
      console.log("LEAVING ROOM COMPONENT WILL UNMOUNT IN CHATROOM");
        // if (this.socket) {
        //   this.socket.disconnect();
          // console.log("left");
        //}
        // this.socket.off();
      }
      
      fetchMessages = async () => {
        try {
          const response = await fetch(this.props.server_url + '/api/rooms/allmessages/' + this.state.roomName,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
      
          if (response.ok) {
            const data = await response.json();
            //const { roomName } = await response.json();
            //this.setState({name: roomName});
            this.setState({ messages: data });
            console.log('Fetched messages:', data); // Move this line inside the if block
          } else {
            console.error('Failed to fetch messages:', response.status);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      


      async componentDidMount() {
        //const { roomId } = this.props
        //this.socket.emit("join", { room: roomId});

        // this.socket.on("something", (message) => {
        //   if(message.room === roomId) {
        //     this.setState((prevState) => ({
        //       messages: [...prevState.messages, message.text]
        //     }));
        //   };
        // })
        console.log("Component mounted");
        console.log("chat room");
        this.fetchMessages();
        console.log("fetching room currently in");
        try {
          const response = await fetch(this.props.server_url + '/api/rooms/current', {
            method: 'GET',
            credentials: 'include',
          });
      
          if (response.ok) {
            const responseData = await response.json();
            console.log('Response Data:', responseData);
      
            if (responseData && responseData.room) {
              const { room, user } = responseData;
              // this.setState({ room: room, userId: user._id });
              // this.props.userId = user._id;
              this.setState({
                userId: user._id,
                username: user.name,
                room: room
              });
          
              console.log("Room:", room);
              console.log("User ID:", user._id);
              console.log("USER ASSOCIATED WITH ID", user.name);
              this.setState({screenName:user.name});
            } else {
              console.error('Room name not found in the response:', responseData);
            }
          } else {
            console.error('Failed to fetch current room:', response.status);
          }
        } catch (error) {
          console.error('Error fetching current room:', error);
        }
      
        // this.socket.on('newMessage', (message) => {
        //   console.log('New message:', message);
        //   this.setState((prevState) => ({
        //     messages: [...prevState.messages, message],
        //   }));
        // });
        // this.socket.on('message', (message) => {
        //   console.log(message);
        //   if(message.room === this.props.room) {
        //     this.setState((prevState) => ({
        //       messages: [...prevState.messages, message.text]
        //     }))
        //   }
        // })
      }
      
      // handleReceivedMessage = (message) => {
      //   this.setState((prevState) => ({
      //     messages: [..prevState.messages, message.text]
      //   }));
      // };


    handleChange = (event) => {
        this.setState({text:event.target.value});
    };

    // handleChange = () => {
    //     const { newMessages } = this.state;
    //     if(newMessages) {
    //         this.socket.emit('handleChange', newMessages);
    //         this.setState({
    //             newMessages: ''
    //         });
    //     }
    // };
    // handleSubmit = (event) => {
    //     event.preventDefault();
    //     console.log("I dont wanna live");
    //     //fetch post to newmessage
    //     //call componentDidMount to refresh page and get new message(s)
          
    //     this.socket.emit('sendMessage', { text: this.state.text });
    //     console.log("sent "+ this.state.text)

    //     this.setState({ text: '' });


    // };

    handleSubmit = async (event) => {
      event.preventDefault();
    
      // try {
      //   const { text } = this.state;
      //   const { room } = this.props;
    
      //   const messageData = {
      //     text,
      //     room,
      //   };
      //   console.log(this.text);

      //   const response = await fetch(this.props.server_url + '/api/rooms/newmessage', {
      //     method: 'POST',
      //     credentials: 'include',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(messageData),
      //   });
    
      //   if (response.ok) {
      //     console.log('Message sent successfully');
      //     //this.setState({ text: '' });

          // const newMes = {message: text, username: this.state.username};
          // this.setState((prevState) => ({
          //   messages: [...prevState.messages, newMes],
          // }));
          //console.log('Before emitting newMessage:', { message: text, senderId: this.state.userId });
          //this.socket.emit("newMessage", { message: text, senderId: this.state.userId });
          // this.socket.emit('chat message', {message: text, senderId: this.state.userId, username: this.props.username});
          //this.setState({text: " "});
          //console.log('After emitting newMessage');

      //   } else {
      //     console.error('Failed to send message:', response.status);
      //   }
      // } catch (error) {
      //   console.error('Error creating message:', error);
      // }
    };

    sendMessage =  () => {
      const { text, room, username } = this.state;
      
      const data = {
          text,
          room,
          username,
          senderId: this.state.userId,
        };
      console.log(data);
      this.socket.emit("chat message", data);
      const newMes = {message: text, username: username};
      this.setState((prevState) => ({
        messages: [...prevState.messages, newMes],
      }));
      //this.setState({text: ""});
      fetch(this.props.server_url + '/api/rooms/newmessage', {
          method: 'POST',
          mode: "cors",
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': "application/json"
          },
          body: JSON.stringify(data),
        })
        .then((res) => {
          res.json().then((data) => {
            if(data === 200) {
              console.log("nice")
            }
            else{
              console.log("failed to send to the db");
            }
          })
        })


      
        
  
    
      //const { text } = this.state;
      // const { roomID } = this.props;
      // // const { usernameId } = this.props;
      // const msg = this.state.text;
      // console.log(msg);
      // this.socket.emit('something', {room: roomID, text: msg});
      // this.setState({text});
    }
    
    leaveRoom = ()=> {
      console.log("LEAVE ROOM TRIGGERED");
      this.socket.disconnect();
      this.props.changeScreen("lobby");
    }
    

    render(){
        return(
            <div>
                {/* show chats */}
                <p>PLACE HOLDER MESSAGE</p>

                <div className="chatlog">
                  {this.state.messages.map((msg, index) => (
                    <div key={index}>
                      {/* <span className="username">{msg.username}: </span>
                      {msg.message} */}
                      <Message 
                        key={index}
                        loggedInUser = {this.state.screenName}
                        messageObject = {msg}
                        server_url = {this.props.server_url}
                        // handleEditMessage = {this.handleEdit}
                      />

                    </div>
                  ))}
                </div>
                
                {/* {this.state.messages.map((element)=> (
                    <p>{element.text}</p>
                ))} */}
                {/* show chat input box*/}
                
                <form onSubmit={this.handleSubmit}>
                    <input
                        type = "text"
                        value = {this.state.text}
                        onChange = {this.handleChange}
                        placeholder = "Send a message..."
                    />
                    <button onClick={this.sendMessage} type = "submit">Send!</button>
                </form>
                Chatroom
              <button className="exitbutton" onClick={this.leaveRoom}>Exit Room</button>
            </div>
        );
    }
}
export default Chatroom;