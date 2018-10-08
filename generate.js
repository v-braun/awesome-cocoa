const request = require('request');
const dataUrl = 'https://raw.githubusercontent.com/v-braun/cocoa-rocks/master/src/data/data.compiled.json';
const log = require('colorprint');
const fs = require('fs');

request.get(dataUrl, (err, response, body) => {
  if(err){
    log.fatal('fetch for data failed');
    log.error(err);
    return process.exit(1);
  }

  var data = JSON.parse(body);
  log.notice(`data file downloaded with ${data.length}`);
  var recByTag = {}
  for(var rec of data){
    for(var tag of rec.tags){
      if(!recByTag[tag]){
        recByTag[tag] = [];
      }

      recByTag[tag].push(rec);
    }
  }

  // var md = '';
  var mdTOC = '# By Tags\n';
  var mdList = '';
  for (var tag in recByTag) {      
    if (!recByTag.hasOwnProperty(tag)) continue;
    
    mdTOC += `- [${tag}](#${tag})\n`

    var entries = recByTag[tag];
    mdList += `## ${tag}\n`;
    for(var entry of entries){
      mdList += `### [${entry.github.name}](${entry.repo})
> *${entry.github.description}*

*from [${entry.github.owner.login}](${entry.github.html_url})*

`;
    }

    mdList += '\n\n';
  }  
  
  var mdAll = `
${mdTOC}

${mdList}
`;
  fs.writeFileSync('README.md', mdAll);
  

})