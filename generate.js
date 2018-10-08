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
  var mdList = '';
  var recByTag = {}
  for(var rec of data){
    for(var tag of rec.tags){
      if(!recByTag[tag]){
        recByTag[tag] = [];
      }

      recByTag[tag].push(rec);
    }
    
    mdList += `### [${rec.github.name}](${rec.repo})
*from [${rec.github.owner.login}](${rec.github.html_url}):*
> *${rec.github.description}*

--

`;    
  }


  

  // var md = '';
  var mdTOC = '# Content\n';
  mdTOC += `- By Category\n`

  for (var tag in recByTag) {      
    if (!recByTag.hasOwnProperty(tag)) continue;
    
    mdTOC += `\t- ${tag}\n`

    var entries = recByTag[tag];
    for(var entry of entries){
      mdTOC += `\t\t- [${entry.github.name}](###${entry.github.name})\n`
    }

    mdList += '\n\n';
  }  
  
  var mdAll = `
${mdTOC}

${mdList}
`;
  fs.writeFileSync('README.md', mdAll);
  

})