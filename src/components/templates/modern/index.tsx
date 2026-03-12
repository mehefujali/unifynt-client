/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Hero, About, Stats, Features, Footer } from "../enterprise-sections";

type ModernProps = { data: any; theme: any; school: any };

export const ModernTemplate: React.FC<ModernProps> = ({ data, theme, school }) => {
  return (
    <div style={{ fontFamily: theme.typography.bodyFont }}>
      {/* Design sequence code-e fixed, kintu data JSON theke */}
      <Hero data={data.hero} theme={theme} />
      {data.stats?.show && <Stats data={data.stats} theme={theme} />}
      {data.about?.show && <About data={data.about} theme={theme} />}
      <Features data={data.features} theme={theme} />
      <Footer data={data.footer} theme={theme} school={school} />
    </div>
  );
};