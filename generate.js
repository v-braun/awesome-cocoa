const request = require('request');
const dataUrl = 'https://raw.githubusercontent.com/v-braun/cocoa-rocks/master/src/data/data.compiled.json';
const log = require('colorprint');
const fs = require('fs');

function createEntry(rec){
  let md = `**[${rec.github.name}](${rec.repo})**
*from [${rec.github.owner.login}](${rec.github.owner.html_url}):*
> *${rec.github.description}* 

`
  return md
}

function createList(recByTag){
  let result = '';
  for (let tag in recByTag) {      
    if (!recByTag.hasOwnProperty(tag)) continue;

    let records = recByTag[tag];
    result += `
## ${tag}
`;
    for(let rec of records){
      let entry = createEntry(rec);
      result += entry + '\n\n';
    }
  }

  return result;
}

function createNew(data){
  let max = data.length;
  if(max > 10){
    max = 10
  }

  let newEntries = [];
  for(let i = 0; i < max; i++ ){
    let entry = createEntry(data[i]);
    entry += `

![](${data[i].banner})

`;
    newEntries.push(entry);
  }

  let result = newEntries.join(`


--------------------------

`);

  return result;
}

function createRecByTag(data){
  let recByTag = {};
  for(let rec of data){
    let tag = rec.tags[0];
    if(!recByTag[tag]){
      recByTag[tag] = [];
    }

    recByTag[tag].push(rec);
  }

  return recByTag;
}

function createTOC(recByTag){
  let result = `  
# Content  
- [New](#new)
- [By Category](#By-Category)
`
  
  for (let tag in recByTag) {      
    if (!recByTag.hasOwnProperty(tag)) continue;
    let space1 = '    ';
    result += `${space1}- [${tag}](#${tag})\n`
  }

  return result;
}

request.get({uri: dataUrl}, (err, response, body) => {
  if(err){
    log.fatal('fetch for data failed');
    log.error(err);
    return process.exit(1);
  }

  let data = JSON.parse(body);
  log.notice(`data file downloaded with ${data.length}`);
  
  let recByTag = createRecByTag(data);
  let toc = createTOC(recByTag)
  let list = createList(recByTag);
  let newList = createNew(data);

  
  let mdAll = `
[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)
![PR Welcome](https://img.shields.io/badge/PR-welcome-green.svg)

# awesome-cocoa
A curated list of awesome cocoa libraries.

# Contributing

Want to share a new Cocoa Control?
Add your repo's information to my [cocoa-rocks](https://github.com/v-braun/cocoa-rocks) repository.

Your repo will be published on the [cocoa.rocks](https://cocoa.rocks) website and here.

${toc}

# New

${newList}

# By Category
${list}
`;
  fs.writeFileSync('README.md', mdAll);
  

})