import React from 'react';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, TextField, Grid, IconButton, List, Typography, Chip } from '@mui/material';
import { Conversation } from '../common/types';

interface ChatMessagesProps {
  message: string;
  connected: boolean;
  conversation: Conversation[] | undefined;
  isLoadingMessage: boolean;
  handleMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  submitMessage: (event: any) => Promise<void>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  message,
  connected,
  conversation,
  isLoadingMessage,
  submitMessage,
  handleMessageChange,
  handleKeyPress,
}) => {
  return (
    <>
      <Grid item={true} md={2} />
      <Grid item={true} md={8}>
        <Typography variant='h5' sx={{ pb: '15px' }}>
          Conversation
          {connected ? (
            <Chip label='Connected' color='success' sx={{ ml: '0.5em' }} />
          ) : (
            <Chip label='Disconnected' color='error' variant='outlined' sx={{ ml: '0.5em' }} />
          )}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px' }}>
          <List>
            {conversation?.map((c, i) => (
              <div key={i}>
                {c.type === 'agent' ? (
                  <Typography
                    align='right'
                    sx={{
                      backgroundColor: '#1976d2',
                      borderTopLeftRadius: 30,
                      borderBottomLeftRadius: 30,
                      borderTopRightRadius: 30,
                      borderBottomRightRadius: 5,
                      padding: 2,
                      color: 'white',
                      width: '75%',
                      textAlign: 'right',
                      marginLeft: 'auto',
                      marginBottom: 2,
                    }}
                  >
                    {c.message}
                  </Typography>
                ) : (
                  <Typography
                    align='left'
                    sx={{
                      backgroundColor: '#f5f5f5',
                      borderTopLeftRadius: 30,
                      borderBottomLeftRadius: 5,
                      borderTopRightRadius: 30,
                      borderBottomRightRadius: 30,
                      padding: 2,
                      width: '75%',
                      textAlign: 'left',
                      marginBottom: 2,
                    }}
                  >
                    {c.message}
                  </Typography>
                )}
              </div>
            ))}
            {isLoadingMessage && <CircularProgress size={40} sx={{ mt: 2 }} />}
          </List>
          <Box display='flex' alignItems='center'>
            <TextField
              disabled={isLoadingMessage}
              type='text'
              id='message'
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyPress}
              placeholder={'Type your message...'}
              sx={{ width: '100%' }}
              InputProps={{
                endAdornment: (
                  <IconButton type='submit' onClick={(e) => submitMessage(e)}>
                    <DoubleArrowIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </Grid>
    </>
  );
};

export default ChatMessages;
