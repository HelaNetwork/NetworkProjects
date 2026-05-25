// Sprite and animation constants
export const SPRITE_SIZE = 100; // Keep original sprite size
export const ANIMATION_FRAMES = 4;
export const FRAME_DURATION = 200;

// WebSocket constants
export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WSS_URL;

// Map constants
export const MAP_WIDTH = 1152;
export const MAP_HEIGHT = 1320;
export const DEBUG_WALKABLE_AREAS = false;
export const DEBUG_CHARACTER_SELECT_BOXES = false;
export const WALKABLE_AREAS = [
    { x: -1500, y: 160, width: 3950, height: 440 },
    { x: -50, y: 650, width: 1200, height: 1730 },
];

// Canvas and scaling constants
export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1920;
export const SCALE_FACTOR = typeof window !== 'undefined' ? Math.min(
    window.innerWidth * 0.6 / CANVAS_WIDTH,
    (window.innerHeight - 32) / CANVAS_HEIGHT
) : 1;

// Additional scaling factor just for characters
export const CHARACTER_SCALE = 3.6; // 1.8 * 2 = 3.6

export const SCALED_MAP_WIDTH = MAP_WIDTH * SCALE_FACTOR;
export const SCALED_MAP_HEIGHT = MAP_HEIGHT * SCALE_FACTOR;
export const MAP_OFFSET_X = (CANVAS_WIDTH - (SCALED_MAP_WIDTH)) / 2;
export const MAP_OFFSET_Y = (CANVAS_HEIGHT - (SCALED_MAP_HEIGHT)) / 2;

// Movement speeds adjusted for larger characters
export const PLAYER_MOVE_SPEED = 14;
export const AI_MOVE_SPEED = 4.4;

// AI action durations in milliseconds
export const AI_MOVE_DURATION_MIN = 2000;
export const AI_MOVE_DURATION_MAX = 6000;
export const AI_PAUSE_DURATION_MIN = 3000;
export const AI_PAUSE_DURATION_MAX = 8000;

// List of possible directions
export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;

// Direction order for sprite sheet
export const DIRECTION_ORDER = ['down', 'left', 'up', 'right'] as const;
