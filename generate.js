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

  let entries = []
  let records = recByTag[tag];
    result += `
## ${tag}
`
    for(let rec of records){
      let entry = createEntry(rec);
      entries.push(entry)
    }

    result += entries.join(`


--------------------------
    
`);
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

request.get(dataUrl, (err, response, body) => {
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
# awesome-cocoa
A curated list of awesome cocoa libraries.

# Contributing

Want to share a new Cocoa Control?
Add your repo's information to my [cocoa-rocks](https://github.com/v-braun/cocoa-rocks) repository.

Your repo will be published on the [cocoa.rocks](https://cocoa.rocks) website and here.

${toc}

# New

${newList}


${list}
`;
  fs.writeFileSync('README.md', mdAll);
  

})