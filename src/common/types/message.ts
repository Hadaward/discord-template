import { BaseIncomingMessageConstructor } from "@/server/base_message";

export interface MessageHandlerModule {MessageHandler: BaseIncomingMessageConstructor<unknown>;}
