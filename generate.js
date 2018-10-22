const request = require('request');
const dataUrl = 'https://raw.githubusercontent.com/v-braun/cocoa-rocks/master/src/data/data.compiled.json';
const log = require('colorprint');
const fs = require('fs');

function createEntry(rec){
  let tags = rec.tags.join(', ');
    
  let md = `### [${rec.github.name}](${rec.repo})
*from [${rec.github.owner.login}](${rec.github.html_url}):*
> *${rec.github.description}* 

Categories: ${tags}
`
  return md
}

function createList(data){
  let entries = []
  for(let rec of data){
    let entry = createEntry(rec);
    entries.push(entry)
  }

  let result = entries.join(`


--------------------------

`);

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

function createTOC(data){
  let recByTag = {};
  for(let rec of data){
    for(let tag of rec.tags){
      if(!recByTag[tag]){
        recByTag[tag] = [];
      }

      recByTag[tag].push(rec);
    }
  }
  let result = `  
# Content  
- [Contributing](#contributing)
- [New](#new)
- [All](#all)
- By Category
`
  
  for (let tag in recByTag) {      
    if (!recByTag.hasOwnProperty(tag)) continue;
    let space1 = '    ';
    let space2 = '  ';
    result += `${space1}- ${tag}\n`

    let entries = recByTag[tag];
    for(let entry of entries){
      result += `${space1}${space2}- [${entry.github.name}](#${entry.github.name.toLowerCase()})\n`
    }

   // result += '\n\n';
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
  
  let toc = createTOC(data)
  let list = createList(data);
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

# All

${list}
`;
  fs.writeFileSync('README.md', mdAll);
  

})