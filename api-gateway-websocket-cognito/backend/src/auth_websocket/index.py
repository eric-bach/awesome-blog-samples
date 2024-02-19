# https://github.com/aws-samples/amazon-cognito-api-gateway/blob/main/custom-auth/lambda.py
import os
import json
import time
import urllib.request
from jose import jwk, jwt
from jose.utils import base64url_decode
from aws_lambda_powertools import Logger

USER_POOL_ID = os.environ['USER_POOL_ID']
APP_CLIENT_ID = os.environ['APP_CLIENT_ID']

# instead of re-downloading the public keys every time we download them only on cold start https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
keys_url = 'https://cognito-idp.{}.amazonaws.com/{}/.well-known/jwks.json'.format('us-east-1', USER_POOL_ID)
with urllib.request.urlopen(keys_url) as f:
    response = f.read()
keys = json.loads(response.decode('utf-8'))['keys']

logger = Logger()

@logger.inject_lambda_context(log_event=True)
def handler(event, context):
    token = event["queryStringParameters"]["idToken"]

    try:
        claims = validate_token(token)
        print("Token is valid. Payload:", claims)
        return get_allow_policy(event["methodArn"], claims)
    except:
        print("Token is not valid")
    
    return get_deny_policy()

def get_allow_policy(methodArn, idToken):
    return {
        "principalId": idToken['sub'],
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": methodArn
                }
            ]
        },
        "context": {
            #userId: idToken['sub']
        }
    }

def get_deny_policy():
    return {
        "principalId": "*",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "*",
                    "Effect": "Deny",
                    "Resource": "*"
                }
            ]
        }
    }

def validate_token(token):
    # get the kid from the headers prior to verification
    headers = jwt.get_unverified_headers(token)
    kid = headers['kid']

    # search for the kid in the downloaded public keys
    key_index = -1
    for i in range(len(keys)):
        if kid == keys[i]['kid']:
            key_index = i
            break

    if key_index == -1:
        raise('Public key not found in jwks.json')

    public_key = jwk.construct(keys[key_index])

    message, encoded_signature = str(token).rsplit('.', 1)

    # decode and verify the signature
    decoded_signature = base64url_decode(encoded_signature.encode('utf-8'))
    if not public_key.verify(message.encode("utf8"), decoded_signature):
        raise('Signature verification failed')
    print('Signature successfully verified')

    # verify the claims
    claims = jwt.get_unverified_claims(token)
    
    if time.time() > claims['exp']:
        raise('Token is expired')

    if claims['aud'] != APP_CLIENT_ID:
        raise('Token was not issued for this audience')

    return claims