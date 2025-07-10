import { BaseIncomingMessageConstructor } from "@/server/message/base";

export interface MessageHandlerModule {MessageHandler: BaseIncomingMessageConstructor<unknown>;}
