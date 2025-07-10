export abstract class BaseIncomingMessage<T> {
	public static readonly type: string;

	private _message: T;

	constructor(message: T) {
		this._message = message;
	}

	protected getRequired<K extends keyof T>(key: K): T[K] {
		if (!Object.hasOwn(this._message as Record<string, unknown>, key)) {
			throw new Error(`Required key "${String(key)}" is missing in the message`);
		}

		return this._message[key];
	}

	protected getOptional<K extends keyof T>(key: K): T[K] | undefined {
		return this._message[key];
	}

	public abstract handle(): Promise<void>;
}

export type BaseIncomingMessageConstructor<M> = (new(message: M) => BaseIncomingMessage<M>) & { readonly type: string };

export abstract class BaseOutgoingMessage<T extends Record<string, unknown>> {
	private _message: T;

	constructor(message: T) {
		this._message = message;

		if (!Object.hasOwn(this._message, "type")) {
			throw new Error("Message type is required");
		}
	}

	public toJSON(): string {
		return JSON.stringify(this._message);
	}
}
