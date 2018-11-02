---
title: "One Year Of Cubing"
excerpt: Some data analysis with the excuse of my first year of cubing
toc: true
tags:
- R
- data visualization
- cubes
classes: wide
---


Se ha cumplido un año desde que compré mi primer 2x2x2 y mi primer 3x3x3 decente... ¿Qué ha pasado desde entonces?

(Tools used: [R](https://www.r-project.org) and [Highcharts](http://highcharts.com/) wrapped by [Highcharter](http://jkunst.com/highcharter))

## Data Wrangling
La fuente es un _google doc_ que llevo al día con toda la información de la colección. Lo descargo como [tsv](https://en.wikipedia.org/wiki/Tab-separated_values) y creo un `data.table`:

```r
library(data.table)

cubos.dt <- fread(input = "data/Compras - Datos.tsv", header = T, select = seq(1, 19), dec = ',', nrows = 107)
```
Ya tengo en `cubos.dt` las primeras 19 columnas de las primeras 107 filas de mi fichero exportado; con cabecera, teniendo el tabulador como separador de columnas y la coma como separador de decimales. Un poco de formateo de los datos y estamos listos para empezar:

```r
library(lubridate)

cubos.dt[, c(15:17) := lapply(.SD, dmy), .SDcols = c(15:17)]
columnasFactor <- c(2, 4, 8, 9, 14)
cubos.dt[, c(columnasFactor) := lapply(.SD, factor), .SDcols = c(columnasFactor)] 
```
Asi quedan formateadas como `date` las columas de la 15 a la 17  y como `factor` las columnas: 2, 4, 8, 9, 14.

Estructura definitiva de la tabla:

```r
library(knitr)

str(cubos.dt)
```

```
## Classes 'data.table' and 'data.frame':	107 obs. of  19 variables:
##  $ N         : int  1 2 3 4 5 6 7 8 9 10 ...
##  $ Brand     : Factor w/ 23 levels "Calvin","Cube4You",..: 18 18 18 18 18 18 18 18 18 18 ...
##  $ Model     : chr  "Thunderclap V2 (3x3)" "QiDi S (2x2)" "Warrior W (3x3)" "QiYuan S (4x4)" ...
##  $ Type      : Factor w/ 17 levels "Copter Mod","Cube",..: 2 2 2 2 2 14 8 10 11 8 ...
##  $ Layers    : chr  "3" "2" "3" "4" ...
##  $ Faces     : int  6 6 6 6 6 6 4 6 4 12 ...
##  $ Pieces    : int  26 8 26 56 98 14 14 26 26 62 ...
##  $ Geometry  : Factor w/ 20 levels "4 Corner Hexagonal Dipyramid",..: 2 2 2 2 2 2 16 2 6 8 ...
##  $ Colors    : Factor w/ 19 levels "Black","Black (Carbon Red)",..: 1 14 14 14 14 14 14 19 14 14 ...
##  $ Mod       : logi  FALSE FALSE FALSE FALSE FALSE FALSE ...
##  $ Mag       : logi  FALSE FALSE FALSE FALSE FALSE FALSE ...
##  $ Def       : logi  FALSE FALSE FALSE FALSE FALSE FALSE ...
##  $ Price     : num  9.99 5 6 7.9 8.99 3.46 3.46 1.67 2.05 3.85 ...
##  $ Store     : Factor w/ 7 levels "kubekings","lezul",..: 2 2 2 2 2 7 7 7 7 7 ...
##  $ Released  : Date, format: "2016-07-06" "2017-03-20" ...
##  $ Ordered   : Date, format: "2017-10-21" "2017-10-21" ...
##  $ Received  : Date, format: "2017-10-21" "2017-10-21" ...
##  $ Image     : chr  "1_Thunderclap.jpg" "2_QiDi.jpeg" "3_Warrior.jpg" "4_QiYuan.jpg" ...
##  $ Difficulty: num  1.5 1 1.5 2 2 1 1 2 2.49 2 ...
##  - attr(*, ".internal.selfref")=<externalptr>
```

```r
kable(cubos.dt[1:2, 1:8], caption = 'First 8 columns of first 2 rows')
```



|  N|Brand |Model                |Type |Layers | Faces| Pieces|Geometry |
|--:|:-----|:--------------------|:----|:------|-----:|------:|:--------|
|  1|QiYi  |Thunderclap V2 (3x3) |Cube |3      |     6|     26|Cube     |
|  2|QiYi  |QiDi S (2x2)         |Cube |2      |     6|      8|Cube     |

## Big Picture
La primera aproximación será ver la evolución de compras a lo largo del año:

```r
totalEvolution.dt <- cubos.dt[, .(Ordered)]
totalEvolution.dt <- totalEvolution.dt[, .(cubes = .N), by = Ordered]
setorder(totalEvolution.dt, Ordered)

kable(head(totalEvolution.dt, 3), caption = 'First 3 rows')
```



|Ordered    | cubes|
|:----------|-----:|
|2017-10-21 |     2|
|2017-10-27 |     3|
|2017-11-07 |     5|

```r
library(highcharter)

highchart() %>%
  hc_title(text = "Evolution") %>%
  hc_xAxis(type = 'datetime', title = list(text = "Date"), style = list(fontWeight = "bold")) %>%
  hc_yAxis(title = list(text = "Cubes")) %>%
  hc_add_series_times_values(dates = totalEvolution.dt$Ordered, values = cumsum(totalEvolution.dt$cubes),
                             name = 'Cubes', type = 'areaspline') %>%
  hc_tooltip(shared = T)  %>%
  hc_add_theme(hc_theme_google())
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_VFG1137.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_VFG1137.html){: .btn .btn--inverse target="_blank"}

Empecé con tan solo 2 cubos (un 2x2 y un 3x3) comprados en una tienda de barrio. Me gustaron tanto que volví a la semana siguiente a comprar 3 más (otro 3x3, un 4x4 y un 5x5). Lejos de quedarme satisfecho, en menos de dos semanas ya estaba haciendo mi primer pedido online a un almacén de China.

Hasta primeros de mayo compras regulares bastante espaciadas. Luego 3 meses de descanso hasta que en agosto se me despierta el afan coleccionista y realizo tantas compras que casi doblo el número de cubos que tenía hasta ese momento. Después de la locura veraniega parece que vuelve la normalidad hasta que se cumple el primer año desde la primera compra.

En total 107 cubos.

## Monthly Detail
Tras la visión global es hora de una mirada más detallada por meses:

```r
splitMonths.dt <- cubos.dt[, .(Ordered, Store)]
splitMonths.dt <- splitMonths.dt[, .(cubes = .N, month = floor_date(Ordered, unit = 'month')), by = .(Ordered, Store)]
splitMonths.dt <- splitMonths.dt[, .(cubes = sum(cubes), orders = .N), by = month]
emptyMonths.dt <- data.table(month = c('2018-01-01', '2018-06-01', '2018-07-01'))
emptyMonths.dt[, month := ymd(month)]
splitMonths.dt <- rbindlist(list(splitMonths.dt, emptyMonths.dt), use.names = T, fill = T)
setorder(splitMonths.dt, month)

highchart() %>%
  hc_title(text = "Data by Month") %>%
  hc_xAxis(categories = paste(month(splitMonths.dt$month, label = T), substring(year(splitMonths.dt$month), 3)),
           title = list(text = "Month")) %>%
  hc_yAxis_multiples(
    list(title = list(text = "Cubes", style = list(color = hc_theme_google()$colors[1], fontWeight = "bold"))),
    list(opposite = T, title = list(text = "Orders", style = list(color = hc_theme_google()$colors[2],
                                                                  fontWeight = "bold"))),
    list(visible = F),
    list(visible = F)
  ) %>%
  hc_add_series(data = splitMonths.dt$cubes, name = 'Cubes', type = 'column') %>% 
  hc_add_series(data = splitMonths.dt$orders, yAxis = 1, name = 'Orders', type = 'column') %>%
  hc_add_series(data = round(splitMonths.dt$cubes / splitMonths.dt$orders, digits = 2), yAxis = 2, type = 'spline',
                dashStyle='Dash', lineWidth = 1, name = 'Cubes / Order', connectNulls = T) %>% 
  hc_tooltip(shared = T) %>%
  hc_add_theme(hc_theme_google())
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_CEK2975.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_CEK2975.html){: .btn .btn--inverse target="_blank"}

Se ve claramente que enero, junio y julio son los _meses de descanso_ y agosto el _mes del desmadre_. El resto de meses oscila entre uno o dos pedidos salvo el último con 3. En él se hace notar que en ocasiones es difícil encontrar determinados cubos. El hecho de que tenga la menor relación de cubos por pedido se debe a que tengo que recurrir a tiendas distintas para comprar cubos concretos que empiezan a escasear.

La comparación del número de cubos por mes se aprecia mejor en el siguiente gráfico:

```r
library(viridisLite)

cubesMonth.dt <- splitMonths.dt[, .(month, cubes)]
cubesMonth.dt[, `:=`(month = paste0(month(cubesMonth.dt$month, label = T), " '",
                                    substring(year(cubesMonth.dt$month), 3)))]
setorder(cubesMonth.dt, -cubes)
highchart() %>%
  hc_title(text = 'Cubes-Month Comparison') %>% 
  hc_colors(plasma(13)) %>%
  hc_add_series(cubesMonth.dt, type = "pyramid", hcaes(x = month, y = cubes), name = 'Cubes')
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_QJU8015.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_QJU8015.html){: .btn .btn--inverse target="_blank"}

Se podría decir que los meses vacacionales son los más abultados con diferencia.

## Price Distribution

```r
priceHistogram.dt <- cubos.dt[, .(Price)]

hchart(priceHistogram.dt$Price, name = 'Price') %>% hc_yAxis(title = list(text = "Number of Cubes")) %>%
  hc_add_theme(hc_theme_google())
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_SCF7129.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_SCF7129.html){: .btn .btn--inverse target="_blank"}

Afortunadamente la mayoría de cubos de momento cae en la categoría de (0-5]€. Según aumenta el precio disminuye el número de miembros del grupo salvo el caso (15-20]€ que curiosamente es más numeroso que el intervalo anterior.

## Stores
Un poco de análisis por tienda...
### Number Of Cubes

```r
shopsInfo.dt <- cubos.dt[, .(Store, Ordered)]
shopsInfo.dt <- shopsInfo.dt[, .(cubes = .N), by = .(Store, Ordered)]
shopsInfo.dt <- shopsInfo.dt[, .(cubes = sum(cubes), orders = .N), by = .(Store)]
setorder(shopsInfo.dt, -cubes, Store)
shopsInfo.dt[, `:=`(name = Store, value = cubes, Store = NULL, cubes = NULL, orders = NULL, color = plasma(7))]

highchart() %>%
  hc_title(text = 'Number Of Cubes By Store') %>%
  hc_xAxis(categories = shopsInfo.dt$Store) %>% 
  hc_add_series(shopsInfo.dt, name = "Cubes", type = 'treemap')
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_FJK2905.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_FJK2905.html){: .btn .btn--inverse target="_blank"}

Este gráfico refleja mi experiencia con las tiendas:

1. __zcube__: Precios muy competitivos, envío con seguimiento y muy rápido a pesar de venir de China. Tiene la página web mas atractiva de todas.
2. __kubekings__ y __lezul__: Mis tiendas españolas de referencia (online y física respectivamente) por su eficiencia y exquisita amabilidad que en muchas ocasiones hace ignorar posibles mejores precios de la competencia.
3. __lightake__ y __mefferts__: Tiendas con cubos exclusivos o que no encuentro en las anteriores. Buenos precios en la primera, no tanto en la segunda.
4. __puzzlesdeingenio__ y __losmundosderubik__: Tiendas españolas que me llamaban la atención y que he probado con distinta suerte. La experiencia con la primera fue satisfactoria y repetiré. En la segunda ignoraron todos mis intentos de contactar cuando el envío se retrasaba el doble del tiempo estimado. No puedo recomendarla.
5. __ukcubestore__: Experiencia incluso peor que con __losmundosderubik__. Venden productos sin existencias y esperan a que reclames por el pedido que no llega. En ese momento te proponen alternativas en stock o devolverte el dinero. Si eliges reembolso te ignoran completamente hasta que reclamas vía Paypal. A día de hoy siguen mostrando en stock un producto que hace meses me dijeron que estaba agotado.

### Prices

```r
priceStoreDist.dt <- cubos.dt[, .(Price, Store)]
#Ignoring stores with only one cube
priceStoreDist.dt <- priceStoreDist.dt[, N := .N, by = Store][N > 1]

hcboxplot(x = priceStoreDist.dt$Price, var = priceStoreDist.dt$Store, name = 'Price', tooltip = list(valueSuffix = ' €'), outliers = T) %>%
  hc_title(text = 'Prices By Store') %>%
  hc_yAxis(min = 0, title = list(text = "Price")) %>%
  hc_chart(type = 'column') %>%
  hc_add_theme(hc_theme_google())
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_IXC5859.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_IXC5859.html){: .btn .btn--inverse target="_blank"}

La tienda más cara con diferencia es __mefferts__. El cubo más barato que compré ahí tiene casi el mismo precio que el más caro comprado en __zcube__ que es donde compré el más barato y su mediana solo se ve mejorada por __lightake__. La mediana de __kubekings__ y __lezul__ es muy parecida resultando algo superior en el caso de la segunda aunque hay que decir a su favor que es la única en la que no habría que añadir gastos de envío.

En cualquier caso, este gráfico no representa los precios de las tiendas en general sino del tipo de cubos que compré en ellas.


## Brands
Ahora una visión centrada en las marcas...

### Number Of Cubes

```r
brandsInfo.dt <- cubos.dt[, .(Brand, Price)]
brandsQuantityDist.dt <- brandsInfo.dt[, .(value = .N), by = .(Brand)]
#First order, then asign colors and name
setorder(brandsQuantityDist.dt, -value)
brandsQuantityDist.dt[, `:=`(name = Brand, color = plasma(nrow(brandsQuantityDist.dt)))]

highchart() %>%
  hc_title(text = 'Number Of Cubes By Brand') %>%
  hc_xAxis(categories = brandsQuantityDist.dt$Brand) %>% 
  hc_add_series(brandsQuantityDist.dt, name = "Cubes", type = 'treemap')
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_LOL1575.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_LOL1575.html){: .btn .btn--inverse target="_blank"}

Este gráfico muestra una comparativa de la cantidad de cubos por marca en la colección. Coincide con el top 3 de mis favoritas pero hay algunas como __DaYan__, __WitEden__ y sobre todo __mf8__ que están muy por debajo de lo que deberían porque he comprado menos a causa de sus precios y de sus tipos de cubo tan especializados que son los últimos en unirse a la colección. El tiempo les irá acercando a los primeros puestos...

### Prices

```r
# Ignoring Brands with only one cube
brandsInfo.dt <- brandsInfo.dt[, N := .N, by = Brand][N > 1]

hcboxplot(x = brandsInfo.dt$Price, var = brandsInfo.dt$Brand, name = 'Price',
          tooltip = list(valueSuffix = ' €'), outliers = T) %>%
  hc_title(text = 'Prices By Brand') %>%
  hc_yAxis(min = 0, title = list(text = "Price")) %>%
  hc_chart(type = 'column') %>%
  hc_add_theme(hc_theme_google())
```

<div class="chart"><iframe src="/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_BOO8969.html"></iframe></div>[Open](/htmlwidgets/2018-11-01-One-Year-Of-Cubing/highchart_BOO8969.html){: .btn .btn--inverse target="_blank"}

Mucha información... Destacaré 3 titulares:

- __Calvin__ es sin lugar a dudas la marca más cara hasta el momento.
- __MoYu__ es la que abarca un abanico más amplio de precios.
- __QiYi__ es la que tiene más distancia entre el cubo más caro y el resto. Es lo que tiene alternar entre su línea barata y uno de sus cubos magnéticos de competición.
