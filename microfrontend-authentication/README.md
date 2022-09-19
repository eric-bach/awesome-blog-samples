# Getting Started

1. Install dependencies

   ```
   $ cd backend
   $ npm install
   ```

2. Install Lambda dependencies

   ```
   $ cd /src/cognitoPostConfirmation
   $ npm install
   ```

3. Deploy backend

   ```
   $ cd /backend
   $ cdk deploy
   ```

4. Create an /frontend/container/.env file with the values from the outputs of the CDK deploy

   ```
   REACT_APP_USERPOOL_ID=
   REACT_APP_CLIENT_ID=
   ```

# Start the frontend

1. Install dependencies in each of the folders in /frontend

   ```
   $ cd /frontend/auth
   $ npm install
   ```

2. Start each MFE app in each of the folders in /frontend

   ```
   $ cd /frontend/auth
   $ npm run start
   ```
