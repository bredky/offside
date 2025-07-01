const fs = require('fs');
const { parse } = require('csv-parse/sync');

const inputFile = 'src/data/players_raw.csv';
const outputFile = 'src/app/api/parse/players.json';

const wantedFields = ['first_name', 'second_name', 'web_name', 'team'];

const data = fs.readFileSync(inputFile);
const records = parse(data, { columns: true });
const filtered = records.map(row => {
  let obj = {};
  wantedFields.forEach(f => obj[f] = row[f]);
  return obj;
});
fs.writeFileSync(outputFile, JSON.stringify(filtered, null, 2));
console.log(`Converted to ${outputFile}`);