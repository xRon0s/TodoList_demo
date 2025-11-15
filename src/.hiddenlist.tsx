export const match = [
    "アイラ",
    "リリス"
] as const;
export type Match = typeof match[number];

export const special_event = [
    "クリスマス",
    "ハロウィン",
    "正月",
    "バレンタイン"
] as const;
export type special_event = typeof special_event[number];