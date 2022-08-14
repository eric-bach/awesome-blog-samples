#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { PrismaStack } from '../lib/backend-stack';

const app = new App();

new PrismaStack(app, `prisma-layer-stack`, {});
