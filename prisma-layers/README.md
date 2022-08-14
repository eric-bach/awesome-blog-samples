# Prisma Layers

This repo provides an example on how to build the source for an AWS Lambda Layer using Docker with a Dockerfile. The built assets are then deployed to AWS as a Lambda Layer.

Docker Desktop is required on the local system for this build.

# Getting Started

1. Install CDK dependencies

   ```bash
   npm install
   ```

2. Install Lambda dependencies in the `/src/lambda/userService` folder

   ```bash
   npm install
   ```

3. Install Prisma Layer dependencies in the `/src/layers/prisma` folder

   ```bash
   PRISMA_CLI_BINARY_TARGETS=rhel-openssl-1.0.x npm install
   ```

4. Build the project

   ```
   npm run build
   ```

5. Deploy CDK

   ```
   npx cdk deploy --all --require-approval never --profile AWS_PROFILE_NAME
   ```
