import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { HttpApi, PayloadFormatVersion } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

import { join } from 'path';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const staticAssets = new Bucket(this, 'StaticAssetsBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, 'DeployStaticAssets', {
      sources: [Source.asset(join(__dirname, '../../frontend/public'))],
      destinationBucket: staticAssets,
      destinationKeyPrefix: '_static',
    });

    const remixServer = new NodejsFunction(this, 'RemixServer', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: join(__dirname, '../../frontend/server/index.js'),
      environment: {
        NODE_ENV: 'production',
      },
      bundling: {
        nodeModules: ['@remix-run/architect', 'react', 'react-dom'],
      },
    });

    const httpLambdaIntegration = new HttpLambdaIntegration(
      'RequestHandlerIntegration',
      remixServer,
      {
        payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
      }
    );

    const httpApi = new HttpApi(this, 'WebsiteApi', {
      defaultIntegration: httpLambdaIntegration,
    });

    const httpApiUrl = `${httpApi.httpApiId}.execute-api.${
      Stack.of(this).region
    }.${Stack.of(this).urlSuffix}`;

    const distribution = new Distribution(this, 'CloudFrontDistribution', {
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: new HttpOrigin(httpApiUrl),
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: new OriginRequestPolicy(
          this,
          'RequestHandlerPolicy',
          {
            originRequestPolicyName: 'website-request-handler',
            queryStringBehavior: OriginRequestQueryStringBehavior.all(),
            cookieBehavior: OriginRequestCookieBehavior.all(),
            headerBehavior: OriginRequestHeaderBehavior.none(),
          }
        ),
      },
    });

    // Add S3 origin and behaviour
    const assetOrigin = new S3Origin(staticAssets);
    const assetBehaviorOptions = {
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };
    distribution.addBehavior('/_static/*', assetOrigin, assetBehaviorOptions);

    /***
     *** Outputs
     ***/

    new CfnOutput(this, 'BucketWebsiteUrl', {
      value: staticAssets.bucketWebsiteUrl,
    });
    new CfnOutput(this, 'ApiWebsiteEndpointUrl', {
      value: httpApi.apiEndpoint,
    });
    new CfnOutput(this, 'CloudFrontDistributionDomainName', {
      value: distribution.distributionDomainName,
    });
  }
}
