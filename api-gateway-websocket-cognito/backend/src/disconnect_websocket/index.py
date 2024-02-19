import json
import os
import boto3
from aws_lambda_powertools import Logger

TABLE_NAME = os.environ["TABLE_NAME"]

ddb = boto3.resource("dynamodb")
table = ddb.Table(TABLE_NAME)

logger = Logger()

@logger.inject_lambda_context(log_event=True)
def handler(event, context):
    connection_id = event["requestContext"]["connectionId"]

    table.delete_item(Key={"connectionId": connection_id})

    return {}
