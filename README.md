## install mvp
- [Chrome Extension on Web Store](https://chrome.google.com/webstore/detail/differo/jcbkmgbdkefheeemjgpaaghjljodclgl)
- [Firefox 48+ Extension on Add-On Store](https://addons.mozilla.org/en-US/firefox/addon/differo/)
- Supported news sites: CNN, FoxNews, RT, Christian Science Monitor, Al Jazeera, CBC

![screenshot](http://i.imgur.com/BNahiik.png)

## basic use cases
- as a reader, I want to be actively aware of alternative points of view that exist for the content I'm currently reading
- as a reader, I want to be made aware that content which I'm reading has a certain bias and belongs to a certain "content bubble"
- as a reader, I want to easily access content which covers alternative points of view of what I'm currently reading

## different approaches
- what sort of bubbles do we want to expose?
 - political leanings
   - liberal, progressive, conservative, libertarian, ...
 - social classes
 - personal interests
 - geographical; urban vs rural
   - does this tie in with liberal vs conservative?
 - etc
- classify content which user is reading
- classify source of content
- content recommendation based on current "bubble" - find similar content from other bubbles

## let's avoid hard problems initially
- classification is hard
- identifying content bubbles is hard
- recommendations are hard

## mvp description
- for articles on [supported news websites], identify title/other means of searching for this content elsewhere
- using a [search engine of choice], search other [supported news websites] for similar articles, pick most relevant
- (optional) for each relevant article, determine meta-data - title, summary, leading photo, etc...
- display related articles in a sidebar, (optional) along with their previews (metadata)
- ensure that [supported news websites] is a set of ideologically different news channels. E.g. Fox, CBC, BBC, CNN, RT are included

## mvp goals
- validate use cases
- provide a quick overview of news coverage of a given topic
- summary, titles and leading photo all readily available in the sidebar might by themselves expose underlying biases and different view points
- user is informed that alternative points of view are available, and quick links are provided
- hard problems are avoided. We're reduced to:
 - integrating with a search API (DDG?)
   - Bing Search API
 - (optional) integrating with a page metadata service (embedly? fathom?)
   - jkerim's page-metadata-service
 - building a simple sidebar UI
 - and putting it all into a web extension

## mvp success criteria
- subjective feedback
- recommendations are "useful"
- users feel that they're more informed
- users feel that they're exposed to varying points of view
