# DCP Project Data Indexer

Simple ad-hoc tool used as a data pump to pull jboss.org community projects related data from [projectData](https://raw.githubusercontent.com/jbossorg/project-info/master/project-info.json) GitHub-served file and push into DCP [Content Push](http://docs.jbossorg.apiary.io/#contentpushapi) REST end point.

## Usage

1. Clone git repo: `git clone https://github.com/searchisko/DCP-Project-Data-Indexer.git`
2. Open `index.html` in web browser, notice the CORS info there
3. Complete the web form (server URLs).
4. Hit `start` button and watch the progress

Please note that you may get 400 error responses from DCP if you didn't define the project first there. You can do that by adding it to the repository [here](https://github.com/searchisko/configuration/tree/master/data/project) and then pushing it to DCP via the init_project.sh script provided in the same directory.

#### Important

If the `index.html` is opened from local filesystem (i.e. the URL starts with `file://`) then some browsers may not be able to process XHR request correctly because `Origin` request header will have invalid value. If you use Chrome then [this guide](https://alfilatov.com/posts/run-chrome-without-cors/) may help you. Otherwise search for a specific parameters that will disable CORS checking in your browser or try opening this file directly from GitHub, then the headers should work correctly <http://rawgithub.com/searchisko/DCP-Project-Data-Indexer/master/index.html>. However nowadays GitHub enforces page source to be shown instead of the interpreted HTML page.
