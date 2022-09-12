# Overview
* Run `nix-shell default.nix --command "uvicorn py.compmatrix.api:app"`.
* The client will be served at http://127.0.0.1:8000/web/home.htm
# Implementation notes
* The API is implemented with FastAPI and SQLAlchemy.
* I have chosen to serve a static website with nothing but vanilla JS to power it.
* The graphs are drawn with the SVG Web API.
* The graph plot is still a bit rough and the website is ugly and not responsive, but it works.
* The plot uses the Cividis color map for shading the cells. See credits at the end of this file.
* There are two nix files: 
    * default.nix only has what is needed for serving the app. I have tested it.
    * dev.nix has the dependencies I used while exploring the problem. HOWEVER I have not managed to run it on my machine due to this [issue](https://github.com/jupyterlab/jupyterlab/issues/9863#issuecomment-911868770) so I used my local environment for that.
* There are two jupyter notebooks documenting my thought process (but they're messy).
# Known issues, to-dos, talking points
* The API endpoints aren't properly documented and the code has zero test coverage.
* The labels for the graph are sometimes too big and overlap. (Fix: either dynamic font sizing, or rotating, or line breaks.)
* Clicking on a cell with zero apps will not produce examples and throw a console error. (Fix: explicitly catch this error.)
* The example API is hardcoded to provide 5 apps (fix: add parameter)
* The SQLAlchemy queries could do with some tidying up and optimizing. There are some repeated chunks of code.
* The front end code is just one  big file, which is a bit too long. It could be better organized.
* Discuss the bottlenecks as you scale up to a larger dataset (1e5 `sdk`s, 1e7 `app`'s, and 1e9 `app_sdk`'s).  
* Consider how the app might support updating the view as the data in the database updates, without requiring a page refresh.

# Credits & disclaimers
* I based the SVG rendering on a previous project of mine.
* I used the Civides colormap described in this article:
[Nuñez JR, Anderton CR, Renslow RS. Optimizing colormaps with consideration for color vision deficiency to enable accurate interpretation of scientific data. PLoS One. 2018 Aug 1;13(7):e0199239. doi: 10.1371/journal.pone.0199239. PMID: 30067751; PMCID: PMC6070163.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6070163/)
* Whenever I got too much inspiration from the internet there is a comment with a link.
* I did take a look at Omar Faruk Riyad's [solution](https://github.com/omfriyad/mixrank-interview/). I haven't copied or tested it though.
