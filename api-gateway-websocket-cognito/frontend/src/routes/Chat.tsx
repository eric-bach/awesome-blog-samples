import React, { useEffect, useState, KeyboardEvent } from 'react';
import { Auth } from 'aws-amplify';
import { Grid } from '@mui/material';
import { Conversation } from '../common/types';
import ChatMessages from '../components/ChatMessages';

const Chat: React.FC = () => {
  const [isLoadingMessage, setLoadingMessage] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = React.useState<Conversation[]>([]);
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState<WebSocket>();

  const initializeClient = async () => {
    const idToken = (await Auth.currentSession()).getIdToken().getJwtToken();
    const client = new WebSocket(`${import.meta.env.VITE_API_WEBSOCKET_ENDPOINT}?idToken=${idToken}`);

    client.onopen = (e) => {
      setConnected(true);
      console.log('WebSocket connection established.');
    };

    client.onerror = (e: any) => {
      console.error(e);
      setConnected(false);

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
        setConnected(false);
        console.log('WebSocket connection closed.');
      }
    };

    client.onmessage = async (message: any) => {
      const event = JSON.parse(message.data);

      setMessage('');
      setConversation((conversation) => [...(conversation || []), event.data]);

      setLoadingMessage(false);
    };

    setClient(client);
  };

  useEffect(() => {
    initializeClient();
  }, []);

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == 'Enter') {
      submitMessage(event);
    }
  };

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const submitMessage = async (event: any) => {
    setLoadingMessage(true);

    setConversation((conversation) => [...(conversation || []), { type: 'user', message: event.target.value }]);

    if (event.key !== 'Enter') {
      return;
    }

    client?.send(
      JSON.stringify({
        action: 'SendMessage',
        message,
        token: (await Auth.currentSession()).getIdToken().getJwtToken(),
      })
    );
  };

  return (
    <Grid container columns={12}>
      <ChatMessages
        message={message}
        connected={connected}
        conversation={conversation}
        isLoadingMessage={isLoadingMessage}
        submitMessage={(e: any) => submitMessage(e)}
        handleKeyPress={handleKeyPress}
        handleMessageChange={handleMessageChange}
      />
    </Grid>
  );
};

export default Chat;
