import { createWriteStream } from "fs";
import fs from "fs-extra";
import { join } from "path";
import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util";
import { getCurrentFolderPath } from "../fs-tools.js";

const asyncPipeline = promisify(pipeline);

export const generatePDF = async (data) => {
  try {
    const fonts = {
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };

    const docDefinition = {
      content: [{ text: `You searched for:`, style: "header" }, `Title`],
    };
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred while creating PDF");
  }
};
