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
        name: "cnn",
        label: "CNN.com",
        base_url: "cnn.com"
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
    return {
        title: doc.querySelector("meta[property='og:title']").content,
        description: doc.querySelector("meta[property='og:description']").content,
        image: doc.querySelector("meta[property='og:image']").content,
        type: doc.querySelector("meta[property='og:type']").content
    };
};

let stop_words = ["bbc", "news", "rt", "cnn", "new", "look", "a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are", "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does", "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers", "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like", "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often", "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so", "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too", "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "yet", "you", "your", "ain't", "aren't", "can't", "could've", "couldn't", "didn't", "doesn't", "don't", "hasn't", "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've", "isn't", "it's", "might've", "mightn't", "must've", "mustn't", "shan't", "she'd", "she'll", "she's", "should've", "shouldn't", "that'll", "that's", "there's", "they'd", "they'll", "they're", "they've", "wasn't", "we'd", "we'll", "we're", "weren't", "what'd", "what's", "when'd", "when'll", "when's", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "why'd", "why'll", "why's", "won't", "would've", "wouldn't", "you'd", "you'll", "you're", "you've"];

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

let search_bing = function(phrase, site) {
    let key = "eKPOvT5GHYDOL6+yKTArCsz0nWu7mq7TwO5Lc+JTxig";
    let phrase_to_search = get_uncommon_words(phrase, stop_words);

    console.log("Phrase: " + phrase + " -->> " + phrase_to_search.join(" "));

    return $.ajax({
        url: "https://api.datamarket.azure.com/Bing/search/Web?Query=" + encodeURI("'" + phrase_to_search.join(" ") + " site:" + site + "'"),
        dataType: "json",
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(key + ":" + key));
        }
    });
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
        let state = {};
        this.props.supportedSites.forEach(function(site) {
            state[site.name] = [];
        });
        return state;
    },

    componentDidMount: function() {
        let self = this;
        self.props.supportedSites.forEach(function(site) {
            search_bing(self.props.title, site.base_url).done(function(results) {
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
            }).fail(function() {
                console.log("fail get results", arguments);
            })
        });
    },

    render: function() {
        let self = this;
        let sourceList = this.props.supportedSites.map(function(site) {
            site.articles = self.state[site.name];
            return (React.createElement(SourceItem, { data: site }));
        });

        return (
            // <div className="differo">
            //     <h1>Alternative news sources: </h1>
            //     <div className="news">
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
                    "div",
                    { className: "news" },
                    sourceList
                )
            )
        );
    }
});

let differoContainer = document.createElement("div");
differoContainer.id = "differo-container";
document.body.appendChild(differoContainer);

if (page_meta.type === "article") {
    ReactDOM.render(
        React.createElement(DifferoSidebar, { title: page_meta.title, supportedSites: supported_sites }),
        differoContainer
    );
}