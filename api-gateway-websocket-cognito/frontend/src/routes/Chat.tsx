import React, { useEffect, useState, KeyboardEvent } from 'react';
import { Auth } from 'aws-amplify';
import { Grid } from '@mui/material';
import ChatMessages from '../components/ChatMessages';

const Chat: React.FC = () => {
  const [isLoadingMessage, setLoadingMessage] = useState<boolean>(false);
  const [conversation, setConversation] = React.useState<string[]>([]);
  const [message, setMessage] = useState('');

  const [client, setClient] = useState<WebSocket>();

  const initializeClient = async () => {
    const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
    const client = new WebSocket(`${import.meta.env.VITE_API_WEBSOCKET_ENDPOINT}?idToken=${idToken}`);

    client.onopen = (e) => {
      console.log('WebSocket connection established.');
    };

    client.onerror = (e: any) => {
      console.error(e);

      setTimeout(async () => {
        await initializeClient();
      });
    };

    client.onclose = () => {
      if (!closed) {
        setTimeout(async () => {
          await initializeClient();
        });
      } else {
        console.log('WebSocket connection closed.');
      }
    };

    client.onmessage = async (message: any) => {
      const event = JSON.parse(message.data);

      setMessage('');
      setConversation(event.message);
      //setConversation([...conversation, event.message]);

      setLoadingMessage(false);
    };

    setClient(client);
  };

  useEffect(() => {
    initializeClient();
  }, [conversation]);

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter') {
      submitMessage(event);
    }
  };

  const submitMessage = async (event: any) => {
    setLoadingMessage(true);

    if (event.key !== 'Enter') {
      return;
    }

    client?.send(
      JSON.stringify({
        action: 'SendMessage',
        message: [...conversation, message],
        token: (await Auth.currentSession()).getIdToken().getJwtToken(),
      })
    );
  };

  return (
    <div>
      <Grid container columns={12}>
        <ChatMessages
          message={message}
          conversation={conversation}
          isLoadingMessage={isLoadingMessage}
          submitMessage={(e: any) => submitMessage(e)}
          handleKeyPress={handleKeyPress}
          handleMessageChange={handleMessageChange}
        />
      </Grid>
    </div>
  );
};

export default Chat;
