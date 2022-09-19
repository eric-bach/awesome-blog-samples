import { Stack, CfnOutput, Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  UserPool,
  CfnUserPoolGroup,
  UserPoolClient,
  AccountRecovery,
  VerificationEmailStyle,
  UserPoolDomain,
} from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement, Policy } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

import VERIFICATION_EMAIL_TEMPLATE from './emails/verificationEmail';

export class AuthStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const REGION = Stack.of(this).region;

    // AWS Cognito post-confirmation lambda function
    const cognitoPostConfirmationTrigger = new NodejsFunction(this, 'CognitoPostConfirmationTrigger', {
      runtime: Runtime.NODEJS_14_X,
      functionName: `mfe-auth-CognitoPostConfirmationTrigger`,
      handler: 'handler',
      entry: path.resolve(__dirname, '../src/cognitoPostConfirmation/main.ts'),
      memorySize: 512,
      timeout: Duration.seconds(5),
      environment: {
        REGION: REGION,
      },
    });

    // Cognito user pool
    const userPool = new UserPool(this, 'MfeAuthUserPool', {
      userPoolName: `mfe_auth_user_pool`,
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: VerificationEmailStyle.LINK,
        emailSubject: 'MFE Auth - Verify your new account',
        emailBody: VERIFICATION_EMAIL_TEMPLATE,
      },
      autoVerify: {
        email: true,
      },
      signInAliases: {
        username: false,
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      lambdaTriggers: {
        postConfirmation: cognitoPostConfirmationTrigger,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Cognito user pool group
    new CfnUserPoolGroup(this, 'MfeAuthUserGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Users',
      description: 'MFE Auth Users',
    });

    // Cognito user pool domain
    new UserPoolDomain(this, 'MfeAuthUserPoolDomain', {
      userPool: userPool,
      cognitoDomain: {
        domainPrefix: `mfe-auth`,
      },
    });

    // Cognito user client
    const userPoolClient = new UserPoolClient(this, 'MfeAuthUserClient', {
      userPoolClientName: `mfe_auth_user_client`,
      accessTokenValidity: Duration.hours(8),
      idTokenValidity: Duration.hours(8),
      userPool,
    });

    // Add permissions to add user to Cognito User Pool
    cognitoPostConfirmationTrigger.role!.attachInlinePolicy(
      new Policy(this, 'userpool-policy', {
        statements: [
          new PolicyStatement({
            actions: ['cognito-idp:AdminAddUserToGroup'],
            resources: [userPool.userPoolArn],
          }),
        ],
      })
    );

    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId, exportName: 'mfe-auth-userPoolId' });
    new CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new CfnOutput(this, 'CognitoPostConfirmationFunctionArn', { value: cognitoPostConfirmationTrigger.functionArn });
  }
}
