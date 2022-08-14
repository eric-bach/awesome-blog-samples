import { Construct } from 'constructs';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';

import { join } from 'path';

export class EpicLambdaDebugStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3Policy = new PolicyStatement();
    s3Policy.addActions('s3:ListAllMyBuckets');
    s3Policy.addResources('*');

    const helloFunction = new NodejsFunction(this, 'HelloFunction', {
      entry: join(__dirname, '..', 'src', 'lambda', 'main.ts'),
      handler: 'handler',
    });
    helloFunction.addToRolePolicy(s3Policy);

    // Lambda Function URL
    helloFunction.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });

    // Outputs
    new CfnOutput(this, 'LambdaFunctionArn', {
      value: helloFunction.functionArn,
    });
  }
}
