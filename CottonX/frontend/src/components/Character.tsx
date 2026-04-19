"use client"

import { CHARACTER_SCALE, DIRECTION_ORDER, MAP_OFFSET_X, MAP_OFFSET_Y, SCALE_FACTOR, SPRITE_SIZE, WEBSOCKET_URL } from "@/utils/properties";

interface CharacterBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class Character {
    index: number;
    name: string;
    sprite: HTMLImageElement | null = null;
    spriteLoaded: boolean = false;
    websocket: WebSocket | null = null;
    onMessageReceived: (index: number, message: string) => void;
    onError: (index: number, error: string) => void;
    sessionId: string;
    userId: string;
    address?: `0x${string}`;
    currentBubbleDimensions: CharacterBounds | null = null;

    constructor(
        index: number,
        name: string,
        spriteSrc: string,
        onLoad: () => void,
        onMessageReceived: (index: number, message: string) => void,
        onError: (index: number, error: string) => void,
        sessionId: string,
        userId: string,
        address?: `0x${string}`
    ) {
        this.index = index;
        this.name = name;
        this.sessionId = sessionId;
        this.onMessageReceived = onMessageReceived;
        this.onError = onError;
        this.userId = userId;
        this.address = address;
        this.loadSprite(spriteSrc, onLoad);
        this.initializeWebSocket(sessionId);
        Character.allCharacters.push(this);
    }

    private loadSprite(spriteSrc: string, onLoad: () => void) {
        this.sprite = new Image();
        this.sprite.src = spriteSrc;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
            onLoad();
        };
        this.sprite.onerror = (error) => {
            console.error(`Failed to load sprite image for ${this.name}:`, error);
        };
    }

    public closeWebSocket() {
        if (this.websocket) {
            console.log(`Closing WebSocket for ${this.name} - Was called externally`)
            this.websocket.close();
        }
    }

    private initializeWebSocket(sessionId: string) {
        const wsUrl = `${WEBSOCKET_URL}?sessionId=${sessionId}&characterId=${this.name}`;
        try {
            this.websocket = new WebSocket(wsUrl);
        } catch (error) {
            console.error(`WebSocket creation error for character ${this.name}:`, error);
            this.onError(this.index, 'Failed to connect');
            return;
        }

        this.websocket.onopen = () => {
            console.log(`WebSocket connected for character ${this.name}`);

            const randomTimeHelloMessage = Math.floor(Math.random() * 3000) + 1000;
            setTimeout(() => {
                this.onMessageReceived(this.index, `Hello, I'm ${this.name}`);
                setTimeout(() => {
                    this.onMessageReceived(this.index, "");
                }, 8000); // Changed from 5000 to 8000 milliseconds
            }, randomTimeHelloMessage);
        };

        this.websocket.onmessage = (event) => {
            const message = event.data;
            console.log(`Received Character message: ${JSON.stringify(message)}`);

            if (message && message.trim()) {
                // Show message in both chat and speech bubble
                this.onMessageReceived(this.index, message);

                // Clear the speech bubble after 8 seconds
                setTimeout(() => {
                    this.onMessageReceived(this.index, "");
                }, 8000);
            }
        };

        this.websocket.onerror = (event) => {
            console.warn(`WebSocket error for character ${this.name}:`, event);
            this.onError(this.index, 'Connection error');
        };

        this.websocket.onclose = (event) => {
            console.log(`WebSocket disconnected for character ${this.name}`);
            if (!event.wasClean) {
                this.onError(this.index, 'Connection closed unexpectedly');
            }

            // Attempt to reconnect
            console.log(`Attempting to reconnect WebSocket for character ${this.name}`);
            setTimeout(() => {
                this.initializeWebSocket(this.sessionId);
            }, 300); // Wait for 300 milliseconds before attempting to reconnect
        };
    }

    draw(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        direction: 'up' | 'down' | 'left' | 'right',
        animationFrame: number,
        isMoving: boolean,
        message: string | null
    ) {
        if (!this.spriteLoaded || !this.sprite) return;

        const directionIndex = DIRECTION_ORDER.indexOf(direction);
        const sourceX = directionIndex * SPRITE_SIZE;
        const sourceY = isMoving ? animationFrame * SPRITE_SIZE : 0;

        const scaledX = x * SCALE_FACTOR + MAP_OFFSET_X;
        const scaledY = y * SCALE_FACTOR + MAP_OFFSET_Y;

        const finalScale = SCALE_FACTOR * CHARACTER_SCALE;

        ctx.drawImage(
            this.sprite,
            sourceX,
            sourceY,
            SPRITE_SIZE,
            SPRITE_SIZE,
            scaledX,
            scaledY,
            SPRITE_SIZE * finalScale,
            SPRITE_SIZE * finalScale
        );

        // Draw the speech bubble if there's a message
        if (message) {
            const bubbleX = scaledX + (SPRITE_SIZE * finalScale) / 2;
            const bubbleY = scaledY;
            this.drawSpeechBubble(ctx, bubbleX, bubbleY, message);
        }
    }

    public setAddress(address: `0x${string}`) {
        this.address = address;
    }

    drawSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, message: string) {
        // Bubble styling constants
        const padding = 30;
        const maxWidth = 800;
        const minWidth = 300;
        const lineHeight = 40;
        const fontSize = 28;
        const borderRadius = 15;
        const tailHeight = 25;

        // Set text properties with bold font for better legibility
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';

        // Calculate optimal width for the text
        const words = message.split(' ');
        const spaceWidth = ctx.measureText(' ').width;
        const wordWidths = words.map(word => ctx.measureText(word).width);

        // Try to fit text in one line first
        const totalWidth = wordWidths.reduce((sum, width) => sum + width, 0) +
            (words.length - 1) * spaceWidth;

        // Target width: try to keep text in as few lines as possible while staying within bounds
        const targetWidth = Math.min(maxWidth, Math.max(minWidth, totalWidth + padding * 2));

        // Word wrap the text
        const lines: string[] = [];
        let currentLine = words[0];
        let currentWidth = wordWidths[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const wordWidth = wordWidths[i];
            const testWidth = currentWidth + spaceWidth + wordWidth;

            if (testWidth <= targetWidth - padding * 2) {
                currentLine += ' ' + word;
                currentWidth = testWidth;
            } else {
                lines.push(currentLine);
                currentLine = word;
                currentWidth = wordWidth;
            }
        }
        lines.push(currentLine);

        // Calculate bubble dimensions
        const bubbleWidth = Math.min(
            maxWidth,
            Math.max(minWidth, Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2)
        );
        const bubbleHeight = (lines.length * lineHeight) + (padding * 2);

        // Calculate initial position (centered above character)
        let bubbleX = x - (bubbleWidth / 2);
        let bubbleY = y - bubbleHeight - tailHeight;

        // Adjust for screen edges
        const canvas = ctx.canvas;
        const margin = 20;

        // Horizontal adjustment
        if (bubbleX < margin) {
            bubbleX = margin;
        } else if (bubbleX + bubbleWidth > canvas.width - margin) {
            bubbleX = canvas.width - margin - bubbleWidth;
        }

        // Vertical adjustment
        let tailPosition: 'top' | 'bottom' = 'bottom';
        if (bubbleY < margin) {
            // Place bubble below character if too high
            bubbleY = y + SPRITE_SIZE * SCALE_FACTOR + tailHeight;
            tailPosition = 'top';
        }

        // Store dimensions for collision detection
        this.currentBubbleDimensions = {
            x: bubbleX,
            y: bubbleY,
            width: bubbleWidth,
            height: bubbleHeight + tailHeight
        };

        // Check for collisions with other bubbles
        if (this.checkBubbleCollision()) {
            // If collision, move bubble up further
            const adjustment = bubbleHeight + tailHeight;
            this.currentBubbleDimensions.y -= adjustment;
            bubbleY -= adjustment;
            tailPosition = 'bottom';
        }

        // Draw bubble
        ctx.save();

        // Background
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // Draw rounded rectangle
        ctx.beginPath();
        ctx.moveTo(bubbleX + borderRadius, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - borderRadius, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + borderRadius);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - borderRadius);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - borderRadius, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + borderRadius, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - borderRadius);
        ctx.lineTo(bubbleX, bubbleY + borderRadius);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + borderRadius, bubbleY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw tail
        ctx.beginPath();
        const tailX = Math.min(Math.max(x, bubbleX + 20), bubbleX + bubbleWidth - 20);

        if (tailPosition === 'bottom') {
            ctx.moveTo(tailX - 10, bubbleY + bubbleHeight);
            ctx.lineTo(tailX, bubbleY + bubbleHeight + tailHeight);
            ctx.lineTo(tailX + 10, bubbleY + bubbleHeight);
        } else {
            ctx.moveTo(tailX - 10, bubbleY);
            ctx.lineTo(tailX, bubbleY - tailHeight);
            ctx.lineTo(tailX + 10, bubbleY);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = 'black';
        lines.forEach((line, i) => {
            const textX = bubbleX + padding;
            const textY = bubbleY + padding + (i * lineHeight);
            ctx.fillText(line, textX, textY);
        });

        ctx.restore();
    }

    private checkBubbleCollision(): boolean {
        // Get all other characters' bubble dimensions
        const otherBubbles = Character.allCharacters
            .filter(char => char !== this && char.currentBubbleDimensions)
            .map(char => char.currentBubbleDimensions!);

        if (!this.currentBubbleDimensions) return false;

        // Check for collisions with other bubbles
        return otherBubbles.some(otherBubble => {
            return this.isOverlapping(this.currentBubbleDimensions!, otherBubble);
        });
    }

    private isOverlapping(bubble1: CharacterBounds, bubble2: CharacterBounds): boolean {
        return !(
            bubble1.x + bubble1.width < bubble2.x ||
            bubble1.x > bubble2.x + bubble2.width ||
            bubble1.y + bubble1.height < bubble2.y ||
            bubble1.y > bubble2.y + bubble2.height
        );
    }

    // Helper function to draw a rounded rectangle - also needs scaling
    drawRoundedRectangle(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
    ) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Static property to keep track of all character instances
    private static allCharacters: Character[] = [];

    // Clean up method to remove character from static array
    public destroy() {
        const index = Character.allCharacters.indexOf(this);
        if (index > -1) {
            Character.allCharacters.splice(index, 1);
        }
        this.closeWebSocket();
    }
}
