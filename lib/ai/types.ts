// AI Provider abstraction types

export interface GenerationOptions {
    prompt: string;
    style?: StylePreset;
    aspectRatio?: "16:9" | "1:1" | "4:3";
    quality?: "standard" | "hd" | "4k";
    count?: number; // Number of images to generate
    referenceImage?: {
        base64: string;
        mimeType: string;
    };
}

export interface GeneratedImage {
    base64: string;
    mimeType: string;
    width?: number;
    height?: number;
}

export interface GenerationResult {
    success: boolean;
    images?: GeneratedImage[];
    error?: string;
    promptUsed?: string;
}

export interface AIProvider {
    name: string;
    generateImages(options: GenerationOptions): Promise<GenerationResult>;
}

// Style presets for thumbnail generation
export interface StylePreset {
    id: string;
    name: string;
    description: string;
    promptModifier: string;
    icon?: string;
}

export const STYLE_PRESETS: StylePreset[] = [
    {
        id: "gaming",
        name: "Gaming",
        description: "Bold, colorful gaming style with dynamic elements",
        promptModifier: "gaming thumbnail style, bold text, neon colors, dynamic action pose, dramatic lighting, video game aesthetic",
    },
    {
        id: "vlog",
        name: "Vlog",
        description: "Clean, personal vlog aesthetic",
        promptModifier: "vlog thumbnail style, warm colors, friendly expression, lifestyle aesthetic, clean background, relatable feel",
    },
    {
        id: "tutorial",
        name: "Tutorial",
        description: "Professional educational style",
        promptModifier: "tutorial thumbnail style, clean design, professional look, educational aesthetic, clear and simple, informative",
    },
    {
        id: "reaction",
        name: "Reaction",
        description: "Expressive reaction-style thumbnails",
        promptModifier: "reaction thumbnail style, exaggerated expression, surprised face, dramatic, eye-catching, emotional impact",
    },
    {
        id: "cinematic",
        name: "Cinematic",
        description: "Movie poster quality visuals",
        promptModifier: "cinematic thumbnail style, movie poster quality, dramatic lighting, film grain, epic composition, professional photography",
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean, modern minimal design",
        promptModifier: "minimalist thumbnail style, clean design, simple composition, modern aesthetic, white space, elegant typography",
    },
    {
        id: "mrbeast",
        name: "MrBeast Style",
        description: "High-energy viral thumbnail style",
        promptModifier: "MrBeast thumbnail style, extremely bright colors, shocked expression, money symbols, over-the-top dramatic, viral aesthetic, bold yellow and red",
    },
    {
        id: "tech",
        name: "Tech Review",
        description: "Sleek tech product showcase",
        promptModifier: "tech review thumbnail style, product showcase, clean gradient background, modern tech aesthetic, professional lighting, gadget focus",
    },
];

export function getStyleById(styleId: string): StylePreset | undefined {
    return STYLE_PRESETS.find(style => style.id === styleId);
}

export function buildEnhancedPrompt(prompt: string, style?: StylePreset): string {
    const basePrompt = `Create a YouTube thumbnail image: ${prompt}`;

    const styleModifier = style?.promptModifier || "professional YouTube thumbnail style, eye-catching, high quality";

    const qualityModifiers = "4K quality, highly detailed, vibrant colors, professional composition, youtube thumbnail aspect ratio 16:9";

    return `${basePrompt}. Style: ${styleModifier}. ${qualityModifiers}`;
}
