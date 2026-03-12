/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { Hero, About, Stats, Features, Footer } from "./enterprise-sections";

type TemplateProps = { data: any; theme: any; school: any };

export const ModernTemplate: React.FC<TemplateProps> = ({ data, theme, school }) => {
  return (
    <div style={{ fontFamily: theme?.typography?.bodyFont || "Inter" }}>
      <Hero data={data?.hero} theme={theme} />
      {data?.stats?.show && <Stats data={data.stats} theme={theme} />}
      {data?.about?.show && <About data={data.about} theme={theme} />}
      {data?.features?.show && <Features data={data.features} theme={theme} />}
      <Footer data={data?.footer} theme={theme} school={school} />
    </div>
  );
};

export const TEMPLATE_MAP: Record<string, React.FC<TemplateProps>> = {
  "template_modern_01": ModernTemplate,
};