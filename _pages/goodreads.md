---
title: "What book should I read next?"
permalink: /wsirn/
layout: splash
header:
  overlay_filter: rgba(86, 177, 247, 0.5)
  overlay_image: /assets/images/wbsirn.jpg
  caption: "Photo by [*Jane Ryder*](https://unsplash.com/@planetjane)"
intro: 
  - excerpt: "Sometimes it's difficult to choose a book from our to read list. When I can't decide, I like to pick something different. If the last one was long I take a short one, if it was a classic then a modern one, if it was a best seller then an unpopular one, and so on.


  The following `d3 graph` can be very helpful in that situation..."
---

{% include feature_row id="intro" type="center" %}

<html>
<head>
    <meta charset="UTF-8">
    <script src="/dataViz/js/d3.min.js"></script>
    <script src="/dataViz/js/d3-legend.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/dataViz/css/goodreads.css">
</head>
<body>

<h3 align="center">Books in my <i>to be read</i> list</h3>
<div id="chart"></div>

<div id="buttonsWrap">
    <div id="botones" class="button-group minor-group">
        <p id="all_books" class="button">All</p>
        <p id="fiction_books" class="button">Fiction</p>
        <p id="nonfiction_books" class="button">Nonfiction</p>
    </div>
</div>

<div id="tooltip" class="hidden">
    <p><span class="tooltipFieldTitle">Title:</span> <span id="title"></span></p>
    <p><span class="tooltipFieldTitle">Author:</span> <span id="author"></span></p>
    <p><span class="tooltipFieldTitle">Publication year:</span> <span id="original_publication_year"></span></p>
    <p><span class="tooltipFieldTitle">Pages:</span> <span id="num_pages"></span></p>
    <p><span class="tooltipFieldTitle">Average rating:</span> <span id="average_rating"></span></p>
    <p><span class="tooltipFieldTitle">Ratings count:</span> <span id="ratings_count"></span></p>
</div>

<br/><br/><br/><br/>

<div class="descripcion" align="center">
    <span style="color: #382110; font-size: 10px;">Data source: my <i>to-read</i> shelf</span><br/>
    <a href="https://www.goodreads.com/review/list/54157688?shelf=to-read" title="Javier's book recommendations, liked quotes, book clubs, book trivia, book lists (to-read shelf)" target="_blank">
        <img border="0" alt="Javier's book recommendations, liked quotes, book clubs, book trivia, book lists (to-read shelf)" src="https://www.goodreads.com/images/badge/badge1.jpg">
    </a>
</div>

<script src="/dataViz/js/goodreads.js"></script>
</body>

<!--para chequear:
http://bl.ocks.org/emeeks/8855733967174fe4b1b4
http://d3-legend.susielu.com
http://bl.ocks.org/nbremer/a43dbd5690ccd5ac4c6cc392415140e7
http://d3-legend-v3.susielu.com
-->

</html>
