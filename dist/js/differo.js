let supported_sites = [
    {
        name: "bbc",
        label: "BBC News",
        base_url: "bbc.com",
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

let current_alternatives = {
    bbc: [],
    rt: [],
    cnn: []
};

let meta_lookup = function (doc) {
    return {
        title: doc.querySelector("meta[property='og:title']").content,
        description: doc.querySelector("meta[property='og:description']").content,
        image: doc.querySelector("meta[property='og:image']").content,
        type: doc.querySelector("meta[property='og:type']").content
    };
};

let get_dom_id_from_site_name = function (site_name) {
    return "differo-" + site_name;
}

let sidebar_dom = function (sites, current_url) {
    let wrapper_dom = document.createElement("div");
    wrapper_dom.classList.add("differo");

    let article_h1 = document.createElement("h1");
    article_h1.innerHTML = "Alternative news sources:";
    wrapper_dom.appendChild(article_h1);

    let news_div = document.createElement("div");
    news_div.classList.add("news");

    _.each(sites, function (site) {
        if (current_url.indexOf(site.base_url) !== -1) {
            return;
        }

        let ss_div = document.createElement("div");

        let ss_content = document.createElement("div");
        ss_content.classList.add("item-wrap");
        ss_content.id = get_dom_id_from_site_name(site.name);

        let ss_title = document.createElement("h2");
        ss_title.innerHTML = site.label;

        let ss_loading_p = document.createElement("p");
        ss_loading_p.innerHTML = "Loading...";
        ss_content.appendChild(ss_loading_p);

        ss_div.appendChild(ss_title);
        ss_div.appendChild(ss_content);

        news_div.appendChild(ss_div);
    });
    wrapper_dom.appendChild(news_div);

    return wrapper_dom;
};

let stop_words = ["bbc","news","rt","cnn","new","look","a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your","ain't","aren't","can't","could've","couldn't","didn't","doesn't","don't","hasn't","he'd","he'll","he's","how'd","how'll","how's","i'd","i'll","i'm","i've","isn't","it's","might've","mightn't","must've","mustn't","shan't","she'd","she'll","she's","should've","shouldn't","that'll","that's","there's","they'd","they'll","they're","they've","wasn't","we'd","we'll","we're","weren't","what'd","what's","when'd","when'll","when's","where'd","where'll","where's","who'd","who'll","who's","why'd","why'll","why's","won't","would've","wouldn't","you'd","you'll","you're","you've"];

let get_uncommon_words = function (sentence, common) {
    var wordArr = sentence.match(/\w+/g),
        commonObj = {},
        uncommonArr = [],
        word, i;

    for ( i = 0; i < common.length; i++ ) {
        commonObj[ common[i].trim() ] = true;
    }

    for ( i = 0; i < wordArr.length; i++ ) {
        word = wordArr[i].trim().toLowerCase();
        if ( !commonObj[word] ) {
            uncommonArr.push(word);
        }
    }

    return uncommonArr;
};

let search_bing = function (phrase, site) {
    let key = "eKPOvT5GHYDOL6+yKTArCsz0nWu7mq7TwO5Lc+JTxig";
    let phrase_to_search = get_uncommon_words(phrase, stop_words);

    console.log("Phrase: " + phrase + " -->> " + phrase_to_search.join(" "));

    return $.ajax({
        url: "https://api.datamarket.azure.com/Bing/search/Web?Query=" + encodeURI("'" + phrase_to_search.join(" ") + " site:" + site + "'"),
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(key + ":" + key));
        }
    });
};

let news_item_dom = function (item) {
    let item_div = document.createElement("div");
    let title_div = document.createElement("div");
    title_div.classList.add("title");

    let title_a = document.createElement("a");
    title_a.href = item.url;
    title_a.innerHTML = item.title;
    title_div.appendChild(title_a);

    let description_div = document.createElement("div");
    description_div.classList.add("description");
    description_div.innerHTML = item.description;

    let image_div = document.createElement("div");
    image_div.classList.add("image");

    let image_img = document.createElement("img");
    image_img.src = item.image;
    image_div.appendChild(image_img);

    item_div.appendChild(title_div);
    item_div.appendChild(description_div);
    // item_div.appendChild(image_div);

    return item_div;
};

let render_news_items = function (dom_id, items) {
    let content_div = document.getElementById(dom_id);
    content_div.innerHTML = "";

    _.each(items, function (item) {
        let dom = news_item_dom(item);
        content_div.appendChild(dom);
    });

    if (items.length === 0) {
        let nothing_div = document.createElement("div");
        nothing_div.classList.add("description");
        nothing_div.innerHTML = "Nothing found.";
        content_div.appendChild(nothing_div);
    }
};

let search_news_sites = function(phrase, sites, current_url) {
    for (i in sites) {
        if (current_url.indexOf(sites[i].base_url) !== -1) {
            continue;
        }

        let site_name = sites[i].name;
        search_bing(phrase, sites[i].base_url).done(function(results) {
            render_news_items(get_dom_id_from_site_name(site_name), _.map(_.first(results.d.results, 3), function (res) {
                return {
                    url: res.Url,
                    title: res.Title,
                    image: "http://placekitten.com/200/200",
                    description: res.Description
                };
            }));
        }).fail(function () {
            console.log("fail get results", arguments);
        })
    }
};

let page_meta = meta_lookup(document);

if (page_meta.type === "article") {
    document.body.appendChild(sidebar_dom(supported_sites, document.location.href));
    search_news_sites(page_meta.title, supported_sites, document.location.href);
}