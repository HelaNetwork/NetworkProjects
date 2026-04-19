"use client"

import { WEBSOCKET_URL } from "@/utils/properties";

declare global {
    interface Window {
        ethereum?: any;
    }
}


interface WebSocketFundRequestMessage {
    eventName?: string;
    metadata?: {
        toAddress: string;
        requestedAmount: string;
    };
}

export class God {
    websocket: WebSocket | null = null;
    onMessageReceived: (message: string) => void;
    onError: (error: string) => void;
    sessionId: string;
    userId: string;
    walletAddress: string;
    chatMode: 'STANDARD' | 'RECURSIVE';
    llmProvider: string = 'gemini';
    llmModelId: string = 'gemini-1.5-flash';

    constructor(
        onMessageReceived: (message: string) => void,
        onError: (error: string) => void,
        sessionId: string,
        userId: string,
        walletAddress: string,
        chatMode: 'STANDARD' | 'RECURSIVE',
        llmProvider?: string,
        llmModelId?: string
    ) {
        this.sessionId = sessionId;
        this.onMessageReceived = onMessageReceived;
        this.onError = onError;
        this.userId = userId;
        this.chatMode = chatMode;
        this.walletAddress = walletAddress;
        if (llmProvider) this.llmProvider = llmProvider;
        if (llmModelId) this.llmModelId = llmModelId;
        this.initializeWebSocket(sessionId);
    }

    public closeWebSocket() {
        if (this.websocket) {
            console.log(`Closing God WebSocket - Was called externally`)
            this.websocket.close();
        }
    }

    private initializeWebSocket(sessionId: string) {
        const wsUrl = `${WEBSOCKET_URL}?sessionId=${sessionId}&characterId=god`;
        try {
            this.websocket = new WebSocket(wsUrl);
        } catch (error) {
            console.error(`WebSocket creation error for God:`, error);
            this.onError('Failed to connect');
            return;
        }

        this.websocket.onopen = () => {
            console.log(`God WebSocket connected`);
        };

        this.websocket.onmessage = async (event) => {
            try {
                const parsedData: WebSocketFundRequestMessage = JSON.parse(event.data);
                console.log(`God received message: ${JSON.stringify(parsedData)}`);
                // Always pass the message data to the original handler
                this.onMessageReceived(JSON.stringify(parsedData));
            } catch (error) {
                console.error('Error processing websocket message:', error);
                this.onMessageReceived(event.data); // Fallback to sending raw data
            }
        };

        this.websocket.onerror = (event) => {
            console.warn(`God WebSocket error:`, event);
            this.onError('Connection error');
        };

        this.websocket.onclose = (event) => {
            console.log(`God WebSocket disconnected`);
            if (!event.wasClean) {
                this.onError('Connection closed unexpectedly');
            }

            // Attempt to reconnect
            console.log(`Attempting to reconnect God WebSocket`);
            setTimeout(() => {
                this.initializeWebSocket(this.sessionId);
            }, 300);
        };
    }

    public setChatMode(chatMode: 'STANDARD' | 'RECURSIVE') {
        this.chatMode = chatMode;
    }

    public setLLMSettings(provider: string, modelId: string) {
        this.llmProvider = provider;
        this.llmModelId = modelId;
    }

    sendMessage(message: string) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const payload = {
                action: "sendMessage",
                data: message,
                characterId: "god",
                createdBy: this.userId,
                sessionId: this.sessionId,
                sendersWalletAddress: this.walletAddress,
                temperature: 0.1,
                chatMode: this.chatMode,
                maxLength: 500,
                topP: 0.9,
                llmProvider: this.llmProvider,
                llmModelId: this.llmModelId
            };
            console.log(`God sending message: ${JSON.stringify(payload)}`);
            if (payload.data === "") {
                return;
            }
            this.websocket.send(JSON.stringify(payload));
            console.log(`God sent message: ${JSON.stringify(payload)}`);
        } else {
            console.warn(`God WebSocket is not open. Message not sent.`);
            this.onError('Cannot send message: Not connected');
        }
    }
}
