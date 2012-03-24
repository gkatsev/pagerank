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

function preplexity(pr){
  var p
    , j
    , preplex = 0
  for(j = 0; j<pages.length; j++){
    p = pages[j]
    preplex += pr[p] * Math.log(1/pr[p])*log2conv
  }
  return Math.pow(2, preplex)
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
    , preplex = []

    Object.keys(outpages).forEach(function(el){
      outpages[el] = outpages[el].size()
    })

    for(page in inpages){
      pageRank[page] = 1/N
    }

    while(preplex.push(preplexity(pageRank)), !preplexfour(preplex.slice(-4))){
      console.log(preplex)
      sinkPR = 0
      newPR = {}
      console.log('sinkpages', idx)
      for(i = 0; i<sinkpages.length; i++){
        sinkPR += pageRank[sinkpages[i]]
      }
      console.log('pages', idx)
      for(j = 0; j < pages.length; j++){
        page = pages[j]
        newPR[page] = (1-d)/N
        newPR[page] += d*sinkPR/N
        inlinks = inpages[page]
        for(i = 0; i<inlinks.length; i++){
          newPR[page] += d*pageRank[inlinks[i]]/outpages[inlinks[i]]
        }
      }
      console.log('copypr', idx)
      //pageRank = newPR
      for(j = 0; j < pages.length; j++){
        page = inpages[j]
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
    console.log(Object.keys(i).length)
    var pr = pageRank(i,o)
    console.log(pr)
  })
}

main(process.argv[2] || "simplegraph")
