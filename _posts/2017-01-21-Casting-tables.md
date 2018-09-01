---
title: "Casting tables with `dcast` and `rowid`"
excerpt: "An example of how `data.table` can cast tables not knowing a priori the number of columns to add."
tags: [R, data.table, data wrangling]
classes: wide
---



In many cases we need to reshape the tables we are working with, that is, change their format from wide to long (*melt*) and vice versa (*cast*). It's usually a trivial operation but sometimes it requires a little more thinking. Let's see a simplified example of a real problem.

## Data generation

A totally random table with 50 rows is generated with the following columns:

- **id**: Random numbers between 1 and 30 (with replacement).
- **phone**: Random numbers between 600000000 and 699999999 (without replacement).
- **scoring**: Random decimal numbers between 1 and 10 (without replacement).
- **pwd**: Random strings with length 8.

The idea behind this data generation is to get an unknown number of rows with the same **id** with an unknown number of repetitions.



```r
# Load packages
library(data.table)
library(knitr)

# Fixing the seed for reproducible results
set.seed(13)

# Random table generation
myDT <- data.table(
  id = sample(1:30, 50, replace = T),
  phone = sample(600000000:699999999, 50),
  scoring = runif(50, 1, 10),
  pwd = sapply(
    1:50,
    FUN = function(x) paste0(sample(letters, 8, replace = T), collapse = '')
    )
  )

# Order by id
setorder(myDT, id)

# Show data
kable(myDT, caption = 'Random Table', format = 'html')
```

<table>
<caption>Random Table</caption>
 <thead>
  <tr>
   <th style="text-align:right;"> id </th>
   <th style="text-align:right;"> phone </th>
   <th style="text-align:right;"> scoring </th>
   <th style="text-align:left;"> pwd </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:right;"> 1 </td>
   <td style="text-align:right;"> 645403893 </td>
   <td style="text-align:right;"> 1.020973 </td>
   <td style="text-align:left;"> klcapxnp </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 1 </td>
   <td style="text-align:right;"> 619413048 </td>
   <td style="text-align:right;"> 2.683202 </td>
   <td style="text-align:left;"> iohatbab </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 2 </td>
   <td style="text-align:right;"> 609713628 </td>
   <td style="text-align:right;"> 7.300181 </td>
   <td style="text-align:left;"> yudqfjmg </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 2 </td>
   <td style="text-align:right;"> 641256896 </td>
   <td style="text-align:right;"> 6.117944 </td>
   <td style="text-align:left;"> tuimsqil </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 3 </td>
   <td style="text-align:right;"> 699784180 </td>
   <td style="text-align:right;"> 6.601338 </td>
   <td style="text-align:left;"> daymvjqa </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 3 </td>
   <td style="text-align:right;"> 640456925 </td>
   <td style="text-align:right;"> 4.971228 </td>
   <td style="text-align:left;"> jcvgzbuj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 3 </td>
   <td style="text-align:right;"> 699936658 </td>
   <td style="text-align:right;"> 2.814284 </td>
   <td style="text-align:left;"> bkkutjau </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 4 </td>
   <td style="text-align:right;"> 659143790 </td>
   <td style="text-align:right;"> 9.478907 </td>
   <td style="text-align:left;"> xvdzpylw </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 5 </td>
   <td style="text-align:right;"> 627234317 </td>
   <td style="text-align:right;"> 1.931959 </td>
   <td style="text-align:left;"> fmpcamnx </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 5 </td>
   <td style="text-align:right;"> 660916649 </td>
   <td style="text-align:right;"> 1.253950 </td>
   <td style="text-align:left;"> dctpbtam </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 7 </td>
   <td style="text-align:right;"> 693736060 </td>
   <td style="text-align:right;"> 2.075693 </td>
   <td style="text-align:left;"> hnpuolaj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 8 </td>
   <td style="text-align:right;"> 639782493 </td>
   <td style="text-align:right;"> 6.433026 </td>
   <td style="text-align:left;"> rwmwqvdu </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 10 </td>
   <td style="text-align:right;"> 619850570 </td>
   <td style="text-align:right;"> 8.600371 </td>
   <td style="text-align:left;"> jzdkusva </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 10 </td>
   <td style="text-align:right;"> 680929713 </td>
   <td style="text-align:right;"> 6.954972 </td>
   <td style="text-align:left;"> zeqxntgc </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 11 </td>
   <td style="text-align:right;"> 645335202 </td>
   <td style="text-align:right;"> 2.682323 </td>
   <td style="text-align:left;"> lojmtrvs </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 11 </td>
   <td style="text-align:right;"> 629926642 </td>
   <td style="text-align:right;"> 9.379491 </td>
   <td style="text-align:left;"> cxqadrdj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 12 </td>
   <td style="text-align:right;"> 607223895 </td>
   <td style="text-align:right;"> 7.975297 </td>
   <td style="text-align:left;"> avxympqg </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 13 </td>
   <td style="text-align:right;"> 653996293 </td>
   <td style="text-align:right;"> 2.607843 </td>
   <td style="text-align:left;"> nnuqxigs </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 13 </td>
   <td style="text-align:right;"> 645038697 </td>
   <td style="text-align:right;"> 8.760344 </td>
   <td style="text-align:left;"> mcwduuiw </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 14 </td>
   <td style="text-align:right;"> 646393146 </td>
   <td style="text-align:right;"> 1.607134 </td>
   <td style="text-align:left;"> lkowclpa </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 14 </td>
   <td style="text-align:right;"> 694678826 </td>
   <td style="text-align:right;"> 8.862866 </td>
   <td style="text-align:left;"> bxhelfjs </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 16 </td>
   <td style="text-align:right;"> 616062260 </td>
   <td style="text-align:right;"> 6.175765 </td>
   <td style="text-align:left;"> ncukcyzz </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 17 </td>
   <td style="text-align:right;"> 662680472 </td>
   <td style="text-align:right;"> 5.231123 </td>
   <td style="text-align:left;"> mkdaflur </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 17 </td>
   <td style="text-align:right;"> 629480466 </td>
   <td style="text-align:right;"> 2.209104 </td>
   <td style="text-align:left;"> zdnpwuia </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 17 </td>
   <td style="text-align:right;"> 671447129 </td>
   <td style="text-align:right;"> 8.875030 </td>
   <td style="text-align:left;"> oyftrcbp </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 18 </td>
   <td style="text-align:right;"> 614526543 </td>
   <td style="text-align:right;"> 3.632207 </td>
   <td style="text-align:left;"> uijzspbs </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 18 </td>
   <td style="text-align:right;"> 635067768 </td>
   <td style="text-align:right;"> 8.161684 </td>
   <td style="text-align:left;"> owrevrzb </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 18 </td>
   <td style="text-align:right;"> 608546595 </td>
   <td style="text-align:right;"> 5.084333 </td>
   <td style="text-align:left;"> afrcytbl </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 19 </td>
   <td style="text-align:right;"> 693548878 </td>
   <td style="text-align:right;"> 1.149800 </td>
   <td style="text-align:left;"> zoqoetuz </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 19 </td>
   <td style="text-align:right;"> 623388830 </td>
   <td style="text-align:right;"> 2.247059 </td>
   <td style="text-align:left;"> kthwcoef </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 19 </td>
   <td style="text-align:right;"> 692795692 </td>
   <td style="text-align:right;"> 7.412554 </td>
   <td style="text-align:left;"> juaelcsd </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 20 </td>
   <td style="text-align:right;"> 649672445 </td>
   <td style="text-align:right;"> 4.446254 </td>
   <td style="text-align:left;"> liutuwqf </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 20 </td>
   <td style="text-align:right;"> 664961449 </td>
   <td style="text-align:right;"> 9.614372 </td>
   <td style="text-align:left;"> rnrndysi </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 20 </td>
   <td style="text-align:right;"> 602632286 </td>
   <td style="text-align:right;"> 3.724153 </td>
   <td style="text-align:left;"> rqidgdol </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 21 </td>
   <td style="text-align:right;"> 642990005 </td>
   <td style="text-align:right;"> 9.319300 </td>
   <td style="text-align:left;"> ytcojema </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 21 </td>
   <td style="text-align:right;"> 636961722 </td>
   <td style="text-align:right;"> 6.555269 </td>
   <td style="text-align:left;"> tnsletpt </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 21 </td>
   <td style="text-align:right;"> 684581198 </td>
   <td style="text-align:right;"> 7.147596 </td>
   <td style="text-align:left;"> cqnoitbj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 22 </td>
   <td style="text-align:right;"> 655936305 </td>
   <td style="text-align:right;"> 6.468607 </td>
   <td style="text-align:left;"> diypikrs </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 22 </td>
   <td style="text-align:right;"> 692048681 </td>
   <td style="text-align:right;"> 5.884008 </td>
   <td style="text-align:left;"> towijsgw </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 23 </td>
   <td style="text-align:right;"> 634100247 </td>
   <td style="text-align:right;"> 2.145143 </td>
   <td style="text-align:left;"> ovkziixa </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 23 </td>
   <td style="text-align:right;"> 631965985 </td>
   <td style="text-align:right;"> 4.648430 </td>
   <td style="text-align:left;"> owyiszmh </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 25 </td>
   <td style="text-align:right;"> 642384037 </td>
   <td style="text-align:right;"> 2.570212 </td>
   <td style="text-align:left;"> yocaenac </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 26 </td>
   <td style="text-align:right;"> 639233975 </td>
   <td style="text-align:right;"> 7.821415 </td>
   <td style="text-align:left;"> jabxdxab </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 27 </td>
   <td style="text-align:right;"> 623326281 </td>
   <td style="text-align:right;"> 6.333832 </td>
   <td style="text-align:left;"> rcmnymfb </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 27 </td>
   <td style="text-align:right;"> 657307628 </td>
   <td style="text-align:right;"> 1.835592 </td>
   <td style="text-align:left;"> ljxframj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 27 </td>
   <td style="text-align:right;"> 680172458 </td>
   <td style="text-align:right;"> 2.802887 </td>
   <td style="text-align:left;"> mxcokckt </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 28 </td>
   <td style="text-align:right;"> 694408637 </td>
   <td style="text-align:right;"> 3.547176 </td>
   <td style="text-align:left;"> wsxxhocd </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 28 </td>
   <td style="text-align:right;"> 632219643 </td>
   <td style="text-align:right;"> 8.953089 </td>
   <td style="text-align:left;"> xhnvzwae </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 29 </td>
   <td style="text-align:right;"> 602132896 </td>
   <td style="text-align:right;"> 4.271840 </td>
   <td style="text-align:left;"> hycucpcz </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 30 </td>
   <td style="text-align:right;"> 615307379 </td>
   <td style="text-align:right;"> 5.279515 </td>
   <td style="text-align:left;"> dvhbrnim </td>
  </tr>
</tbody>
</table>


## Change to wide format:

The goal is to have just one row per **id** without losing information. 

The difficulty here is that the number of columns to add is not constant, varying according to the number of occurrences of each identifier. Of course, it is a problem that can be solved in many ways, especially with such a small table like this. The idea is to show how thanks to the power of R it can be solved in a general way in just one command call:


```r
# Generate wide format table grouping by unique id
df <- dcast(
  myDT,
  formula = id ~ rowid(id),
  value.var = c('phone', 'scoring', 'pwd')
  )

# Show new table
kable(df, caption = 'Wide Format Table', format = 'html')
```

<table>
<caption>Wide Format Table</caption>
 <thead>
  <tr>
   <th style="text-align:right;"> id </th>
   <th style="text-align:right;"> phone_1 </th>
   <th style="text-align:right;"> phone_2 </th>
   <th style="text-align:right;"> phone_3 </th>
   <th style="text-align:right;"> scoring_1 </th>
   <th style="text-align:right;"> scoring_2 </th>
   <th style="text-align:right;"> scoring_3 </th>
   <th style="text-align:left;"> pwd_1 </th>
   <th style="text-align:left;"> pwd_2 </th>
   <th style="text-align:left;"> pwd_3 </th>
  </tr>
 </thead>
<tbody>
  <tr>
   <td style="text-align:right;"> 1 </td>
   <td style="text-align:right;"> 645403893 </td>
   <td style="text-align:right;"> 619413048 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 1.020973 </td>
   <td style="text-align:right;"> 2.683202 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> klcapxnp </td>
   <td style="text-align:left;"> iohatbab </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 2 </td>
   <td style="text-align:right;"> 609713628 </td>
   <td style="text-align:right;"> 641256896 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 7.300181 </td>
   <td style="text-align:right;"> 6.117944 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> yudqfjmg </td>
   <td style="text-align:left;"> tuimsqil </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 3 </td>
   <td style="text-align:right;"> 699784180 </td>
   <td style="text-align:right;"> 640456925 </td>
   <td style="text-align:right;"> 699936658 </td>
   <td style="text-align:right;"> 6.601338 </td>
   <td style="text-align:right;"> 4.971228 </td>
   <td style="text-align:right;"> 2.814284 </td>
   <td style="text-align:left;"> daymvjqa </td>
   <td style="text-align:left;"> jcvgzbuj </td>
   <td style="text-align:left;"> bkkutjau </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 4 </td>
   <td style="text-align:right;"> 659143790 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 9.478907 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> xvdzpylw </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 5 </td>
   <td style="text-align:right;"> 627234317 </td>
   <td style="text-align:right;"> 660916649 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 1.931959 </td>
   <td style="text-align:right;"> 1.253950 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> fmpcamnx </td>
   <td style="text-align:left;"> dctpbtam </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 7 </td>
   <td style="text-align:right;"> 693736060 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 2.075693 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> hnpuolaj </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 8 </td>
   <td style="text-align:right;"> 639782493 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 6.433026 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> rwmwqvdu </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 10 </td>
   <td style="text-align:right;"> 619850570 </td>
   <td style="text-align:right;"> 680929713 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 8.600371 </td>
   <td style="text-align:right;"> 6.954972 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> jzdkusva </td>
   <td style="text-align:left;"> zeqxntgc </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 11 </td>
   <td style="text-align:right;"> 645335202 </td>
   <td style="text-align:right;"> 629926642 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 2.682323 </td>
   <td style="text-align:right;"> 9.379491 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> lojmtrvs </td>
   <td style="text-align:left;"> cxqadrdj </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 12 </td>
   <td style="text-align:right;"> 607223895 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 7.975297 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> avxympqg </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 13 </td>
   <td style="text-align:right;"> 653996293 </td>
   <td style="text-align:right;"> 645038697 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 2.607843 </td>
   <td style="text-align:right;"> 8.760344 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> nnuqxigs </td>
   <td style="text-align:left;"> mcwduuiw </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 14 </td>
   <td style="text-align:right;"> 646393146 </td>
   <td style="text-align:right;"> 694678826 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 1.607134 </td>
   <td style="text-align:right;"> 8.862866 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> lkowclpa </td>
   <td style="text-align:left;"> bxhelfjs </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 16 </td>
   <td style="text-align:right;"> 616062260 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 6.175765 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> ncukcyzz </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 17 </td>
   <td style="text-align:right;"> 662680472 </td>
   <td style="text-align:right;"> 629480466 </td>
   <td style="text-align:right;"> 671447129 </td>
   <td style="text-align:right;"> 5.231123 </td>
   <td style="text-align:right;"> 2.209104 </td>
   <td style="text-align:right;"> 8.875030 </td>
   <td style="text-align:left;"> mkdaflur </td>
   <td style="text-align:left;"> zdnpwuia </td>
   <td style="text-align:left;"> oyftrcbp </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 18 </td>
   <td style="text-align:right;"> 614526543 </td>
   <td style="text-align:right;"> 635067768 </td>
   <td style="text-align:right;"> 608546595 </td>
   <td style="text-align:right;"> 3.632207 </td>
   <td style="text-align:right;"> 8.161684 </td>
   <td style="text-align:right;"> 5.084333 </td>
   <td style="text-align:left;"> uijzspbs </td>
   <td style="text-align:left;"> owrevrzb </td>
   <td style="text-align:left;"> afrcytbl </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 19 </td>
   <td style="text-align:right;"> 693548878 </td>
   <td style="text-align:right;"> 623388830 </td>
   <td style="text-align:right;"> 692795692 </td>
   <td style="text-align:right;"> 1.149800 </td>
   <td style="text-align:right;"> 2.247059 </td>
   <td style="text-align:right;"> 7.412554 </td>
   <td style="text-align:left;"> zoqoetuz </td>
   <td style="text-align:left;"> kthwcoef </td>
   <td style="text-align:left;"> juaelcsd </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 20 </td>
   <td style="text-align:right;"> 649672445 </td>
   <td style="text-align:right;"> 664961449 </td>
   <td style="text-align:right;"> 602632286 </td>
   <td style="text-align:right;"> 4.446254 </td>
   <td style="text-align:right;"> 9.614372 </td>
   <td style="text-align:right;"> 3.724153 </td>
   <td style="text-align:left;"> liutuwqf </td>
   <td style="text-align:left;"> rnrndysi </td>
   <td style="text-align:left;"> rqidgdol </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 21 </td>
   <td style="text-align:right;"> 642990005 </td>
   <td style="text-align:right;"> 636961722 </td>
   <td style="text-align:right;"> 684581198 </td>
   <td style="text-align:right;"> 9.319300 </td>
   <td style="text-align:right;"> 6.555269 </td>
   <td style="text-align:right;"> 7.147596 </td>
   <td style="text-align:left;"> ytcojema </td>
   <td style="text-align:left;"> tnsletpt </td>
   <td style="text-align:left;"> cqnoitbj </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 22 </td>
   <td style="text-align:right;"> 655936305 </td>
   <td style="text-align:right;"> 692048681 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 6.468607 </td>
   <td style="text-align:right;"> 5.884008 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> diypikrs </td>
   <td style="text-align:left;"> towijsgw </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 23 </td>
   <td style="text-align:right;"> 634100247 </td>
   <td style="text-align:right;"> 631965985 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 2.145143 </td>
   <td style="text-align:right;"> 4.648430 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> ovkziixa </td>
   <td style="text-align:left;"> owyiszmh </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 25 </td>
   <td style="text-align:right;"> 642384037 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 2.570212 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> yocaenac </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 26 </td>
   <td style="text-align:right;"> 639233975 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 7.821415 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> jabxdxab </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 27 </td>
   <td style="text-align:right;"> 623326281 </td>
   <td style="text-align:right;"> 657307628 </td>
   <td style="text-align:right;"> 680172458 </td>
   <td style="text-align:right;"> 6.333832 </td>
   <td style="text-align:right;"> 1.835592 </td>
   <td style="text-align:right;"> 2.802887 </td>
   <td style="text-align:left;"> rcmnymfb </td>
   <td style="text-align:left;"> ljxframj </td>
   <td style="text-align:left;"> mxcokckt </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 28 </td>
   <td style="text-align:right;"> 694408637 </td>
   <td style="text-align:right;"> 632219643 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 3.547176 </td>
   <td style="text-align:right;"> 8.953089 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> wsxxhocd </td>
   <td style="text-align:left;"> xhnvzwae </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 29 </td>
   <td style="text-align:right;"> 602132896 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 4.271840 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> hycucpcz </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
  <tr>
   <td style="text-align:right;"> 30 </td>
   <td style="text-align:right;"> 615307379 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> 5.279515 </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:right;"> NA </td>
   <td style="text-align:left;"> dvhbrnim </td>
   <td style="text-align:left;"> NA </td>
   <td style="text-align:left;"> NA </td>
  </tr>
</tbody>
</table>


Using `dcast` with the collaboration of `rowid` casts the table grouping by id and forces uniqueness without the data being aggregated.

I don't know if there is an easy way to achieve this with traditional tools like SQL or a spreadsheet, but I'm afraid that a little more work would be involved.
