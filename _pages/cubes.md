---
title: "My Cube Collection"
permalink: /cubes/
layout: splash
header:
  overlay_filter: "0.2"
  overlay_image: /assets/images/fondoCubes.jpg
  caption: "Photo by [*Ricardo Gomez Angel*](https://unsplash.com/@ripato)"
---

<html>
  <head>
      <meta charset="UTF-8">
      <script src="/assets/js/sortable.min.js"></script><!-- https://github.hubspot.com/sortable/ -->
      <link rel="stylesheet" type="text/css" href="/assets/css/sortable-theme-minimal.css">
  </head>

  <style type="text/css">
    img {
      width: 100%;
      height: auto;
    }
  </style>
  <body>
  
  <br/>
  <table data-sortable>
      <thead>
          <tr>
              <th style="text-align: right;">#</th>
              <th data-sortable="false" style="text-align: center;"><span class="fas fa-camera"></span></th>
              <th>Brand</th>
              <th>Model</th>
              <th style="text-align: right;">Pieces</th>
              <th style="text-align: center;">Difficulty</th>
              <th style="text-align: center;">Released</th>
              <th>Store</th>
          </tr>
      </thead>
      <tbody>
        <!-- file must be in _includes/cubes -->
        {% include cubes/cubes.html %}
      </tbody>
  </table>

<br/>
<span style="color: #382110; font-size: 12px;">Table powered by <a href="https://github.hubspot.com/sortable/">sortable</a></span><br/>
<span style="color: #382110; font-size: 12px;">(Images have been taken from the online stores)</span><br/>
  </body>
</html>
