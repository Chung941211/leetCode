const superagent = require("superagent");
const fs = require("fs");
const eventproxy = require('eventproxy');

const makeMarkdownFile = (data) => {
  let { problems, num_total, num_solved, num_locked } = data;

  let tpl =
`# Leetcode

Update time: ${new Date}

I have solved **${num_solved} / ${num_total}** problems while **${num_locked}** problems are still locked.

(Notes: :blue_book: means you need to buy a book from Leetcode)

| # | Title | Source Code | Explanation | Difficulty |
|:---:|:---:|:---:|:---:|:---:|
`
  // sort by the problemId desc
  problems.sort((a, b) => a.problemId - b.problemId);

  problems.forEach(item => {
    let {problemId, title, url, languageJS, sourceCodeJS, languagePY, sourceCodePY, languageCPP, sourceCodeCPP, explanation, difficulty, isSolved, isLocked} = item;
    tpl += `| ${problemId} | [${title}](${url}) `;

    if (isLocked)
      tpl += ':blue_book: ';

    if (isSolved) {
      let languageArray = [];
      if (languageJS)
        languageArray.push(`[${languageJS}](${sourceCodeJS})`)
      if (languagePY)
        languageArray.push(`[${languagePY}](${sourceCodePY})`)
      if (languageCPP)
        languageArray.push(`[${languageCPP}](${sourceCodeCPP})`)

      tpl += '| ' + languageArray.join(' ') + ' '
    } else {
      tpl += '| ';
    }

    if (explanation)
      tpl += `| [Explanation](${explanation}) `;
    else {
      tpl += '| ';
    }

    tpl += `| ${difficulty} |`;
    tpl += '\n';
  })

  return new Promise((resolve, reject) => {
    fs.writeFile('readme.md', tpl, () => {
      resolve("ok!");
    });
  });
}


const dealWithFile = (data) => {
  return new Promise((resolve, reject) => {
    let ep = new eventproxy();
    let baseNetSrc = 'https://github.com/Chung941211/leetCode/tree/master/Algorithms/';

    ep.after('read', data.num_solved, problems => {
      resolve(data);
    });

    data.problems.forEach(p => {
      if (p.isSolved) {
        let fileSrc = 'Algorithms/' + p.title.trim();

        fs.readdir(fileSrc, (err, files) => {
          if (err) {
            console.error(fileSrc)
            return
          }

          files.forEach((fileName) => {
            if (fileName.endsWith("md")) {
              p.explanation = encodeURI(baseNetSrc + p.title + '/' + fileName);
            } else {
              // language -> JavaScript / Python / C++
              if (fileName.endsWith("js")) {
                p.languageJS = "JavaScript";
                p.sourceCodeJS = encodeURI(baseNetSrc + p.title + '/' + fileName);
              } else if (fileName.endsWith("cpp")) {
                p.languageCPP = "C++";
                p.sourceCodeCPP = encodeURI(baseNetSrc + p.title + '/' + fileName);
              } else if (fileName.endsWith("py")) {
                p.languagePY = "Python";
                p.sourceCodePY = encodeURI(baseNetSrc + p.title + '/' + fileName);
              }
            }
          });
          ep.emit('read', p);
        });
      }
    });
  });
}

const makeRequest = () => {
  const cookie = fs.readFileSync('cookie.txt').toString()
  return new Promise((resolve, reject) => {
    superagent
      .get('https://leetcode-cn.com/api/problems/algorithms')
      .set("cookie", cookie)
      .end((err, res) => {
        let {stat_status_pairs, num_total, num_solved} = JSON.parse(res.text);
        let num_locked = 0;
        
        let problems = stat_status_pairs.map(item => {
          let obj = {
            isSolved: item.status === "ac",
            problemId: item.stat.question_id,
            title: item.stat.question__title,
            url: "https://leetcode.com/problems/" + item.stat.question__title_slug + '/',
            isLocked: item.paid_only === true,
            difficulty: ['', 'Easy', 'Medium', 'Hard'][item.difficulty.level],
          };

          obj.isLocked && num_locked++;
          return obj;
        });

        resolve({problems, num_total, num_solved, num_locked});
      });
  });
}

// Promise
makeRequest().then(data => {
  return dealWithFile(data);
}).then(data => {
  return makeMarkdownFile(data);
}).then(msg => {
  console.log(msg);
});
