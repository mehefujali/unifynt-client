export interface MarksheetConfig {
  header: {
    titleSize: "sm" | "md" | "lg" | "xl";
    headingText: string;
    subtitle: string;
    affiliationText: string;
    showLogo: boolean;
  };
  profile: {
    showPhoto: boolean;
    /** Dynamic list of fields to show in the profile section */
    fields: {
      key: string; // E.g. "studentId", "dob", "bloodGroup", "sectionName"
      label: string; // E.g. "Student ID", "Date of Birth", "Blood Group"
      isVisible: boolean;
    }[];
  };
  table: {
    showMinMarks: boolean;
    showGrades: boolean;
  };
  footer: {
    signature1Text: string;
    signature2Text: string;
    signature3Text: string;
    showDate: boolean;
  };
  design: {
    themeColor: string;
    watermarkType: "image" | "text" | "none";
    customWatermarkText: string;
    watermarkOpacity: number;
  };
}

export const defaultMarksheetConfig: MarksheetConfig = {
  header: {
    titleSize: "lg",
    headingText: "", // Empty means use original school name
    subtitle: "Excellence in Global Education, New Delhi",
    affiliationText: "AFFILIATED TO CENTRAL BOARD OF SECONDARY EDUCATION",
    showLogo: true,
  },
  profile: {
    showPhoto: true,
    fields: [
      { key: "studentId", label: "Student ID", isVisible: true },
      { key: "className", label: "Class", isVisible: true },
      { key: "sectionName", label: "Section", isVisible: true },
      { key: "rollNumber", label: "Roll Number", isVisible: true },
      { key: "dob", label: "Date of Birth", isVisible: true },
      { key: "bloodGroup", label: "Blood Group", isVisible: false },
    ],
  },
  table: {
    showMinMarks: true,
    showGrades: true,
  },
  footer: {
    signature1Text: "Class Teacher",
    signature2Text: "Parent / Guardian",
    signature3Text: "Principal",
    showDate: true,
  },
  design: {
    themeColor: "#4f46e5", // default primary
    watermarkType: "image",
    customWatermarkText: "UNIFYNT",
    watermarkOpacity: 4, // 0.04 - 15% range
  },
};
