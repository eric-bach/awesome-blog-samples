# Getting Started

## Install Backend

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

3. Install dependencies in each of the folders in /frontend

   ```
   $ cd /frontend/auth
   $ npm install

   $ cd /frontend/container
   $ npm install

   $ cd /frontend/dashbaord
   $ npm install

   $ cd /frontend/marketing
   $ npm install
   ```

4. Deploy stacks

   ```
   $ cd /backend
   $ cdk deploy --all --profile AWS_PROFILE
   ```

5. Create an /frontend/container/.env file with the values from the outputs of the CDK deploy

   ```
   REACT_APP_USERPOOL_ID=
   REACT_APP_CLIENT_ID=
   ```

6. Re-deploy stacks with the new outputs

   ```
   $ cd /backend
   $ cdk deploy --all --profile AWS_PROFILE
   ```
