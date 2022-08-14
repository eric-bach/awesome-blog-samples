#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EpicLambdaDebugStack } from '../lib/epic-lambda-debug-stack';

const app = new cdk.App();
new EpicLambdaDebugStack(app, 'EpicLambdaDebugStack', {});
