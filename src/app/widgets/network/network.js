(function () {
    'use strict';

    var networkModule = angular.module('qorDash.widget.network')
            .directive('qlNetwork', qlNetwork)
        ;
    qlNetwork.$inject = ['d3', '$window', '$interval', '$state', '$http', '$timeout'];
    function qlNetwork(d3, $window, $interval, $state, $http, $timeout) {
        return {
            restrict: 'EA',
            link: function (scope, element, attrs) {
                d3.d3().then(function (d3) {
                    function initJson() {
                        return $http.get('data/network-data.json')
                            .then(function (res) {
                                scope.sourceJson = res.data;

                                $timeout(function () {
                                    scope.$apply(function () {
                                        scope.setNetworkData(scope.sourceJson);
                                    });
                                });
                            });
                    }

                    function showDetails(root) {
                        $state.go('app.domains.domain.env.network.node', {depth: root.depth, node: root.name});
                    }

                    scope.render = function (data) {
                        var root = data;

                        var margin = {top: 20, right: 0, bottom: 0, left: 0},
                            width = element.width(),
                            height = $window.innerHeight - margin.top - margin.bottom - 120,
                            formatNumber = d3.format(",d"),
                            transitioning;

                        var x = d3.scale.linear()
                            .domain([0, width])
                            .range([0, width]);

                        var y = d3.scale.linear()
                            .domain([0, height])
                            .range([0, height]);

                        var treemap = d3.layout.treemap()
                            .children(function(d, depth) { return depth ? null : d._children; })
                            .sort(function(a, b) { return a.amount - b.amount; })
                            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
                            .round(false)
                            .value(function(d) { return d.amount; });

                        var svg = d3.select(element[0]).append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.bottom + margin.top)
                            .style("margin-left", -margin.left + "px")
                            .style("margin-right", -margin.right + "px")
                            .classed('network-svg', true)
                            .call(addShadow)
                            .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                            .style("shape-rendering", "crispEdges");

                        var grandparent = svg.append("g")
                            .attr("class", "grandparent");

                        grandparent.append("rect")
                            .attr("y", -margin.top)
                            .attr("x", -1)
                            .attr("width", width)
                            .attr("height", margin.top)
                            .attr("rx", "3px")
                        ;

                        grandparent.append("text")
                            .attr("x", 6)
                            .attr("y", 4 - margin.top)
                            .attr("dy", ".75em")
                            .attr("fill", '#fff')
                        ;


                        function subRender(root) {
                            initialize(root);
                            accumulate(root);
                            layout(root);
                            display(root);

                            function initialize(root) {
                                root.x = root.y = 0;
                                root.dx = width;
                                root.dy = height;
                                root.depth = 0;
                            }

                            function accumulate(d) {
                                return (d._children = d.children)
                                    ? d.amount = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
                                    : 1;
                            }

                            function layout(d) {
                                var _depth = 0;
                                return _layout(d);
                                function _layout(d) {
                                    d.depth = _depth;
                                    if (d._children) {
                                        treemap.nodes({_children: d._children});
                                        _depth++;
                                        d._children.forEach(function(c) {
                                            c.x = d.x + c.x * d.dx;
                                            c.y = d.y + c.y * d.dy;
                                            c.dx *= d.dx;
                                            c.dy *= d.dy;
                                            var k = .85;
                                            c.x += c.dx * (1 - k) / 2;
                                            c.y += c.dy * (1 - k) / 2;
                                            c.dx *= k;
                                            c.dy *= k;
                                            c.parent = d;
                                            _layout(c);
                                        });
                                        _depth--;
                                    }
                                }
                            }

                            function display(d) {
                                grandparent
                                    .datum(d.parent)
                                    .on("click", transition)
                                    .select("text")
                                    .text(name(d));

                                var g1 = svg.insert("g", ".grandparent")
                                    .datum(d)
                                    .attr("class", "depth");

                                var g = g1.selectAll("g")
                                    .data(d._children)
                                    .enter().append("g");

                                g.filter(function(d) { return d._children; })
                                    .classed("children", true)
                                    .on("click", transition)
                                ;

                                g.selectAll(".child")
                                    .data(function(d) { return d._children || [d]; })
                                    .enter().append("rect")
                                    .attr("class", "child")
                                    .call(rect)
                                    //.on("click", transition)
                                ;

                                g.selectAll(".child-text")
                                    .data(function(d) { return d._children || [d]; })
                                    .enter().append("text")
                                    .classed("overlaidText",true)
                                    .text(function(d) { return d.name; })
                                    .call(text)
                                ;

                                g.append("rect")
                                    .attr("class", "parent")
                                    .call(rect)
                                    .append("title")
                                    .text(function(d) { return formatNumber(d.value); });

                                g.append("text")
                                    .classed("overlaidText",true)
                                    .text(function(d) { return d.name; })
                                    .call(text);

                                function transition(d) {
                                    if (transitioning || !d) return;
                                    transitioning = true;

                                    var g2 = display(d),
                                        t1 = g1.transition().duration(750),
                                        t2 = g2.transition().duration(750);


                                    x.domain([d.x, d.x + d.dx]);
                                    y.domain([d.y, d.y + d.dy]);


                                    svg.style("shape-rendering", null);


                                    svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });


                                    t1.selectAll("text").call(text).style("fill-opacity", 0);
                                    t2.selectAll("text").call(text).style("fill-opacity", 1);
                                    t1.selectAll("rect").call(rect);
                                    t2.selectAll("rect").call(rect);


                                    t1.remove().each("end", function() {
                                        svg.style("shape-rendering", "crispEdges");
                                        transitioning = false;
                                    });

                                    showDetails(d);
                                }

                                return g;
                            }

                            function text(text) {
                                text.attr("x", function(d) { return x(d.x) + 6; })
                                    .attr("y", function(d) { return y(d.y) + 12; });
                            }

                            function rect(rect) {
                                rect.attr("x", function(d) { return x(d.x); })
                                    .attr("y", function(d) { return y(d.y); })
                                    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                                    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
                                    .attr("rx", "3px")
                                ;
                            }

                            function name(d) {
                                return d.parent ? name(d.parent) + " / " + d.name : d.name;
                            }

                        }

                        function addShadow(svg) {
                            var defs = svg.append( 'defs' );

                            var filter = defs.append( 'filter' )
                                .attr( 'id', 'drop-shadow' )
                                .attr('height', '130%');

                            filter.append( 'feGaussianBlur' )
                                .attr( 'in', 'SourceAlpha' )
                                .attr( 'stdDeviation', 1 )
                                .attr( 'result', 'blur' );

                            filter.append( 'feOffset' )
                                .attr( 'in', 'blur' )
                                .attr( 'dx', 0 )
                                .attr( 'dy', 0 )
                                .attr( 'result', 'offsetBlur' );

                            var feMerge = filter.append( 'feMerge' );

                            feMerge.append( 'feMergeNode' )
                                .attr( 'in", "offsetBlur' );

                            feMerge.append( 'feMergeNode' )
                                .attr( 'in', 'SourceGraphic' );
                        }

                        if (!scope.sourceJson) {
                            initJson().then(function () {
                                subRender(scope.sourceJson)
                            });
                        } else {
                            subRender(scope.sourceJson);
                        }
                    };
                    scope.render();
                });
            }}
    }

})();
