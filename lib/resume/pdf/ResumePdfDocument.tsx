import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OptimizedResumeData, ResumeTemplateId } from "@/lib/resume/types";

const stylesBase = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 44,
    color: "#111",
    lineHeight: 1.35,
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  headline: { fontSize: 11, marginTop: 4, fontFamily: "Helvetica-Bold", color: "#333" },
  contact: { fontSize: 10, marginTop: 6, color: "#444" },
  sectionClassic: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#bbb",
    paddingBottom: 2,
  },
  sectionExec: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 3,
  },
  sectionCompact: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 3,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  body: { fontSize: 10.5, color: "#222" },
  jobTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  jobMeta: { fontSize: 10, color: "#333", marginTop: 1 },
  dates: { fontSize: 10, color: "#555" },
  bullet: { flexDirection: "row", marginTop: 2, paddingLeft: 8 },
  bulletChar: { width: 10, fontSize: 10.5 },
  bulletText: { flex: 1, fontSize: 10.5 },
});

function contactLine(data: OptimizedResumeData): string {
  return [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" | ");
}

function ExperienceBlock({
  ex,
  bulletPrefix,
}: {
  ex: OptimizedResumeData["experience"][0];
  bulletPrefix: "disc" | "arrow";
}) {
  return (
    <View wrap={false} style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={stylesBase.jobTitle}>{ex.title}</Text>
        <Text style={stylesBase.dates}>{ex.dates}</Text>
      </View>
      <Text style={stylesBase.jobMeta}>
        {ex.company}
        {ex.location ? ` — ${ex.location}` : ""}
      </Text>
      {ex.bullets.map((b, i) => (
        <View key={i} style={stylesBase.bullet}>
          <Text style={stylesBase.bulletChar}>{bulletPrefix === "arrow" ? "▸" : "•"}</Text>
          <Text style={stylesBase.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function ClassicPage({ data }: { data: OptimizedResumeData }) {
  const c = contactLine(data);
  return (
    <Page size="A4" style={stylesBase.page}>
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={stylesBase.name}>{data.full_name}</Text>
        {data.headline ? <Text style={stylesBase.headline}>{data.headline}</Text> : null}
        {c ? <Text style={[stylesBase.contact, { textAlign: "center" }]}>{c}</Text> : null}
      </View>
      {data.summary ? (
        <>
          <Text style={stylesBase.sectionClassic}>Professional summary</Text>
          <Text style={stylesBase.body}>{data.summary}</Text>
        </>
      ) : null}
      {data.skills.length > 0 ? (
        <>
          <Text style={stylesBase.sectionClassic}>Core skills</Text>
          <Text style={stylesBase.body}>{data.skills.join(" · ")}</Text>
        </>
      ) : null}
      {data.experience.length > 0 ? (
        <>
          <Text style={stylesBase.sectionClassic}>Work experience</Text>
          {data.experience.map((ex, i) => (
            <ExperienceBlock key={i} ex={ex} bulletPrefix="disc" />
          ))}
        </>
      ) : null}
      {data.projects && data.projects.length > 0 ? (
        <>
          <Text style={stylesBase.sectionClassic}>Projects</Text>
          {data.projects.map((p, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={stylesBase.jobTitle}>{p.name}</Text>
              {p.description ? <Text style={stylesBase.body}>{p.description}</Text> : null}
              {p.bullets.map((b, j) => (
                <View key={j} style={stylesBase.bullet}>
                  <Text style={stylesBase.bulletChar}>•</Text>
                  <Text style={stylesBase.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : null}
      {data.education.length > 0 ? (
        <>
          <Text style={stylesBase.sectionClassic}>Education</Text>
          {data.education.map((ed, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={stylesBase.jobTitle}>{ed.institution}</Text>
                {ed.dates ? <Text style={stylesBase.dates}>{ed.dates}</Text> : null}
              </View>
              <Text style={stylesBase.body}>{ed.credential}</Text>
            </View>
          ))}
        </>
      ) : null}
      {data.certifications && data.certifications.length > 0 ? (
        <>
          <Text style={stylesBase.sectionClassic}>Certifications</Text>
          {data.certifications.map((c, i) => (
            <View key={i} style={stylesBase.bullet}>
              <Text style={stylesBase.bulletChar}>•</Text>
              <Text style={stylesBase.bulletText}>{c}</Text>
            </View>
          ))}
        </>
      ) : null}
    </Page>
  );
}

function ExecutivePage({ data }: { data: OptimizedResumeData }) {
  const parts = [data.email, data.phone, data.location, data.linkedin].filter(Boolean);
  return (
    <Page size="A4" style={stylesBase.page}>
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingBottom: 12, marginBottom: 4 }}>
        <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold" }}>{data.full_name}</Text>
        {data.headline ? <Text style={stylesBase.headline}>{data.headline}</Text> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {parts.map((p, i) => (
            <Text key={i} style={{ fontSize: 10, color: "#555", marginRight: 8, marginBottom: 4 }}>
              {p}
            </Text>
          ))}
        </View>
      </View>
      {data.summary ? (
        <>
          <Text style={stylesBase.sectionExec}>Summary</Text>
          <Text style={stylesBase.body}>{data.summary}</Text>
        </>
      ) : null}
      {data.skills.length > 0 ? (
        <>
          <Text style={stylesBase.sectionExec}>Skills</Text>
          <Text style={stylesBase.body}>{data.skills.join("  •  ")}</Text>
        </>
      ) : null}
      {data.experience.length > 0 ? (
        <>
          <Text style={stylesBase.sectionExec}>Experience</Text>
          {data.experience.map((ex, i) => (
            <ExperienceBlock key={i} ex={ex} bulletPrefix="arrow" />
          ))}
        </>
      ) : null}
      {data.projects && data.projects.length > 0 ? (
        <>
          <Text style={stylesBase.sectionExec}>Projects</Text>
          {data.projects.map((p, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={stylesBase.jobTitle}>{p.name}</Text>
              {p.bullets.map((b, j) => (
                <View key={j} style={stylesBase.bullet}>
                  <Text style={stylesBase.bulletChar}>▸</Text>
                  <Text style={stylesBase.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : null}
      {data.education.length > 0 ? (
        <>
          <Text style={stylesBase.sectionExec}>Education</Text>
          {data.education.map((ed, i) => (
            <View key={i} style={{ marginBottom: 4, flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={stylesBase.jobTitle}>{ed.institution}</Text>
                <Text style={stylesBase.body}>{ed.credential}</Text>
              </View>
              {ed.dates ? <Text style={stylesBase.dates}>{ed.dates}</Text> : null}
            </View>
          ))}
        </>
      ) : null}
      {data.certifications && data.certifications.length > 0 ? (
        <>
          <Text style={stylesBase.sectionExec}>Certifications</Text>
          {data.certifications.map((c, i) => (
            <View key={i} style={stylesBase.bullet}>
              <Text style={stylesBase.bulletChar}>▸</Text>
              <Text style={stylesBase.bulletText}>{c}</Text>
            </View>
          ))}
        </>
      ) : null}
    </Page>
  );
}

function CompactPage({ data }: { data: OptimizedResumeData }) {
  const c = [data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" · ");
  return (
    <Page size="A4" style={stylesBase.page}>
      <Text style={stylesBase.name}>{data.full_name}</Text>
      {data.headline ? <Text style={stylesBase.headline}>{data.headline}</Text> : null}
      {c ? <Text style={stylesBase.contact}>{c}</Text> : null}
      {data.skills.length > 0 ? (
        <>
          <Text style={stylesBase.sectionCompact}>Core skills</Text>
          <Text style={[stylesBase.body, { fontFamily: "Helvetica-Bold" }]}>{data.skills.join(" · ")}</Text>
        </>
      ) : null}
      {data.summary ? (
        <>
          <Text style={stylesBase.sectionCompact}>Professional summary</Text>
          <Text style={stylesBase.body}>{data.summary}</Text>
        </>
      ) : null}
      {data.experience.length > 0 ? (
        <>
          <Text style={stylesBase.sectionCompact}>Experience</Text>
          {data.experience.map((ex, i) => (
            <ExperienceBlock key={i} ex={ex} bulletPrefix="disc" />
          ))}
        </>
      ) : null}
      {data.projects && data.projects.length > 0 ? (
        <>
          <Text style={stylesBase.sectionCompact}>Projects & volunteer</Text>
          {data.projects.map((p, i) => (
            <View key={i} style={{ marginBottom: 4 }}>
              <Text style={stylesBase.jobTitle}>{p.name}</Text>
              {p.bullets.map((b, j) => (
                <View key={j} style={stylesBase.bullet}>
                  <Text style={stylesBase.bulletChar}>•</Text>
                  <Text style={stylesBase.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      ) : null}
      {data.education.length > 0 ? (
        <>
          <Text style={stylesBase.sectionCompact}>Education</Text>
          {data.education.map((ed, i) => (
            <View key={i} style={{ marginBottom: 3 }}>
              <Text style={{ fontSize: 10.5, fontFamily: "Helvetica-Bold" }}>{ed.institution}</Text>
              <Text style={stylesBase.body}>
                {ed.credential}
                {ed.dates ? ` · ${ed.dates}` : ""}
              </Text>
            </View>
          ))}
        </>
      ) : null}
      {data.certifications && data.certifications.length > 0 ? (
        <>
          <Text style={stylesBase.sectionCompact}>Certifications</Text>
          {data.certifications.map((c, i) => (
            <View key={i} style={stylesBase.bullet}>
              <Text style={stylesBase.bulletChar}>•</Text>
              <Text style={stylesBase.bulletText}>{c}</Text>
            </View>
          ))}
        </>
      ) : null}
    </Page>
  );
}

export function ResumePdfDocument({
  data,
  templateId,
}: {
  data: OptimizedResumeData;
  templateId: ResumeTemplateId;
}) {
  const PageComponent =
    templateId === "executive"
      ? ExecutivePage
      : templateId === "compact"
        ? CompactPage
        : ClassicPage;

  return (
    <Document>
      <PageComponent data={data} />
    </Document>
  );
}
