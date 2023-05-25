import { Stack, Duration, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PolicyStatement, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';
import {
  BucketDeployment,
  CacheControl,
  ServerSideEncryption,
  Source,
} from 'aws-cdk-lib/aws-s3-deployment';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  PriceClass,
} from 'aws-cdk-lib/aws-cloudfront';

export class MfeStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // CloudFront OAI
    const cloudfrontOAI = new OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${id}`,
    });

    // S3 bucket for client app
    const hostingBucket = new Bucket(this, 'MfeWebsiteHostingBucket', {
      bucketName: 'mfe-website-hosting',
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedHeaders: ['Authorization', 'Content-Length'],
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
          maxAge: 3000,
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Grant access to CloudFront
    hostingBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [hostingBucket.arnForObjects('*')],
        principals: [
          new CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // CloudFront distribution
    const distribution = new CloudFrontWebDistribution(
      this,
      'MfeWebsiteDistribution',
      {
        priceClass: PriceClass.PRICE_CLASS_100,
        defaultRootObject: 'container/latest/index.html',
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: hostingBucket,
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
        errorConfigurations: [
          {
            errorCode: 403,
            errorCachingMinTtl: 60,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
        ],
      }
    );

    // S3 bucket deployments
    new BucketDeployment(this, 'MfeContainerWebsiteDeployment', {
      sources: [Source.asset('../frontend/container/dist')],
      destinationBucket: hostingBucket,
      destinationKeyPrefix: 'container/latest',
      retainOnDelete: false,
      contentLanguage: 'en',
      //storageClass: StorageClass.INTELLIGENT_TIERING,
      serverSideEncryption: ServerSideEncryption.AES_256,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(Duration.minutes(1)),
      ],
      distribution,
      distributionPaths: ['/static/css/*'],
    });
    new BucketDeployment(this, 'MfeMarketingWebsiteDeployment', {
      sources: [Source.asset('../frontend/marketing/dist')],
      destinationBucket: hostingBucket,
      destinationKeyPrefix: 'marketing/latest',
      retainOnDelete: false,
      contentLanguage: 'en',
      //storageClass: StorageClass.INTELLIGENT_TIERING,
      serverSideEncryption: ServerSideEncryption.AES_256,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(Duration.minutes(1)),
      ],
      distribution,
      distributionPaths: ['/static/css/*'],
    });
    new BucketDeployment(this, 'MfeAuthWebsiteDeployment', {
      sources: [Source.asset('../frontend/auth/dist')],
      destinationBucket: hostingBucket,
      destinationKeyPrefix: 'auth/latest',
      retainOnDelete: false,
      contentLanguage: 'en',
      //storageClass: StorageClass.INTELLIGENT_TIERING,
      serverSideEncryption: ServerSideEncryption.AES_256,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(Duration.minutes(1)),
      ],
      distribution,
      distributionPaths: ['/static/css/*'],
    });
    new BucketDeployment(this, 'MfeDashboardWebsiteDeployment', {
      sources: [Source.asset('../frontend/dashboard/dist')],
      destinationBucket: hostingBucket,
      destinationKeyPrefix: 'dashboard/latest',
      retainOnDelete: false,
      contentLanguage: 'en',
      //storageClass: StorageClass.INTELLIGENT_TIERING,
      serverSideEncryption: ServerSideEncryption.AES_256,
      cacheControl: [
        CacheControl.setPublic(),
        CacheControl.maxAge(Duration.minutes(1)),
      ],
      distribution,
      distributionPaths: ['/static/css/*'],
    });
  }
}
