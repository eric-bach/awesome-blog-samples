import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, TextField, Grid, IconButton, List, Typography } from '@mui/material';
import React from 'react';

interface ChatMessagesProps {
  message: string;
  conversation: string[] | undefined;
  isLoadingMessage: boolean;
  handleMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  submitMessage: (event: any) => Promise<void>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ message, conversation, isLoadingMessage, submitMessage, handleMessageChange, handleKeyPress }) => {
  return (
    <>
      <Grid item={true} md={2} />
      <Grid item={true} md={8}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '5px' }}>
          <List>
            {conversation?.map((message, i) => (
              <div key={i}>
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
                  {message}
                </Typography>
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
