/* istanbul ignore file */

import { NotImplemented } from "./exceptions.js";
import { MessageInput, MessageService, SignedMessage } from "./message.contract.js";
import { ConfigRepository } from "./coins.js";
import { BindingType } from "./service-provider.contract.js";
import { IContainer } from "./container.contracts.js";

export class AbstractMessageService implements MessageService {
	protected readonly configRepository: ConfigRepository;

	public constructor(container: IContainer) {
		this.configRepository = container.get(BindingType.ConfigRepository);
	}

	public async sign(input: MessageInput): Promise<SignedMessage> {
		throw new NotImplemented(this.constructor.name, this.sign.name);
	}

	public async verify(input: SignedMessage): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.verify.name);
	}
}
