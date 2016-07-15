let supported_sites = [
    {
        name: "bbc",
        label: "BBC News",
        base_url: "bbc.com"
    },
    {
        name: "rt",
        label: "RT",
        base_url: "rt.com"
    },
    {
        name: "csmonitor",
        label: "Christian Science Monitor",
        base_url: "csmonitor.com"
    },
    {
        name: "cnn",
        label: "CNN.com",
        base_url: "cnn.com"
    },
    {
        name: "aljazeera",
        label: "Al Jazeera",
        base_url: "aljazeera.com"
    },
    {
        name: "fox",
        label: "FOXNews",
        base_url: "foxnews.com"
    },
    {
        name: "cbc",
        label: "CBC",
        base_url: "cbc.ca"
    }
];

let meta_lookup = function(doc) {
    let title_og = doc.querySelector("meta[property='og:title']");
    let description_og = doc.querySelector("meta[property='og:description']");
    let image_og = doc.querySelector("meta[property='og:image']");
    let type_og = doc.querySelector("meta[property='og:type']");

    return {
        title: (title_og !== null ? title_og : {}).content,
        description: doc.querySelector("meta[property='og:description']").content,
        image: (image_og !== null ? image_og : {}).content,
        type: (type_og !== null ? type_og : {}).content
    };
};

let get_uncommon_words = function(sentence, common) {
    var wordArr = sentence.match(/\w+/g),
        commonObj = {},
        uncommonArr = [],
        word, i;

    for (i = 0; i < common.length; i++) {
        commonObj[common[i].trim()] = true;
    }

    for (i = 0; i < wordArr.length; i++) {
        word = wordArr[i].trim().toLowerCase();
        if (!commonObj[word]) {
            uncommonArr.push(word);
        }
    }

    return uncommonArr;
};

let getSearchPhrase = function(phrase) {
    return get_uncommon_words(phrase, popularWords).join(" ");
}

let search_bing = function(phraseToSearch, site) {
    let key = "eKPOvT5GHYDOL6+yKTArCsz0nWu7mq7TwO5Lc+JTxig";
    let sitePhrase = phraseToSearch + " site: " + site;

    return new Promise(
        function(resolve, reject) {
            chrome.storage.local.get(sitePhrase, function(cached) {
                if (chrome.runtime.lastError || !cached.hasOwnProperty(sitePhrase)) {
                    $.ajax({
                        url: "https://api.datamarket.azure.com/Bing/search/Web?Query=" + encodeURI("'" + sitePhrase + "'"),
                        dataType: "json",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader("Authorization", "Basic " + btoa(key + ":" + key));
                        }
                    }).then(function(results) {
                        let toCache = {};
                        toCache[sitePhrase] = results;
                        chrome.storage.local.set(toCache, function() {
                            if (chrome.runtime.lastError) {
                                console.log(chrome.runtime.lastError);
                            } else {
                                console.log("Differo: cached for " + sitePhrase);
                            }
                        });
                        console.log('Differo: resolved from ajax', results);
                        resolve(results);
                    }).fail(function() {
                        reject();
                    });
                } else {
                    console.log('Differo: resolved from cache!', cached[sitePhrase]);
                    resolve(cached[sitePhrase]);
                }
            });
        }
    );
};

let page_meta = meta_lookup(document);

let Article = React.createClass({
    render: function() {
        return (
            // <div>
            //     <div className="title">
            //         <a href="{this.props.data.url}">{this.props.data.title}</a>
            //     </div>
            //     <div className="description">{this.props.data.description}</div>
            // </div>
            React.createElement(
                "div",
                null,
                React.createElement(
                    "div",
                    { className: "title" },
                    React.createElement(
                        "a",
                        { href: this.props.data.url },
                        this.props.data.title
                    )
                ),
                React.createElement(
                    "div",
                    { className: "description" },
                    this.props.data.description
                )
            )
        );
    }
})

let SourceItem = React.createClass({
    render: function() {
        let articleList = [];

        if (this.props.data.articles.length === 0) {
            articleList = React.createElement("p", { className: "description" }, "Nothing found.");
        } else {
            articleList = this.props.data.articles.map(function(a) {
                return (React.createElement(Article, { data: a }));
            });
        }

        return (
            // <div className="item-wrap">
            //     <h2>{this.props.data.label}</h2>
            //     <div className="content">
            //         {articleList}
            //     </div>
            // </div>
            React.createElement(
                "div",
                { className: "item-wrap" },
                React.createElement(
                    "h2",
                    null,
                    this.props.data.label
                ),
                React.createElement(
                    "div",
                    { className: "content" },
                    articleList
                )
            )
        );
    }
});

let DifferoSidebar = React.createClass({
    getInitialState: function() {
        let state = {
            newsVisibility: true
        };
        this.props.supportedSites.forEach(function(site) {
            state[site.name] = [];
        });
        return state;
    },

    componentDidMount: function() {
        let self = this;
        self.props.supportedSites.forEach(function(site) {
            search_bing(getSearchPhrase(self.props.title), site.base_url).then(function(results) {
                let updateToState = {};
                updateToState[site.name] = _.map(_.first(results.d.results, 3), function(res) {
                    return {
                        url: res.Url,
                        title: res.Title,
                        image: "http://placekitten.com/200/200",
                        description: res.Description
                    };
                });
                self.setState(updateToState);
            }, function() {
                console.log("fail get results", arguments);
            });
        });
    },

    toggleVisibility: function() {
        this.setState({newsVisibility: !this.state.newsVisibility});
    },

    render: function() {
        let self = this;
        let sourceList = this.props.supportedSites.map(function(site) {
            site.articles = self.state[site.name];
            return (React.createElement(SourceItem, { data: site }));
        });
        let phraseToSearch = getSearchPhrase(self.props.title);
        let toggleLabel = this.state.newsVisibility ? 'hide' : 'show';
        let newsVisibilityClass = this.state.newsVisibility ? 'news' : 'news-hidden';

        return (
            // <div className="differo">
            //     <h1>Alternative news sources: </h1>
            //     <button onClick={this.toggleVisibility}>{toggleLabel}</button>
            //     <span className="searchPhrase">Search phrase: {phraseToSearch}</span>
            //     <div className="{newsVisibilityClass}">
            //         {sourceList}
            //     </div>
            // </div>
            React.createElement(
                "div",
                { className: "differo" },
                React.createElement(
                    "h1",
                    null,
                    "Alternative news sources: "
                ),
                React.createElement(
                    "button",
                    { onClick: this.toggleVisibility },
                    toggleLabel
                ),
                React.createElement(
                    "span",
                    { className: "searchPhrase" },
                    "Search phrase: ",
                    phraseToSearch
                ),
                React.createElement(
                    "a",
                    { className: "feedback", href: "http://goo.gl/forms/mihggnFm3NpvvyON2", target: "_blank" },
                    "Provide feedback"
                ),
                React.createElement(
                    "div",
                    { className: newsVisibilityClass },
                    sourceList
                )
            )
        );
    }
});

let isArticle = function(page_meta, url) {
    if (page_meta.type === "article") {
        return true;
    }

    if (url.indexOf("aljazeera.com") !== -1) {
        return true;
    }

    return false;
}

let differoContainer = document.createElement("div");
differoContainer.id = "differo-container";
document.body.appendChild(differoContainer);

if (isArticle(page_meta, document.location.href)) {
    ReactDOM.render(
        React.createElement(DifferoSidebar, { title: page_meta.title, supportedSites: supported_sites }),
        differoContainer
    );
}