/**
 * Created by javierph on 21/11/16.
 */

// Valores iniciales
var margin = {top: 30, right: 250, bottom: 30, left: 80};
var width = 1150 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;
var dataset;
var dataByBookType;
var xScale;
var yScale;
var rScale;
var colorScale;
var rRange = [4, 12];
var opacity = 0.8;
var bookType = 'all_books';
var duration = 100;


// SVG y D3
var svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
var gChar = svg.append('g')
    .attr('class', 'main')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
// el orden de definicion de elementos es vital en los casos de solape. El definido posteriormente (grupoCirculos) queda por encima de los anteriores (grupoZonas)
// http://stackoverflow.com/questions/24045673/reorder-elements-of-svg-z-index-in-d3-js
// otras posibles soluciones http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
var grupoRectas = gChar.append('g').attr('class', 'gRectas');
var grupoZonas = gChar.append('g').attr('class', 'gZonas');
var grupoCirculos = gChar.append('g').attr('class', 'gCircles');
var toolTipDiv = d3.select('#tooltip');
var botones = d3.select('#botones');
var formatSinDecimales = d3.format(",.0f");
var formatConDecimales = d3.format(",.2f");


// Carga de datos
var fileName = '/dataViz/data/gr_data.json';
d3.json(fileName, function(error, jsonData) {
    if(error) throw error;
    dataset = jsonData;
    //dataset = dataset.filter(function(d) { return d.isFiction == true; });

    // Escalas
    xScale = d3.scale.sqrt()//.log().base(50) //.base(10) .sqrt()// si no se pone nada se supone que la base del logaritmo es 10
        .domain([d3.min(dataset, function(d) {return d['book.ratings_count'];}), d3.max(dataset, function(d) {return d['book.ratings_count'];})])
        .nice() //qué potito! así no me quedan los puntos mínimos pegados al eje x
        .range([0, width]);
    yScale = d3.scale.linear()
        .domain([d3.min(dataset, function(d) {return d['book.average_rating'];}), 0.1 + d3.max(dataset, function(d) {return d['book.average_rating'];})])
        .nice() //qué potito! así no me quedan los puntos mínimos pegados al eje y
        .range([height, 0]);
    // ojo a la notación aquí con d['nombre.con.puntos'] necesaria ya que d.nombre.con.puntos fallaría por razones obvias
    var minPages = d3.min(dataset, function(d) {return d.num_pages;});
    var maxPages = d3.max(dataset, function(d) {return d.num_pages;});
    rScale = d3.scale.linear()
        .domain([minPages, maxPages])
        .nice()
        .range(rRange);
    // escala para los colores basada en lo visto en http://bl.ocks.org/nbremer/a43dbd5690ccd5ac4c6cc392415140e7
    var minYear = d3.min(dataset, function(d) {return d.original_publication_year;});
    var maxYear = d3.max(dataset, function(d) {return d.original_publication_year;});
    colorScale = d3.scale.linear()
        .domain([minYear, maxYear])
        .range(['#132B43', '#56B1F7']) // colores sacados de https://www.r-bloggers.com/choosing-colour-palettes-part-i-introduction/
        //.range(['#382110', '#F7C8A6'])
        //Interesante también: http://stackoverflow.com/questions/25211078/what-are-the-default-plotting-colors-in-r-or-ggplot2/25211125#25211125)
        .interpolate(d3.interpolateHcl);

    // Ejes respecto a la escala definida
    var xAxis = d3.svg.axis().scale(xScale)
        .ticks(10, ',.1s') // http://bl.ocks.org/mbostock/5537697
        .orient('bottom');
    var yAxis = d3.svg.axis().scale(yScale).orient('left');
    // Se pintan ejes
    gChar.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    gChar.append('g').attr('class', 'y axis').attr('transform', 'translate(0, 0)').call(yAxis);
    // Se añaden las etiquetas de los ejes
    gChar.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 5)
        .text("Ratings count");
    gChar.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", 13)
        .attr("transform", "rotate(-90)")
        .text("Average rating");

    /*console.log(  d3.min(dataset, function(d) {return d['book.ratings_count'];})  )
    console.log(d3.max(dataset, function(d) {return d['book.ratings_count'];}))
    console.log(  d3.min(dataset, function(d) {return d['book.average_rating'];})  )
    console.log(d3.max(dataset, function(d) {return d['book.average_rating'];}))

    console.log(xScale.domain());
    console.log(yScale.domain());
    console.log(rScale.domain());
    console.log(rScale.domain()[1]);
    console.log(colorScale.domain());*/

    dataByBookType = dataset;

    // Se crean los círculos
    actualizarCirculos();

    // Leyendas:
    var colorLegend = d3.legend.color()
        .orient('horizontal')
        .shapeWidth(10)
        //.shapeHeight(8)
        .labelAlign("start")
        .cells(10)
        .labels([minYear, '', '', '', '', '', '', '', '', maxYear])
        .shapePadding(0)
        .title('Publication year')
        .scale(colorScale);
    svg.append("g")
        .attr("class", "colorLegend")
        .attr("transform", "translate(900, 30)");
    svg.select(".colorLegend").call(colorLegend);

    var sizeLegend = d3.legend.size()
        .shape('circle')
        .orient('horizontal')
        .cells(5)
        .labels([rScale.domain()[0] == 0 ? 'n/a' : rScale.domain()[0], '', (rScale.domain()[1] - rScale.domain()[0]) / 2, '', rScale.domain()[1]]) // si finalmente uso el dominio de la escala puedo eliminar el calculo de min y max pages
        //.shapePadding(5)
        .title('Pages')
        .scale(rScale);
    svg.append("g")
        .attr("class", "sizeLegend")
        .attr("transform", "translate(900, 130)");
    svg.select(".sizeLegend").call(sizeLegend);


    // Se crean las rectas de las medias de cada medida
    var ratings_countArray = dataByBookType.map(function(d) { return parseInt(d['book.ratings_count'], 10); });
    ratings_countArray = ratings_countArray.sort(function(a,b){return a - b}); // se ordena por valor (por defecto sort lo hace alfabeticamente)
    console.log(ratings_countArray + ' - ' + d3.quantile(ratings_countArray, 0.75));
    //var ratings_countMean = d3.mean(dataByBookType, function(d) { return d['book.ratings_count']; });
    var ratings_countMean = d3.quantile(ratings_countArray, 0.87); // en vez de la media se usa quantile exigente
    var average_ratingMean = d3.mean(dataByBookType, function(d) { return d['book.average_rating']; });

    console.log(ratings_countMean);
    console.log(average_ratingMean);
    grupoRectas.append('line')
        .attr('id', 'xMeanLine')
        .attr('class', 'lines')
        .attr('x1', 0)
        .attr('y1', yScale(average_ratingMean))
        .attr('x2', width)
        .attr('y2', yScale(average_ratingMean));
    grupoRectas.append('line')
        .attr('id', 'yMeanLine')
        .attr('class', 'lines')
        .attr('x1', xScale(ratings_countMean))
        .attr('y1', height)
        .attr('x2', xScale(ratings_countMean))
        .attr('y2', 0);
    // Se añaden las etiquetas de las rectas
    grupoRectas.append("text")
        .attr("id", "xMeanLabel")
        .attr("class", "meanLabel")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", yScale(average_ratingMean) - 5)
        .text(formatConDecimales(average_ratingMean));
    grupoRectas.append("text")
        .attr("id", "yMeanLabel")
        .attr("class", "meanLabel")
        .attr("text-anchor", "start")
        .attr("x", - height + 5)
        .attr("y", xScale(ratings_countMean) - 5)
        .attr("transform", "rotate(-90)")
        .text(formatSinDecimales(ratings_countMean));

    // Hago la tonterida de las zonas
    grupoZonas.append('text')
        .attr({'id': 'zoneLabel', 'x': width / 2, 'y': 0})
        // http://apike.ca/prog_svg_text_style.html
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'before-edge')
        .style({'font-size': '40px', 'font-weight': 'bold'});
    var zoneLabelOpacity = 0.2; // aumentar esta opacidad si se quiere ver
    var zoneRectOpacity = 0.05; // aumentar esta opacidad si se quiere ver
    grupoZonas.append('rect')
        .attr({'class': 'zoneRect', 'x': 0, 'y': 0})
        .attr('width', xScale(ratings_countMean))
        .attr('height', yScale(average_ratingMean))
        .attr('opacity', 0)
        .on("mouseenter", function(){
            d3.select('svg g.main #zoneLabel')
                .text('Specialized Zone')
                .style('opacity', zoneLabelOpacity);
            d3.selectAll('.zoneRect').attr('opacity', 0);
            d3.select(this).attr('opacity', zoneRectOpacity);
        });
    grupoZonas.append('rect')
        .attr({'class': 'zoneRect', 'x': xScale(ratings_countMean), 'y': 0})
        .attr('width', width - xScale(ratings_countMean))
        .attr('height', yScale(average_ratingMean))
        .attr('opacity', 0)
        .on("mouseenter", function(){
            d3.select('svg g.main #zoneLabel')
                .text('Masterpiece Zone')
                .style('opacity', zoneLabelOpacity);
            d3.selectAll('.zoneRect').attr('opacity', 0);
            d3.select(this).attr('opacity', zoneRectOpacity);
        });
    grupoZonas.append('rect')
        .attr({'class': 'zoneRect', 'x': 0, 'y': yScale(average_ratingMean)})
        .attr('width', xScale(ratings_countMean))
        .attr('height', height - yScale(average_ratingMean))
        .attr('opacity', 0)
        .on("mouseenter", function(){
            d3.select('svg g.main #zoneLabel')
                .text('Marginal Zone')
                .style('opacity', zoneLabelOpacity);
            d3.selectAll('.zoneRect').attr('opacity', 0);
            d3.select(this).attr('opacity', zoneRectOpacity);
        });
    grupoZonas.append('rect')
        .attr({'class': 'zoneRect', 'x': xScale(ratings_countMean), 'y': yScale(average_ratingMean)})
        .attr('width', width - xScale(ratings_countMean))
        .attr('height', height - yScale(average_ratingMean))
        .attr('opacity', 0)
        .on("mouseenter", function(){
            d3.select('svg g.main #zoneLabel')
                .text('Bestseller Zone')
                .style('opacity', zoneLabelOpacity);
            d3.selectAll('.zoneRect').attr('opacity', 0);
            d3.select(this).attr('opacity', zoneRectOpacity);
        });


    // Se añade acción click a los botones
    botones.selectAll('.button').on('click', onClick);

    //Se actualizan los botones
    actualizarBotones();
});


// Función que actualiza el aspecto de los botones según el último seleccionado
function actualizarBotones() {
    botones.selectAll('.primary').classed('primary', false);
    botones.select('#' + bookType).classed('primary', true);
    console.log(bookType);
}

// Función que realiza las operaciones necesarias tras un click de botón
function onClick() {
    bookType = this.id;
    if(bookType == 'all_books') {
        dataByBookType = dataset;
    } else if (bookType == 'fiction_books') {
        dataByBookType = dataset.filter(function(d) { return d.isFiction == true; });
    } else {
        dataByBookType = dataset.filter(function(d) { return d.isFiction == false; });
    }

    actualizarBotones();
    actualizarCirculos();
}


// Función que actualiza los círculos según los datos del año establecido
function actualizarCirculos() {
    var selection = grupoCirculos.selectAll('circle').data(dataByBookType)
        .attr('cx', function (d) {return xScale(d['book.ratings_count'])})
        .attr('cy', function (d) {return yScale(d['book.average_rating'])})
        .attr('r', function (d) {return rScale(d.num_pages)})
        .attr('fill', function (d) {return colorScale(d.original_publication_year);})
        //.attr('stroke', '#000000') //702F00
        .style('opacity', opacity);
    selection.enter()
        .append('circle')
        //.transition().duration(duration)
        .attr('cx', function (d) {return xScale(d['book.ratings_count'])})
        .attr('cy', function (d) {return yScale(d['book.average_rating'])})
        .attr('r', function (d) {return rScale(d.num_pages)})
        .attr('fill', function (d) {return colorScale(d.original_publication_year);})
        //.attr('stroke', '#000000') //702F00
        .style('opacity', opacity)
        .on("dblclick", function(d){
            window.open(d['book.link'], '_blank');
        })
        .on("mouseover", function (d) {
            // Se resalta el círculo sobre los demás y se muestra su tooltip
            grupoCirculos.selectAll('circle').transition().duration(300).style('opacity', .3);
            var circle = d3.select(this);
            circle.transition().duration(100).style("opacity", 1).attr("r", 12);
            d3.select("#title").text(d['book.title']);
            d3.select("#author").text(d['author.name']);
            d3.select("#original_publication_year").text(d['original_publication_year']);
            d3.select("#num_pages").text(d['num_pages'] == 0? '' : d['num_pages']);
            d3.select("#average_rating").text(d['book.average_rating']);
            d3.select("#ratings_count").text(formatSinDecimales(d['book.ratings_count']));
            //Show the tooltip
            toolTipDiv.classed("hidden", false);
        })
        .on("mousemove", function(){
            // La posición del tooltip está en función de la posición del ratón
            return toolTipDiv.style("top", (event.pageY - 5)+"px").style("left",(event.pageX + 15)+"px");
        })
        .on("mouseout", function () {
            // Se deja la gráfica tal y como estaba
            grupoCirculos.selectAll('circle').transition().duration(200).style('opacity', opacity)
                .attr("r", function (d) {return rScale(d.num_pages)});
            toolTipDiv.classed("hidden", true);
        });
    selection.exit()
        .remove();
}
