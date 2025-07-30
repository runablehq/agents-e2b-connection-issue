import type { Message as ChatMessage } from "ai";

export type OutgoingMessage =
    | {
        /** Indicates this message contains updated chat messages */
        type: "cf_agent_chat_messages";
        /** Array of chat messages */
        messages: ChatMessage[];
        sessionId: string;
    }
    | {
        /** Indicates this message is a response to a chat request */
        type: "cf_agent_use_chat_response";
        /** Unique ID of the request this response corresponds to */
        id: string;
        /** Content body of the response */
        body: string;
        /** Whether this is the final chunk of the response */
        done: boolean;
        sessionId: string;
    }
    | {
        /** Indicates this message contains updated chat messages */
        type: "cf_agent_chat_messages";
        /** Array of chat messages */
        messages: ChatMessage[];
        sessionId: string;
    }
    | {
        /** Indicates this message is a command to clear chat history */
        type: "cf_agent_chat_clear";
        sessionId: string;
    };

export type IncomingMessage =
    | {
        /** Indicates this message is a request to the chat API */
        type: "cf_agent_use_chat_request";
        /** Session ID for this request */
        sessionId: string;
        /** Unique ID for this request */
        id: string;
        /** Request initialization options */
        init: Pick<
            RequestInit,
            | "method"
            | "keepalive"
            | "headers"
            | "body"
            | "redirect"
            | "integrity"
            | "credentials"
            | "mode"
            | "referrer"
            | "referrerPolicy"
            | "window"
        >;
    }
    | {
        /** Indicates this message is a command to clear chat history */
        type: "cf_agent_chat_clear";
        sessionId: string;
    }
    | {
        /** Indicates this message contains updated chat messages */
        type: "cf_agent_chat_messages";
        /** Array of chat messages */
        messages: ChatMessage[];
        sessionId: string;
    }
    | {
        /** Indicates the user wants to stop generation of this message */
        type: "cf_agent_chat_request_cancel";
        id: string;
        sessionId: string;
    };