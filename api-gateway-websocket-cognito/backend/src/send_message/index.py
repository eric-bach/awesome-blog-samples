import os
import boto3
import json
from aws_lambda_powertools import Logger

TABLE_NAME = os.environ["TABLE_NAME"]

ddb_client = boto3.client("dynamodb")
ddb = boto3.resource("dynamodb")
table = ddb.Table(TABLE_NAME)

logger = Logger()

@logger.inject_lambda_context(log_event=True)
def handler(event, context):
    event_body = json.loads(event["body"])

    paginator = ddb_client.get_paginator("scan")
    connectionIds = []

    api_gateway_management_api = boto3.client(
        "apigatewaymanagementapi",
        endpoint_url= "https://" + event["requestContext"]["domainName"] + "/" + event["requestContext"]["stage"]
    )

    # Extend connections
    for page in paginator.paginate(TableName=TABLE_NAME):
        connectionIds.extend(page["Items"])

    for connectionId in connectionIds:
        try:
            logger.info("Sending message to connectionId: " + connectionId["connectionId"]["S"])
            api_gateway_management_api.post_to_connection(
                ConnectionId=connectionId["connectionId"]["S"],
                Data=json.dumps({"message": event_body["message"]})
            )
        except Exception as e:
             logger.error(f"Error sending message to connectionId {connectionId}: {e}")

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps({"message": event_body["message"]}),
    }
