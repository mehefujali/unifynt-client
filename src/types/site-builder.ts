export interface ISiteTemplate {
  id: string;
  templateCode: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  defaultThemeSettings?: Record<string, unknown>;
  defaultContent?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISchoolSiteConfig {
  id: string;
  schoolId: string;
  activeTemplateId: string;
  themeSettings?: Record<string, unknown>;
  content?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data:any
}

export interface IUpdateSiteConfigPayload {
  activeTemplateId?: string;
  themeSettings?: Record<string, unknown>;
  content?: Record<string, unknown>;
}