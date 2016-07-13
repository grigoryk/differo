## basic use cases
- as a reader, I want to be actively aware of alternative points of view
- as a reader, I want to be made aware that content which I'm reading has a certain bias and belongs to a certain "content bubble"
- as a reader, I want to easily access content which covers alternative points of view of what I'm currently reading

## different approaches
- what sort of bubbles do we want to expose?
 - political leanings
  - liberal, progressive, conservative, libertarian, ...
 - social classes
 - etc
- classify content which user is reading
- classify source of content
- content recommendation based on current "bubble" - find alternative view points

## let's avoid hard problems initially
- classification is hard
- identifying content bubbles is hard
- recommendations are hard

## mvp
- for articles on [supported news websites], identify title/other means of searching for this content elsewhere
- using a [search engine of choice], search other [supported news websites] for similar articles, pick most relevant
- (optional) for each relevant article, determine meta-data - title, summary, leading photo, etc...
- display related articles in a sidebar, (optional) along with their previews (metadata)
- ensure that [supported news websites] is a set of ideologically different news channels. E.g. Fox, CBC, BBC, CNN, RT are included

## mvp goals
- provide a quick overview of news coverage of a given topic
- summary, titles and leading photo all readily available in the sidebar might by themselves expose underlying biases and different view points
- user is informed that alternative points of view are available, and quick links are provided
- hard problems are avoided. We're reduced to:
 - integrating with a search API (DDG?)
 - (optional) integrating with a page metadata service (embedly? fathom?)
 - building a simple sidebar UI
 - and putting it all into a web extension
