/* eslint-disable @typescript-eslint/no-explicit-any */
export const parseTemplateContent = (content: any, schoolData: any): any => {
  if (!content) return {};
  
  const schoolContext = {
    school_name: schoolData.name || "Our School",
    school_email: schoolData.email || "",
    school_phone: schoolData.phone || "",
    school_address: schoolData.address || "",
    school_logo: schoolData.logo || "",
    principal_name: schoolData.principalName || "",
  };

  const replacePlaceholders = (text: string) => {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const cleanKey = key.trim() as keyof typeof schoolContext;
      return schoolContext[cleanKey] !== undefined ? schoolContext[cleanKey] : match;
    });
  };

  const traverseAndReplace = (obj: any): any => {
    if (typeof obj === 'string') {
      return replacePlaceholders(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(traverseAndReplace);
    }
    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = traverseAndReplace(obj[key]);
      }
      return newObj;
    }
    return obj;
  };

  return traverseAndReplace(content);
};