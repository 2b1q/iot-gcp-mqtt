import { sign } from 'jsonwebtoken'
import { readFileSync } from 'fs'

interface IToken {
    iat: number;
    exp: number;
    aud: string;
}

export class Token {
    private token: IToken;
    private privateKey: Buffer;

    // Create a Cloud IoT Core JWT for the given project id, signed with the given private key.
    constructor(projectId: string, privateKeyFile: string) {
        this.token = {
            iat: parseInt(String(Date.now() / 1000)),
            exp: parseInt(String(Date.now() / 1000)) + 20 * 60, // 20 minutes
            aud: projectId,
        }
        this.privateKey = readFileSync(privateKeyFile);
    }

    sign(): string {
        return sign(this.token, this.privateKey, { algorithm: 'RS256' })
    }
}