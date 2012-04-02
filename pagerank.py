#// P is the set of all pages; |P| = N
#// S is the set of sink nodes, i.e., pages that have no out links
#// M(p) is the set of pages that link to page p
#// L(q) is the number of out-links from page q
#// d is the PageRank damping/teleportation factor; use d = 0.85 as is typical

#foreach page p in P
#  PR(p) = 1/N                          /* initial value */

#while PageRank has not converged do
#  sinkPR = 0
#  foreach page p in S                  /* calculate total sink PR */
#    sinkPR += PR(p)
#  foreach page p in P
#    newPR(p) = (1-d)/N                 /* teleportation */
#    newPR(p) += d*sinkPR/N             /* spread remaining sink PR evenly */
#    foreach page q in M(p)             /* pages pointing to p */
#      newPR(p) += d*PR(q)/L(q)         /* add share of PageRank from in-links */
#  foreach page p
#    PR(p) = newPR(p)

#return PR

from math import log, pow, floor

def getSinks(outpages):
    return filter(lambda x: outpages[x] == 0, outpages)

def preplexity(pr):
    preplex = 0
    for page in pr:
        preplex += pr[page] * log(1.0/pr[page], 2)
    return pow(2, preplex)

def preplexfour(preplex):
    prep = map(lambda x: floor(x), preplex)
    prep0 = prep[0]
    prep = map(lambda x: x == prep0, prep)
    return len(prep) >= 4 and all(prep)

def loadFile(path):
    inpages = {}
    outpages = {}
    with open(path) as f:
        for line in f:
            splits = line.split(' ')
            splits = filter(lambda x: x != '\n', splits)
            splits = map(lambda x: x.replace('\n',''), splits)
            page = splits[0]
            if page in inpages:
                inpages[page] = inpages[page] + splits[1:]
            else:
                inpages[page] = splits[1:]
            if not page in outpages:
                outpages[page] = 0
            for inpage in splits[1:]:
                if inpage in outpages:
                    outpages[inpage] += 1
                else:
                    outpages[inpage] = 1
    return (inpages, outpages)

def pageRank(inpages, outpages):
    pageRank = {}
    sinkpages = getSinks(outpages)
    N = len(inpages)
    d = 0.85
    idx = 0
    preplex = []

    for page in inpages:
        pageRank[page] = 1.0/N
    
    prep = preplexity(pageRank)
    preplex = preplex + [prep]

    while not preplexfour(preplex[-4:]):
        newPR = {}
        sinkPR = 0
        for sink in sinkpages:
            sinkPR += pageRank[sink]
        for page in inpages:
            newPR[page] = (1.0-d)/N
            newPR[page] += d*sinkPR/N
            for inlink in inpages[page]:
                newPR[page] += d* pageRank[inlink]/outpages[inlink]
        for page in newPR:
            pageRank[page] = newPR[page]
        idx += 1
        prep = preplexity(pageRank)
        preplex = preplex + [prep]
                    
    for prep in preplex:
        print prep
    return pageRank

def main():
    i,o = loadFile('wt2g_inlinks')
    pr = pageRank(i,o)
    pra = []
    for page in pr:
        pra = pra + [(page, pr[page])]
    spra = sorted(pra, key=lambda x: x[1])
    for p,r in spra[-10:]:
        print p, r

if __name__ == '__main__':
    main()
