let metaLookup = function(doc) {
    const title_og = doc.querySelector("meta[property='og:title']");
    const description_og = doc.querySelector("meta[property='og:description']");
    const image_og = doc.querySelector("meta[property='og:image']");
    const type_og = doc.querySelector("meta[property='og:type']");

    let not_null = function(t) {
        return t !== null ? t : {};
    };

    let c = function(t) {
        return t.content;
    };

    return {
        title: c(not_null(title_og)),
        description: c(not_null(description_og)),
        image: c(not_null(image_og)),
        type: c(not_null(type_og))
    };
};

let getUncommonWords = function(sentence, common) {
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
    return getUncommonWords(phrase, popularWords).join(" ");
}

let searchBing = function(phraseToSearch, site) {
    const key = "eKPOvT5GHYDOL6+yKTArCsz0nWu7mq7TwO5Lc+JTxig";
    const sitePhrase = phraseToSearch + " site: " + site;
    const baseApiUrl = "https://api.datamarket.azure.com/Bing/search/Web?Query=";

    return new Promise((resolve, reject) => {
        storage
        .get(sitePhrase)
        .then((cached) => {
            console.log('Differo: resolved from cache!', cached[sitePhrase]);
            resolve(cached[sitePhrase]);
        }).catch(() => {
            $.ajax({
                url: baseApiUrl + encodeURI("'" + sitePhrase + "'"),
                dataType: "json",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa(key + ":" + key));
                }
            }).then(function(results) {
                let toCache = {};
                toCache[sitePhrase] = results;
                storage.set(toCache).then(() => {
                    console.log("Differo: cached for " + sitePhrase);
                }).catch(() => {
                    console.log("Differo: cache not supported");
                });
                console.log('Differo: resolved from ajax', results);
                resolve(results);
            }).fail(function() {
                reject();
            });
        });
    });
};

let isArticle = function(pageMeta, url) {
    if (pageMeta.type === "article") {
        return true;
    }

    if (url.indexOf("aljazeera.com") !== -1) {
        return true;
    }

    return false;
}

let Article = React.createClass({
    render: function() {
        return (
            // <div>
            //     <div className="title">
            //         <span>&bull;</span><a href="{this.props.data.url}" title="{this.props.data.description}">{this.props.data.title}</a>
            //     </div>
            // </div>
            React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "title" },
                React.createElement(
                    "span",
                    null,
                    "•"
                ),
                React.createElement(
                    "a",
                    { href: this.props.data.url, title: this.props.data.description },
                    this.props.data.title
                )
            )
        )
        );
    }
});

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

        if (!this.props.isArticle) {
            return;
        }

        self.props.supportedSites.forEach(function(site) {
            searchBing(getSearchPhrase(self.props.title), site.base_url).then(function(results) {
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
        this.setState({ newsVisibility: !this.state.newsVisibility });
    },

    render: function() {
        let self = this;
        let sourceList = [];
        let phraseToSearch = "";

        if (this.props.isArticle) {
            sourceList = _.shuffle(this.props.supportedSites).map(function(site) {
                site.articles = self.state[site.name];
                return (React.createElement(SourceItem, { data: site }));
            });
            phraseToSearch = getSearchPhrase(this.props.title);
        }

        let toggleLabel = this.state.newsVisibility ? 'hide' : 'show';
        let newsVisibilityClass = this.state.newsVisibility && this.props.isArticle ? 'news' : 'news-hidden';

        return (
            // <div className="differo">
            //     <h1>Related news: </h1>
            //     <div className="{!this.props.isArticle ? 'hide' : ''}">
            //         <button onClick={this.toggleVisibility}>{toggleLabel}</button>
            //         <span className="searchPhrase">Topic: {phraseToSearch}</span>
            //         <div className="{newsVisibilityClass}">
            //             {sourceList}
            //         </div>
            //     </div>
            //     <div className="not-an-article {this.props.isArticle ? 'hide' : ''}">
            //         <p>This is not an article page.</p>
            //     </div>
            // </div>
            React.createElement(
                "div",
                { className: "differo" },
                React.createElement(
                    "h1",
                    null,
                    "Related news: "
                ),
                React.createElement(
                    "div",
                    { className: !this.props.isArticle ? 'hide' : '' },
                    React.createElement(
                        "button",
                        { onClick: this.toggleVisibility },
                        toggleLabel
                    ),
                    React.createElement(
                        "span",
                        { className: "searchPhrase" },
                        "Topic: ",
                        phraseToSearch
                    ),
                    React.createElement(
                        "div",
                        { className: newsVisibilityClass },
                        sourceList
                    )
                ),
                React.createElement(
                    "div",
                    { className: "not-an-article " + (this.props.isArticle ? 'hide' : '') },
                    React.createElement(
                        "p",
                        null,
                        "This is not an article page."
                    )
                )
            )
        );
    }
});

let divWithId = (id) => {
    let differoContainer = document.createElement("div");
    differoContainer.id = id;

    return differoContainer;
}

let go = (doc, container, metadata) => {
    doc.body.appendChild(container);
    ReactDOM.render(
        React.createElement(
            DifferoSidebar,
            {
                title: metadata.title,
                supportedSites: supportedSites,
                isArticle: isArticle(metadata, doc.location.href)
            }
        ),
        container
    );
}

go(document, divWithId("differo-container"), metaLookup(document));
