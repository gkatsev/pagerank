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

function getSinks(outpages){
  return Object.keys(outpages).filter(function(e){ return outpages[e].empty() })
}

function pageRank(inpages, outpages){
  var page
    , sinkPR
    , sinkpages = getSinks(outpages)
    , pageRank = {}
    , N = Object.keys(inpages).length
    , d = 0.85
    , i
    , idx = 0
    , newPR = {}
    , inlinks

    for(page in inpages){
      pageRank[page] = 1/N
    }

    while(idx++ < 100){
      sinkPR = 0
      for(i = 0; i<sinkpages.length; i++){
        sinkPR += pageRank[sinkpages[i]]
      }
      for(page in inpages){
        newPR[page] = (1-d)/N
        newPR[page] += d*sinkPR/N
        inlinks = inpages[page]
        for(i = 0; i<inlinks.length; i++){
          newPR[page] += d*pageRank[inlinks[i]]/outpages[inlinks[i]].size()
        }
      }
      for(page in inpages){
        pageRank[page] = newPR[page]
      }
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
    
    //for(var p in outlink){
      //outlink[p] = outlink[p].get()
    //}
    //console.log("inlink",inlink)
    //console.log("outlink",outlink)
    cb(inlink, outlink)
  })
}

function main(path){
  loadFile(path, function(i,o){
    var pr = pageRank(i,o)
    console.log(pr)
  })
}

main(process.argv[2] || "simplegraph")
