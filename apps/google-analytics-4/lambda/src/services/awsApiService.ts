import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export interface SharedCredentialsInput {
  tableName: string;
  spaceId: string;
  serviceKeyId: string;
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
          sharedCredentialsId: `${input.spaceId}-${input.serviceKeyId}`
        }
      });

      const data = await this.dynamoDbClient.send(command)

      return data.Item
    } catch(err: any) {
      throw new Error(err)
    }
  }

  async saveSharedCredentials(input: SharedCredentialsInput) {
    const hash = ''; // add bcryptjs
    
    try {
      const command =  new PutCommand({
        TableName: input.tableName,
        Item: {
          sharedCredentialsId: `${input.serviceKeyId}-${input.spaceId}`,
          serviceKey: hash, // store hash
        }
      });

      const data = await this.dynamoDbClient.send(command)

      return data;
    } catch(err: any) {
      throw new Error(err);
    }
  }
}
