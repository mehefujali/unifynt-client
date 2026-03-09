"use client";


import { Hero, About, Stats, Features, Footer } from "./enterprise-sections";

export const ModernTemplate = ({ data, theme, school }: any) => {
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

export const TEMPLATE_MAP: Record<string, any> = {
  "template_modern_01": ModernTemplate,
};