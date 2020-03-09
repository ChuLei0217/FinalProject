function buildTable(index) {
    d3.select("#dataPanel").selectAll("table").remove();
    var vname = (index === -1) ? "Vehicle Name" : rawData[features[0]][index];

    var table = d3.select("#dataPanel").append("table")
        .attr("style", "margin-left: 5px; margin-top: 20px;");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var data = [];
    var item0 = ["key", "value"];
    for(var i = 1; i < featLength; i++) {
        var feat = {key: features[i], value: (index === -1) ? "" : rawData[features[i]][index]};
        data.push(feat);
    }

    var item1 = [vname, ""];
    thead.append("tr")
        .selectAll("th")
        .data(item1)
        .enter()
        .append("th")
        .text(function(column) { return column; });

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    var cells = rows.selectAll("td")
        .data(function(row) {
            return item0.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .html(function(d) { return d.value; });
}

function Tableupdate(point) {

    d3.select("#dataPanel")
        .selectAll("table")
        .remove();

    var position=point.dposition
    var item=[]
    var carname=[features[0],rawData[features[0]][position]];

    var table = d3.select("#dataPanel").append("table")
            .attr("style", "margin-left: 5px"),
        thead = table.append("thead"),
        tbody = table.append("tbody");


    thead.append("tr")
        .selectAll("th")
        .data(carname)
        .enter()
        .append("th")
        .text(function(d) { return d; });

    var columns = ["id", "value"];
    for(var i=1;i<featLength;i++)
    {
        var dataitem={"id":null,"value":null}
        dataitem["id"]=features[i];
        dataitem["value"]=rawData[features[i]][position]
        item[i-1]=dataitem;
    }


    var rows = tbody.selectAll("tr")
        .data(item)
        .enter()
        .append("tr");


    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .html(function(d) { return d.value; });

    return table;
}