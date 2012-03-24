// // P is the set of all pages; |P| = N
// // S is the set of sink nodes, i.e., pages that have no out links
// // M(p) is the set of pages that link to page p
// // L(q) is the number of out-links from page q
// // d is the PageRank damping/teleportation factor; use d = 0.85 as is typical
// 
// foreach page p in P
//   PR(p) = 1/N                          /* initial value */
// 
// while PageRank has not converged do
//   sinkPR = 0
//   foreach page p in S                  /* calculate total sink PR */
//     sinkPR += PR(p)
//   foreach page p in P
//     newPR(p) = (1-d)/N                 /* teleportation */
//     newPR(p) += d*sinkPR/N             /* spread remaining sink PR evenly */
//     foreach page q in M(p)             /* pages pointing to p */
//       newPR(p) += d*PR(q)/L(q)         /* add share of PageRank from in-links */
//   foreach page p
//     PR(p) = newPR(p)
// 
// return PR
var fs = require('fs')
  , Set = require('set')
  , log2conv = 1/Math.log(2)

function getSinks(outpages){
  return Object.keys(outpages).filter(function(e){ return outpages[e].empty() })
}

function preplexity(pr, pages){
  var p
    , j
    , preplex = 0
  for(j = 0; j<pages.length; j++){
    p = pr[pages[j]]
    preplex += p * Math.log(1/p)*log2conv
  }
  preplex = Math.pow(2, preplex)
  //console.log(preplex, pr[pages[0]])
  return preplex
}

function preplexfour(preplex){
  preplex = preplex.map(function(e){return e|0})
  return preplex.length >=4 && preplex.every(function(e){return e==preplex[0]})
}

function pageRank(inpages, outpages){
  var page
    , pages = Object.keys(inpages)
    , sinkPR
    , sinkpages = getSinks(outpages)
    , pageRank = {}
    , N = Object.keys(inpages).length
    , d = 0.85
    , i
    , j
    , idx = 0
    , newPR = {}
    , inlinks
    , inlinkPR
    , preplex = []
    , temp1, temp2

    Object.keys(outpages).forEach(function(el){
      outpages[el] = outpages[el].size()
    })

    for(page in inpages){
      pageRank[page] = 1/N
    }

    while(preplex.push(preplexity(pageRank, pages)), !preplexfour(preplex.slice(-4))){
      ////console.log(preplex)
      sinkPR = 0
      //newPR = {}
      for(i = 0; i<sinkpages.length; i++){
        sinkPR += pageRank[sinkpages[i]]
      }
      for(j = 0; j < pages.length; j++){
        page = pages[j]
        newPR[page] = (1-d)/N
        //console.log('1-d/N',newPR[page])
        newPR[page] += d*sinkPR/N
        //console.log('sinkPR',newPR[page])
        inlinks = inpages[page]
        inlinkPR = 0
        for(i = 0; i<inlinks.length; i++){
          temp1 = pageRank[inlinks[i]]||1/N
          temp2 = outpages[inlinks[i]]||0
          if(!temp1){
            continue;
          } else if(!temp2){
            continue;
          }
          inlinkPR += d*temp1/temp2
          //console.log(inlinkPR, temp1, temp2)
          //newPR[page] += inlinkPR
        }
        //console.log('inlinkPR', inlinkPR)
        //console.log('inlinks',newPR[page])
        newPR[page] += inlinkPR
        //console.log('in+inpr', newPR[page])
      }
      for(j = 0; j < pages.length; j++){
        page = pages[j]
        pageRank[page] = newPR[page]
      }
      idx++
    }

    return pageRank
}

function loadFile(path, cb){
  var f = fs.readFile(path, 'utf8', function(err, data){
    if(err){return}

    var inlink = {}
      , outlink = {}
      , splits
      , page
    data.split('\n').forEach(function(e){
      splits = e.split(' ')
      page = splits[0]
      if(page) {
        inlink[page] = splits.slice(1)
        inlink[page].forEach(function(e){
          if(outlink[e]){
            outlink[e].add(page)
          } else {
            outlink[e] = new Set([page])
          }
        })
        !outlink[page] && (outlink[page] = new Set())
      }
    })
    
    cb(inlink, outlink)
  })
}

function main(path){
  loadFile(path, function(i,o){
    //console.log(Object.keys(i).length)
    var pr = pageRank(i,o)
      , pages = Object.keys(pr)
      , i
      , a = []
    for(var i = 0; i< pages.length; i++){
     a.push({page: pages[i], rank: pr[pages[i]]}) 
    }
    a.sort(function(a,b){ return b.rank-a.rank})
    console.log(a[0])
    console.log(a[a.length-1])
  })
}

module.exports = {
  preplexity: preplexity
, getSinks: getSinks
, preplexfour: preplexfour
, pageRank: pageRank
, loadFile: loadFile
, main: main
}
main(process.argv[2] || "simplegraph")
