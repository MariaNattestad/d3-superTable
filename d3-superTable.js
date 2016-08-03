d3.superTable = function() {
    
	var table_data = undefined;
	var table_header = undefined;
	var num_rows_to_show = undefined;
	var click_function = undefined;
    var element = null;
    var requirements = [{"op":"=","arg":"17"}];
    var previous_sort = {"column":null, "direction":"forward"};

    // my(selection) executes when we do .call() on a d3 selection:
    function my(selection) {
        selection.each(function(d, i) {
            element = d3.select(this);
            
            my.create_table();
        });
    };

    my.create_table = function() {
        if (table_header == undefined) {
                table_header = d3.keys(table_data[0]);
            }

            element.html("");
            var table = element.append("table").attr("class","d3-superTable-table");
            
            table.append("tr").attr("class","d3-superTable-header-row").selectAll("th")
                .data(table_header).enter()
                .append("th")
                    .html(function(d) {return d})
                    .on("click",my.click_header);

            var table_data_subset = table_data;
            var counter = 0;
            if (num_rows_to_show != undefined && num_rows_to_show < table_data.length) {
                table_data_subset = [];
                for (var i = 0; i < table_data.length; i++) {
                    table_data_subset.push(table_data[i]);
                    counter++;
                    if (counter >= num_rows_to_show) {
                        break;
                    }
                }
            }

            var rows = table.selectAll("tr.unselected").data(table_data_subset).enter().append("tr").attr("class","unselected");

            if (typeof(click_function) === "function") {
                rows.on("click", function (d) {
                    if (typeof(check_ready_function) != "function" || check_ready_function() == true) {
                        d3.selectAll("tr").attr("class","unselected");
                        d3.select(this).attr("class", "selected");
                        click_function(d);    
                    }
                }).style("cursor","pointer");
            }
            rows.selectAll("td").data(table_header).enter().append("td").html(function(d) { return d3.select(this.parentNode).datum()[d]});

    }

    my.click_header = function(d) {
        // Sort by column: numeric sort for numbers, natural sort for strings
        if (typeof(table_data[0][d]) === "string") {
            table_data.sort(function(a, b){return natural_sort(a[d],b[d])});    
        } else {
            table_data.sort(function(a, b){return a[d] - b[d]});
        }
        if (d == previous_sort.column) {
            if (previous_sort.direction == "forward") {
                table_data.reverse();   
                previous_sort.direction = "reverse";
            } else {
                previous_sort.direction = "forward";
            }
        } else {
            previous_sort.direction = "forward";
        }
        previous_sort.column = d;
        my.create_table();
    };

    my.table_data = function(value) {
        if (!arguments.length) return table_data;
        table_data = value;
        return my;
    };
    my.table_header = function(value) {
        if (!arguments.length) return table_header;
        table_header = value;
        return my;
    };
    my.num_rows_to_show = function(value) {
        if (!arguments.length) return num_rows_to_show;
        num_rows_to_show = value;
        return my;
    };
    my.click_function = function(value) {
        if (!arguments.length) return click_function;
        click_function = value;
        return my;
    };
    my.check_ready_function = function(value) {
        if (!arguments.length) return check_ready_function;
        check_ready_function = value;
        return my;
    };
    var natural_sort = function(a,b) {
        // Natural sort is from: http://web.archive.org/web/20130826203933/http://my.opera.com/GreyWyvern/blog/show.dml/1671288
        function chunk(t) {
            var tz = [], x = 0, y = -1, n = 0, i, j;

            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
                var m = (i == 46 || (i >=48 && i <= 57));
                if (m !== n) {
                    tz[++y] = "";
                    n = m;
                }
                tz[y] += j;
            }
            return tz;
        }

        var aa = chunk(a);
        var bb = chunk(b);

        for (x = 0; aa[x] && bb[x]; x++) {
            if (aa[x] !== bb[x]) {
                var c = Number(aa[x]), d = Number(bb[x]);
                if (c == aa[x] && d == bb[x]) {
                    return c - d;
                } else return (aa[x] > bb[x]) ? 1 : -1;
            }
        }
        return aa.length - bb.length;
    }

    return my;
}
