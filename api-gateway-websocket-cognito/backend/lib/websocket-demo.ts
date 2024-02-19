import { Stack, RemovalPolicy, Duration, CfnOutput, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BlockPublicAccess, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, ServerSideEncryption, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LambdaPowertoolsLayer } from 'cdk-aws-lambda-powertools-layer';
import { CloudFrontAllowedMethods, CloudFrontWebDistribution, GeoRestriction, OriginAccessIdentity, PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import { AccountRecovery, UserPool, UserPoolClient, UserPoolDomain, UserPoolEmail, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { WebSocketLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as path from 'path';

const dotenv = require('dotenv');
dotenv.config();

interface WebsocketDemoStackProps extends StackProps {
  appName: string;
  envName: string;
}

export class WebsocketDemoStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsocketDemoStackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: `${props.appName}_user_pool_${props.envName}`,
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
      },
      email: UserPoolEmail.withSES({
        // @ts-ignore
        fromEmail: process.env.SENDER_EMAIL,
        fromName: props.appName,
        sesRegion: this.region,
      }),
      userVerification: {
        emailSubject: `${props.appName} - Verify your new account`,
        emailBody: 'Thanks for signing up! Please enter the verification code {####} to confirm your account.',
        emailStyle: VerificationEmailStyle.CODE,
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
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new UserPoolDomain(this, `UserPoolDomain`, {
      userPool: userPool,
      cognitoDomain: {
        domainPrefix: `${props.appName}-${props.envName}`,
      },
    });

    const userPoolClient = new UserPoolClient(this, 'UserPoolWebClient', {
      userPoolClientName: `${props.appName}_user_client`,
      accessTokenValidity: Duration.hours(4),
      idTokenValidity: Duration.hours(4),
      userPool,
    });

    const table = new Table(this, 'WebsocketConnections', {
      tableName: `${props.appName}-connections-${props.envName}`,
      partitionKey: { name: 'connectionId', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Powertools Layer
    const powertoolsLayer = new LambdaPowertoolsLayer(this, 'PowertoolsLayer', {
      version: '2.32.0',
      includeExtras: true,
    });

    const sendMessage = new PythonFunction(this, 'SendMessage', {
      functionName: `${props.appName}-SendMessage-${props.envName}`,
      entry: 'src/send_message',
      runtime: Runtime.PYTHON_3_10,
      architecture: Architecture.ARM_64,
      memorySize: 2048,
      timeout: Duration.seconds(60),
      environment: {
        TABLE_NAME: table.tableName,
      },
      retryAttempts: 0,
      layers: [powertoolsLayer],
    });
    table.grantReadData(sendMessage);

    const connectWebsocket = new PythonFunction(this, 'ConnectWebsocket', {
      functionName: `${props.appName}-ConnectWebsocket-${props.envName}`,
      entry: 'src/connect_websocket',
      runtime: Runtime.PYTHON_3_10,
      architecture: Architecture.ARM_64,
      memorySize: 384,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
      },
      retryAttempts: 0,
      layers: [powertoolsLayer],
    });
    table.grantReadWriteData(connectWebsocket);

    const disconnectWebsocket = new PythonFunction(this, 'DisconnectWebsocket', {
      functionName: `${props.appName}-DisconnectWebsocket-${props.envName}`,
      entry: 'src/disconnect_websocket',
      runtime: Runtime.PYTHON_3_10,
      architecture: Architecture.ARM_64,
      memorySize: 384,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
      },
      retryAttempts: 0,
      layers: [powertoolsLayer],
    });
    table.grantReadWriteData(disconnectWebsocket);

    const authWebsocket = new PythonFunction(this, 'AuthWebsocket', {
      functionName: `${props.appName}-AuthWebsocket-${props.envName}`,
      entry: 'src/auth_websocket',
      runtime: Runtime.PYTHON_3_10,
      architecture: Architecture.ARM_64,
      memorySize: 384,
      timeout: Duration.seconds(30),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        APP_CLIENT_ID: userPoolClient.userPoolClientId,
      },
      retryAttempts: 0,
      layers: [powertoolsLayer],
    });

    // Websocket API
    const webSocketApi = new WebSocketApi(this, 'WebsocketApi', {
      apiName: `${props.appName}-websocket-api-${props.envName}`,
      connectRouteOptions: {
        authorizer: new WebSocketLambdaAuthorizer('Authorizer', authWebsocket, {
          identitySource: ['route.request.querystring.idToken'],
        }),
        integration: new WebSocketLambdaIntegration('ConnectHandlerIntegration', connectWebsocket),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('DisconnectHandlerIntegration', disconnectWebsocket),
      },
      routeSelectionExpression: '$request.body.action',
    });

    const apiStage = new WebSocketStage(this, 'WebsocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    webSocketApi.addRoute('SendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessage),
    });

    // Add permissions to websocket function to manage websocket connections
    sendMessage.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:ManageConnections'],
        resources: [
          this.formatArn({
            service: 'execute-api',
            resourceName: `${apiStage.stageName}/POST/*`,
            resource: webSocketApi.apiId,
          }),
        ],
      })
    );

    const cloudfrontOAI = new OriginAccessIdentity(this, 'CloudFrontOAI', {
      comment: `OAI for ${props.appName} CloudFront`,
    });

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      bucketName: `${props.appName}-website-${props.envName}`,
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      cors: [
        {
          allowedHeaders: ['Authorization', 'Content-Length'],
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
          maxAge: 3000,
        },
      ],
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    websiteBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );

    const distribution = new CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultRootObject: 'container/latest/index.html',
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: cloudfrontOAI,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              defaultTtl: Duration.hours(1),
              minTtl: Duration.seconds(0),
              maxTtl: Duration.days(1),
              compress: true,
              allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
            },
          ],
        },
      ],
      geoRestriction: GeoRestriction.allowlist('CA'),
      errorConfigurations: [
        {
          errorCode: 403,
          errorCachingMinTtl: 60,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new BucketDeployment(this, 'WebsiteBucketDeployment', {
      sources: [Source.asset(path.join(__dirname, '../../frontend/dist'))],
      destinationBucket: websiteBucket,
      retainOnDelete: false,
      contentLanguage: 'en',
      serverSideEncryption: ServerSideEncryption.AES_256,
      cacheControl: [CacheControl.setPublic(), CacheControl.maxAge(Duration.minutes(1))],
      distribution,
      distributionPaths: ['/static/css/*'],
    });

    new CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new CfnOutput(this, 'CloudFrontDistributionName', {
      value: distribution.distributionDomainName,
    });

    new CfnOutput(this, 'WebSocketApiUrl', {
      value: apiStage.url,
    });
  }
}
