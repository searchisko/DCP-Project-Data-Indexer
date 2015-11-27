# DCP Project Data Indexer

Simple ad-hoc tool used as a data pump to pull jboss.org community projects related data from [projectData](http://www.jboss.org/rest/projectData) REST end point and push into DCP [Content Push](http://docs.jbossorg.apiary.io/#contentpushapi) REST end point.

## Usage

1. Clone git repo: `git clone https://github.com/searchisko/DCP-Project-Data-Indexer.git`;
2. Open `index.html` in web browser;
3. Complete the web form (server URLs);
4. Hit `start` button and watch the progress;

#### Important

If the `index.html` is opened from local filesystem (i.e. the URL starts with `file://`) then some browsers may not be able to process XHR request correctly because `Origin` request header will have invalid value.

It seems there are less CORS issues when running from **Firefox** or **Safari** ATM. However, for some browsers there might be some startup flag that will make it work (like using flag `--allow-file-access-from-files` with Chrome), but for some browsers the only solution is to run it from a web server. For example you can open the page directly from GitHub at <http://rawgithub.com/searchisko/DCP-Project-Data-Indexer/master/index.html>.
