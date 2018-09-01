---
title: "My Cube Collection"
permalink: /cubes/
layout: splash
header:
  overlay_filter: "0.2"
  overlay_image: /assets/images/fondoCubes.jpg
  caption: "Photo by [*Ricardo Gomez Angel*](https://unsplash.com/@ripato)"
---
### Organizing my cubes
On October 21, 2017 I bought my first decent 3x3 and my first 2x2. Since then my interest has not stopped growing... like my collection!. With the following list I can know at a glance: what, when, where... and admire its beauty!

<html>
  <head>
      <meta charset="UTF-8">
      <script src="/assets/js/sortable.min.js"></script><!-- https://github.hubspot.com/sortable/ -->
      <link rel="stylesheet" type="text/css" href="/assets/css/sortable-theme-minimal.css">
  </head>

  <style type="text/css">
    img {
      width: 80px;
      height: 80px;
    }

    th {
      border-right: 0;
    }

    td {
      border-right: 0;
    }

  </style>
  <body>
  
  <br/>
  <table data-sortable style="border-left: 0;border-right: 0;">
      <thead>
          <tr>
              <th style="text-align: right;">#</th>
              <th data-sortable="false" style="text-align: right;"><span class="fa fa-camera"></span></th>
              <th>Brand</th>
              <th>Model</th>
              <th style="text-align: right;">Pieces</th>
              <th style="text-align: center;">Date</th>
              <th>Shop</th>
          </tr>
      </thead>
      <tbody>
        <!-- file must be in _includes/cubes -->
        {% include cubes/cubes.html %}
      </tbody>
  </table>

<br/>
<span style="color: #382110; font-size: 12px;">(Images have been taken from the online stores)</span><br/>
  </body>
</html>
