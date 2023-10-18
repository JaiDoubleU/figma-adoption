import cTable from 'console.table';
import { FigmaCalculator } from "figma-calculations";

const figmaCalculator = new FigmaCalculator();


// this is the API token for Figma
const API_TOKEN = '294730-0ad632d6-1f96-4bcc-b6e7-92d1d5d9b7e2'
//process.env['Figma-API-Token']


// these are the Figma Team IDs to retrieve
//https://www.figma.com/files/File_ID/team/Team_ID
// https://www.figma.com/files/1085986286497345294/team/870439247237197912
// https://www.figma.com/files/1085986286497345294/team/870439247237197912
const FIGMA_TEAM_IDS = [
  "870439247237197912"
]

// this is the team id that publishes all of your designs. We'll use the styles from here to check for linting
const FIGMA_STYLE_TEAM_ID = "870439247237197912"

const startProcessing = async () => {

  figmaCalculator.setAPIToken(API_TOKEN)

  console.log('Fetching File Ids...')
  // fetch all of the files edited in last two weeks
  // note: may take some time
  const { files } = await
    figmaCalculator.getFilesForTeams(FIGMA_TEAM_IDS, 2, true)

  console.log('Fetching Styles...')
  // load up any style libraries
  await figmaCalculator.loadComponents(FIGMA_STYLE_TEAM_ID);
  await figmaCalculator.loadStyles(FIGMA_STYLE_TEAM_ID);

  const allPages = [];

  if (files.length === 0) {
    console.error("No Files Ids Retrieved.. Exiting")
    return;
  }
  console.log("Iterating over " + files.length + " files...")

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // you can further optimize by tossing out certain file names
    console.log('Processing file name: ' +file.name);
    try {
      await figmaCalculator.fetchCloudDocument(file.key);
    } catch (ex) {
      console.error(`Failed to fetch ${file.key}`);
      continue;
    }

    console.log(`Processing file of ${i + 1} of ${files.length}`);

    // run through all of the pages and process them
    for (const page of figmaCalculator.getAllPages()) {
      const processedNodes = figmaCalculator.processTree(page);

      const pageDetails = {
        file,
        pageAggregates: processedNodes.aggregateCounts,
        pageName: page.name,
      };
      allPages.push(pageDetails);
    }
  }

  const teamBreakdown = figmaCalculator.getBreakDownByTeams(allPages);

  printTeamTable(teamBreakdown)

}

startProcessing();


function printTeamTable(teamBreakdown: any) {
  const { totals: { adoptionPercent, lintPercentages }, teams } = teamBreakdown;


  console.log("Your Figma Stats")
  console.log("------------------------------------")
  console.log(`Component Adoption: ${adoptionPercent}%`)
  console.log(`Text Style Full Match: ${lintPercentages['Text-Style'].full}`)
  console.log(`Fill Style Full Match: ${lintPercentages['Fill-Style'].full}`)

  const flatTeams = [];
  for (const teamName of Object.keys(teams)) {
    const { adoptionPercent, lintPercentages } = teams[teamName];
    flatTeams.push({
      teamName,
      adoptionPercent,
      fillMatch: lintPercentages['Fill-Style'].full,
      textMatch: lintPercentages['Text-Style'].full,
    })
  }
  console.table(flatTeams)
}
