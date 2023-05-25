#!/usr/bin/env node
import 'source-map-support/register';
import { App, StackProps } from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { MfeStack } from '../lib/mfe-stack';

const app = new App();

const baseProps: StackProps = {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
};

new AuthStack(app, 'mfe-auth-stack', baseProps);

new MfeStack(app, 'mfe-frontend-stack', baseProps);
