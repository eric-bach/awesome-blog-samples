import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, FunctionUrl, FunctionUrlAuthType, Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { AuroraPostgresEngineVersion, Credentials, DatabaseClusterEngine, ServerlessCluster } from 'aws-cdk-lib/aws-rds';

import * as path from 'path';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
export class PrismaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, `Vpc`, {
      vpcName: 'EpicVpc',
    });

    const securityGroup = new SecurityGroup(this, `SecurityGroup`, {
      vpc,
      securityGroupName: 'EpicSecurityGroup',
    });

    const dbCredentials = new Secret(this, 'EpicDatabaseCredentials', {
      secretName: 'EpicDatabaseCredentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });

    const dbCluster = new ServerlessCluster(this, 'EpicDatabase', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_10_19,
      }),
      enableDataApi: true,
      removalPolicy: RemovalPolicy.DESTROY,
      credentials: Credentials.fromSecret(dbCredentials),
      securityGroups: [securityGroup],
      vpcSubnets: {
        subnets: vpc.isolatedSubnets.concat(vpc.privateSubnets),
      },
      vpc: vpc,
      scaling: {
        minCapacity: 2,
        maxCapacity: 4,
        autoPause: Duration.minutes(15),
      },
    });

    const prismaLayer = new LayerVersion(this, 'PrismaLayer', {
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      description: 'Prisma Layer',
      code: Code.fromAsset(path.join(__dirname, '../src/layers/prisma'), {
        bundling: {
          image: Runtime.NODEJS_16_X.bundlingImage,
          command: [
            'bash',
            '-c',
            [
              'cp package.json package-lock.json client.js /asset-output',
              'cp -r prisma /asset-output/prisma',
              'cp -r node_modules /asset-output/node_modules',
              'rm -rf /asset-output/node_modules/.cache',
              'rm -rf /asset-output/node_modules/@prisma/engines/node_modules',
              'rm -rf /asset-output/node_modules/@prisma/*darwin*',
              'rm -rf /asset-output/node_modules/@prisma/*windows*',
              'rm -rf /asset-output/node_modules/prisma/*darwin*',
              'rm -rf /asset-output/node_modules/prisma/*windows*',
              'npx prisma generate',
            ].join(' && '),
          ],
        },
      }),
      layerVersionName: `prisma-layer`,
    });

    const userService = new Function(this, 'UserService', {
      functionName: `user-service`,
      runtime: Runtime.NODEJS_16_X,
      handler: 'main.handler',
      code: Code.fromAsset(path.join(__dirname, '../src/lambda/userService')),
      vpc: vpc,
      layers: [prismaLayer],
      environment: {
        REGION: Stack.of(this).region,
      },
      memorySize: 512,
      timeout: Duration.seconds(10),
    });

    const userFunctionUrl = new FunctionUrl(this, 'UserServiceUrl', {
      function: userService,
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, 'VpcId', { value: vpc.vpcId });
    new CfnOutput(this, 'securityGroupId', { value: securityGroup.securityGroupId });
    new CfnOutput(this, 'clusterHostname', { value: dbCluster.clusterEndpoint.hostname });
    new CfnOutput(this, 'PrismaLayerVersionArn', { value: prismaLayer.layerVersionArn });
    new CfnOutput(this, 'UserFunctionArn', { value: userService.functionArn });
    new CfnOutput(this, 'UserFunctionUrl', { value: userFunctionUrl.url });
  }
}
