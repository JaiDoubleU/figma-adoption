var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var import_figma_calculations = __toModule(require("figma-calculations"));
const figmaCalculator = new import_figma_calculations.FigmaCalculator();
const API_TOKEN = "294730-0ad632d6-1f96-4bcc-b6e7-92d1d5d9b7e2";
const FIGMA_TEAM_IDS = [
  "870439247237197912"
];
const FIGMA_STYLE_TEAM_ID = "870439247237197912";
const startProcessing = async () => {
  figmaCalculator.setAPIToken(API_TOKEN);
  console.log("Fetching File Ids...");
  const { files } = await figmaCalculator.getFilesForTeams(FIGMA_TEAM_IDS, 2, true);
  console.log("Fetching Styles...");
  await figmaCalculator.loadComponents(FIGMA_STYLE_TEAM_ID);
  await figmaCalculator.loadStyles(FIGMA_STYLE_TEAM_ID);
  const allPages = [];
  if (files.length === 0) {
    console.error("No Files Ids Retrieved.. Exiting");
    return;
  }
  console.log("Iterating over " + files.length + " files...");
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log("Processing file name: " + file.name);
    try {
      await figmaCalculator.fetchCloudDocument(file.key);
    } catch (ex) {
      console.error(`Failed to fetch ${file.key}`);
      continue;
    }
    console.log(`Processing file of ${i + 1} of ${files.length}`);
    for (const page of figmaCalculator.getAllPages()) {
      const processedNodes = figmaCalculator.processTree(page);
      const pageDetails = {
        file,
        pageAggregates: processedNodes.aggregateCounts,
        pageName: page.name
      };
      allPages.push(pageDetails);
    }
  }
  const teamBreakdown = figmaCalculator.getBreakDownByTeams(allPages);
  printTeamTable(teamBreakdown);
};
startProcessing();
function printTeamTable(teamBreakdown) {
  const { totals: { adoptionPercent, lintPercentages }, teams } = teamBreakdown;
  console.log("Your Figma Stats");
  console.log("------------------------------------");
  console.log(`Component Adoption: ${adoptionPercent}%`);
  console.log(`Text Style Full Match: ${lintPercentages["Text-Style"].full}`);
  console.log(`Fill Style Full Match: ${lintPercentages["Fill-Style"].full}`);
  const flatTeams = [];
  for (const teamName of Object.keys(teams)) {
    const { adoptionPercent: adoptionPercent2, lintPercentages: lintPercentages2 } = teams[teamName];
    flatTeams.push({
      teamName,
      adoptionPercent: adoptionPercent2,
      fillMatch: lintPercentages2["Fill-Style"].full,
      textMatch: lintPercentages2["Text-Style"].full
    });
  }
  console.table(flatTeams);
}
//# sourceMappingURL=index.js.map
