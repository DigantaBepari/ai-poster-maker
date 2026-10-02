export type Occasion =
  | "victory-day"
  | "condolence"
  | "election-campaign"
  | "greetings"
  | "eid-festival";
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "admin";
}
export interface LayoutConfig {
  canvas: { width: number; height: number };
  photoSlots: {
    x: number;
    y: number;
    w: number;
    h: number;
    shape: "circle" | "oval" | "rectangle";
  }[];
  textSlots: {
    key: string;
    x: number;
    y: number;
    w: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    align: "left" | "center" | "right";
  }[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    footerBg: string;
  };
  decorations: {
    type: "border" | "rice-paddy" | "circle" | "footer" | "flourish";
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  }[];
}
export interface Template {
  _id: string;
  title: string;
  occasionType: Occasion;
  thumbnailUrl: string;
  layoutConfig: LayoutConfig;
  isActive: boolean;
}
export interface Poster {
  _id: string;
  userId: string;
  templateId: string;
  formData: {
    name: string;
    designation: string;
    party: string;
    union: string;
    thana: string;
    district: string;
    occasionType: Occasion;
    headline: string;
    photoConsent: boolean;
  };
  uploadedPhotoUrls: string[];
  generatedImageUrl?: string;
  generatedPdfUrl?: string;
  status: "draft" | "generating" | "completed" | "failed";
  retryCount: number;
  remainingRegenerations?: number;
  maxRegenerations?: number;
  flagged: boolean;
  errorMessage?: string;
  createdAt: string;
}
