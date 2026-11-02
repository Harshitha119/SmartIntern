declare module "pdf-parse/lib/pdf-parse.js" {
  function pdfParse(data: Buffer): Promise<{
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    text: string;
  }>;

  export = pdfParse;
}
