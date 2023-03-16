import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { decryptSharedCredentials, encryptSharedCredentials } from './awsApiUtils';

export interface SharedCredentialsInput {
  tableName: string;
  sharedCredentialsId: string;
  serviceKey?: object
}

export class AwsApiService {
    private dynamoDbClient: DynamoDBDocumentClient;

    constructor(client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.DYNAMO_ENDPOINT
    })) {
      this.dynamoDbClient = DynamoDBDocumentClient.from(client)
    }

   async getSharedCredentials(input: SharedCredentialsInput) {
    try {
      const command = new GetCommand({
        TableName:  input.tableName,
        Key: {
          sharedCredentialsId: input.sharedCredentialsId,
        }
      });

      const data = await this.dynamoDbClient.send(command)

      return decryptSharedCredentials(data.Item?.value)
    } catch(err: any) {
      throw new Error(err)
    }
  }

  async saveSharedCredentials(input: SharedCredentialsInput) {
    const hash = await encryptSharedCredentials(input.serviceKey!);
    
    try {
      const command =  new PutCommand({
        TableName: input.tableName,
        Item: {
          sharedCredentialsId: input.sharedCredentialsId,
          value: hash,
        }
      });

      const data = await this.dynamoDbClient.send(command)

      return data;
    } catch(err: any) {
      throw new Error(err);
    }
  }
}
