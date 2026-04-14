import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_NOW_DATABASE_ID ?? "";

export interface NowItem {
  title: string;
  type: "building" | "learning";
  status?: string;
  description?: string;
  order: number;
}

/** Fetch all items from the Now page Notion database. */
export async function fetchNowItems(): Promise<NowItem[]> {
  if (!process.env.NOTION_API_KEY || !DATABASE_ID) {
    console.warn("[notion] Missing NOTION_API_KEY or NOTION_NOW_DATABASE_ID — returning empty.");
    return [];
  }

  try {
    const response = await notion.dataSources.query({
      data_source_id: DATABASE_ID,
      sorts: [{ property: "Order", direction: "ascending" }],
    });

    return response.results.map((page) => {
      const props = (page as any).properties;
      return {
        title: extractTitle(props.Title ?? props.Name),
        type: extractSelect(props.Type) as "building" | "learning",
        status: extractText(props.Status) || undefined,
        description: extractText(props.Description) || undefined,
        order: extractNumber(props.Order) ?? 99,
      };
    });
  } catch (error) {
    console.error("[notion] Failed to fetch Now items:", error);
    return [];
  }
}

// ── Property extractors ──

function extractTitle(prop: any): string {
  if (!prop?.title) return "";
  return prop.title.map((t: any) => t.plain_text).join("");
}

function extractText(prop: any): string {
  if (!prop) return "";
  if (prop.type === "rich_text") {
    return prop.rich_text.map((t: any) => t.plain_text).join("");
  }
  return "";
}

function extractSelect(prop: any): string {
  return prop?.select?.name ?? "";
}

function extractNumber(prop: any): number | null {
  return prop?.number ?? null;
}
