import { S3 } from 'aws-sdk';

const s3Client = new S3();

async function handler(event: any, context: any) {
  const buckets = await s3Client.listBuckets().promise();

  console.log('🔔 Received Event: ', event);

  return {
    statusCode: 200,
    body: '✅ Found Buckets' + JSON.stringify(buckets.Buckets),
  };
}

export { handler };
