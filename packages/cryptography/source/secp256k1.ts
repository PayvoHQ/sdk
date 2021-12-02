import * as secp from "secp256k1";

class Secp256k1 {
	public publicKeyCreate(privateKey: Buffer, compressed: boolean): Buffer {
		return Buffer.from(secp.publicKeyCreate(privateKey, compressed));
	}

	public publicKeyVerify(publicKey: Buffer): boolean {
		try {
			return secp.publicKeyVerify(publicKey);
		} catch {
			return false;
		}
	}

	public publicKeyCombine(publicKeys: Buffer[]): Buffer {
		return Buffer.from(secp.publicKeyCombine(publicKeys));
	}

	public sign(hash: Buffer, privateKey: Buffer): Buffer {
		return Buffer.from(secp.ecdsaSign(hash, privateKey).signature);
	}

	public verify(hash: Buffer, signature: Buffer, publicKey: Buffer): boolean {
		return secp.ecdsaVerify(signature, hash, publicKey);
	}
}

export const secp256k1 = new Secp256k1();
