TabPane = React.createClass({displayName: "TabPane",
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        var classList = "tab-pane";
        if(this.props.Active) {
            classList += " active"
        }
        return (
            React.createElement("div", {className: classList, id: this.props.TabId}, 
                React.createElement("h1", null, this.props.Title), 
                this.props.children
            )
            );
    }
});

InfoTabPane = React.createClass({displayName: "InfoTabPane",
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        return React.createElement(TabPane, {Title: "Welcome to the Data Query Tool", 
                    TabId: this.props.TabId, Active: true}, 
                        React.createElement("p", null, "Data was last updated on ", this.props.UpdatedTime, "."), 
                        React.createElement("p", null, "Please define or use your query by using the following tabs."), 
                            React.createElement("dl", null, 
                            React.createElement("dt", null, "Define Fields"), 
                            React.createElement("dd", null, "Define the fields to be added to your query here."), 
                            React.createElement("dt", null, "Define Filters"), 
                            React.createElement("dd", null, "Define the criteria to filter the data for your query here."), 
                            React.createElement("dt", null, "View Data"), 
                            React.createElement("dd", null, "See the results of your query."), 
                            React.createElement("dt", null, "Statistical Analysis"), 
                            React.createElement("dd", null, "Visualize or see basic statistical measures from your query here."), 
                            React.createElement("dt", null, "Load Saved Query"), 
                            React.createElement("dd", null, "Load a previously saved query (by name) by selecting from this menu."), 
                            React.createElement("dt", null, "Manage Saved Queries"), 
                            React.createElement("dd", null, "Either save your current query or see the criteria of previously saved quer  ies here.")
                          )
                )
    }
});

FieldSelectTabPane = React.createClass({displayName: "FieldSelectTabPane",
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        return React.createElement(TabPane, {TabId: this.props.TabId}, 
                    React.createElement(FieldSelector, {title: "Fields", 
                        items: this.props.categories, 
                        onFieldChange: this.props.onFieldChange, 
                        selectedFields: this.props.selectedFields}
                    )
            )
    }

});

FilterSelectTabPane = React.createClass({displayName: "FilterSelectTabPane",
    render: function() {
        // return <TabPane TabId={this.props.TabId}>
        //             <FieldSelector title="Filters"
        //                 items={this.props.categories}
        //                 type="Criteria"
        //                 onFieldChange={this.props.onFieldChange}
        //                 onCriteriaChange={this.props.onCriteriaChange}
        //                 selectedFields={this.props.selectedFields} Criteria={this.props.Criteria}
        //             />
        //        </TabPane>
        return (
            React.createElement(TabPane, {TabId: this.props.TabId}, 
                React.createElement(FilterBuilder, {items: this.props.categories, 
                               updateFilter: this.props.updateFilter, 
                               filter: this.props.filter}
                )
            )
        );
    }
});

ViewDataTabPane = React.createClass({displayName: "ViewDataTabPane",
    getInitialState: function() {
        return { 'sessions' : [] }
    },
    runQuery: function() {
        if(this.props.onRunQueryClicked) {
            this.props.onRunQueryClicked(this.props.Fields, this.props.Sessions);
        }
    },
    downloadCSV: function() {
        var headers = this.props.Fields,
            csvworker = new Worker('GetJS.php?Module=dataquery&file=workers/savecsv.js');


        csvworker.addEventListener('message', function (e) {
            var dataURL, dataDate, link;
            if (e.data.cmd === 'SaveCSV') {
                dataDate = new Date().toISOString();
                dataURL = window.URL.createObjectURL(e.data.message);
                link = document.createElement("a");
                link.download = "data-" + dataDate + ".csv";
                link.type = "text/csv";
                link.href = dataURL;
                $(link)[0].click();

            }
        });
        csvworker.postMessage({
            cmd: 'SaveFile',
            data: this.props.Data,
            headers: headers,
            identifiers: this.props.Sessions
        });
    },
    changeDataDisplay: function(displayID) {
        this.props.changeDataDisplay(displayID);
    },
    render: function() {
        var buttons = (
            React.createElement("div", {className: "commands col-xs-12 form-group"}, 
                React.createElement("button", {className: "btn btn-primary", onClick: this.runQuery}, "Run Query"), 
                React.createElement("button", {className: "btn btn-primary", onClick: this.downloadCSV}, "Download Table as CSV")
            )
            );
        var criteria = [];
        for (var el in  this.props.Criteria) {
            if(!this.props.Criteria.hasOwnProperty(el)) {
                continue;
            }
            var item = this.props.Criteria[el];
            if(item === undefined) {
                criteria.push(
                    React.createElement("div", {className: "alert alert-warning", role: "alert"}, 
                        el, " has been added as a filter but not had criteria defined."
                    )
                );
            } else {
                criteria.push(
                    React.createElement("div", {className: "row"}, 
                        React.createElement("span", {className: "col-sm-3"}, el), 
                        React.createElement("span", {className: "col-sm-3"}, item.operator), 
                        React.createElement("span", {className: "col-sm-3"}, item.value)
                    )
                    );
            }

        }
        return React.createElement(TabPane, {TabId: this.props.TabId}, 
                    React.createElement("h2", null, "Query Criteria"), criteria, " ", buttons, 
                    React.createElement("div", {className: "form-group form-horizontal col-xs-12"}, 
                        React.createElement("label", {for: "selected-input", className: "col-sm-1 control-label"}, "Data"), 
                        React.createElement("div", {className: "col-sm-4"}, 
                            React.createElement("div", {className: "btn-group"}, 
                                React.createElement("button", {id: "selected-input", type: "button", className: "btn btn-default dropdown-toggle", "data-toggle": "dropdown"}, 
                                    React.createElement("span", {id: "search_concept"}, this.props.displayType), 
                                    React.createElement("span", {className: "caret"})
                                ), 
                                React.createElement("ul", {className: "dropdown-menu", role: "menu"}, 
                                    React.createElement("li", {onClick: this.changeDataDisplay.bind(this, 0)}, 
                                        React.createElement("div", {className: "col-sm-12"}, 
                                            React.createElement("h5", {className: ""}, "Cross-sectional")
                                        )
                                    ), 
                                    React.createElement("li", {onClick: this.changeDataDisplay.bind(this, 1)}, 
                                        React.createElement("div", {className: "col-sm-12"}, 
                                            React.createElement("h5", {className: ""}, "Longitudial")
                                        )
                                    )
                                )
                            )
                        )
                    ), 
                    React.createElement(StaticDataTable, {
                        Headers: this.props.RowHeaders, 
                        RowNumLabel: "Identifiers", 
                        Data: this.props.Data, 
                        RowNameMap: this.props.RowInfo}
                    )
               )
    }
});

ScatterplotGraph = React.createClass({displayName: "ScatterplotGraph",
    lsFit: function (data) {
        var i = 0,
            means = jStat(data).mean(),
            xmean = means[0],
            ymean = means[1],
            interim = 0,
            numerator  = 0,
            denominator = 0,
            slope,
            xi,
            yi;

            for (i = 0; i < data.length; i += 1) {
                xi = data[i][0];
                yi = data[i][1];
                numerator += (xi - xmean) * (yi - ymean);
                denominator += ((xi - xmean) * (xi - xmean));
            }

            slope = numerator / denominator;

            return [(ymean - slope * xmean), slope];
    },
    minmaxx: function (arr) {
        var i, min, max;

        for (i = 0; i < arr.length; i += 1) {
            if (arr[i][0] < min || min === undefined) {
                if (arr[i][0] !== undefined && arr[i][0] !== null) {
                    min = arr[i][0];
                }
            }
            if (arr[i][0] > max || max === undefined) {
                if (arr[i][0] !== undefined && arr[i][0] !== null) {
                    max = arr[i][0];
                }
            }
        }
        return [min, max];
    },
    updateScatterplot: function() {
        var xaxis = document.getElementById("scatter-xaxis").value,
            yaxis = document.getElementById("scatter-yaxis").value,
            grouping = document.getElementById("scatter-group").value,
            data = this.props.Data,
            points = [],
            min,
            max,
            field1 = [],
            field2 = [],
            grouped_points = {},
            i = 0,
            group_label,
            minmax,
            LS,
            slope,
            start,
            plots = [],
            label,
            plotY = function (x) { return [x, start + (slope * x)]; },
            dataset;

        for (i = 0; i < data.length; i += 1) {
            points.push([data[i][xaxis], data[i][yaxis]]);
            field1.push(data[i][xaxis]);
            field2.push(data[i][yaxis]);
            if (grouping) {
                group_label = data[i][grouping];
                if (!(grouped_points[group_label] instanceof Array)) {
                    grouped_points[group_label] = [];
                }
                grouped_points[group_label].push([data[i][xaxis], data[i][yaxis]]);
            }
        }



        if (grouping === 'ungrouped') {
            minmax = this.minmaxx(points);
            min = minmax[0];
            max = minmax[1];
            LS = this.lsFit(points);
            slope = LS[1];
            start = LS[0];

            $.plot("#scatterplotdiv", [{

                label: 'Data Points',
                data: points,
                points: { show: true }
            }, // Least Squares Fit
                {
                    label: 'Least Squares Fit',
                    data: jStat.seq(min, max, 3, plotY),
                    lines: { show: true }
                }], {});
        } else {
            minmax = this.minmaxx(points);
            min = minmax[0];
            max = minmax[1];
            i = 0;

            for (dataset in grouped_points) {
                if (grouped_points.hasOwnProperty(dataset)) {
                    label = document.getElementById("scatter-group").selectedOptions.item(0).textContent + " = " + dataset;
                    plots.push({
                        color: i,
                        label: dataset,
                        data: grouped_points[dataset],
                        points: { show: true }
                    });
                    LS = this.lsFit(grouped_points[dataset]);
                    //LS = lsFit(grouped_points[dataset].convertNumbers());
                    slope = LS[1];
                    start = LS[0];
                    plots.push({
                        color: i,
                        // label: "LS Fit for " + dataset,
                        data: jStat.seq(min, max, 3, plotY),
                        lines: { show: true }
                    });
                    i += 1;
                }
            }
            $.plot("#scatterplotdiv", plots, {});
        }

        $("#correlationtbl tbody").children().remove();
        $("#correlationtbl tbody").append("<tr><td>" + jStat.covariance(field1, field2) + "</td><td>" + jStat.corrcoeff(field1, field2) + "</td></tr>");
    },
    render: function() {
        var options = this.props.Fields.map(function(element, key){
                console.log(element);
                return (
                    React.createElement("option", {value: key}, 
                        element
                    )
                );
            })
            scatterStyle = {
                width: "500px",
                height: "500px"
            };
        return (
            React.createElement("div", null, 
                React.createElement("h2", null, "Scatterplot"), 

                React.createElement("div", {className: "col-xs-4 col-md-3"}, 
                    "Column for X Axis"
                ), 
                React.createElement("div", {className: "col-xs-8 col-md-3"}, 
                    React.createElement("select", {id: "scatter-xaxis", onChange: this.updateScatterplot}, 
                        React.createElement("option", null, "None"), 
                        options
                    )
                ), 

                React.createElement("div", {className: "col-xs-4 col-md-3"}, 
                    "Column for Y Axis"
                ), 
                React.createElement("div", {className: "col-xs-8 col-md-3"}, 
                    React.createElement("select", {id: "scatter-yaxis", onChange: this.updateScatterplot}, 
                        React.createElement("option", null, "None"), 
                        options
                    )
                ), 

                React.createElement("div", {className: "col-xs-4 col-md-3"}, 
                    "Group by column"
                ), 
                React.createElement("div", {className: "col-xs-8 col-md-3"}, 
                    React.createElement("select", {id: "scatter-group", onChange: this.updateScatterplot}, 
                        React.createElement("option", null, "None"), 
                        options
                    )
                ), 
                React.createElement("h3", null, "Scatterplot"), 
                React.createElement("div", {id: "scatterplotdiv", style: scatterStyle}), 
                React.createElement("h3", null, "Statistics"), 
                React.createElement("table", {id: "correlationtbl"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", null, "Covariance"), 
                            React.createElement("th", null, "Correlation Coefficient")
                        )
                    ), 
                    React.createElement("tbody", null
                    )
                )
            )
        );
    }
});
StatsVisualizationTabPane = React.createClass({displayName: "StatsVisualizationTabPane",
    getDefaultProps: function() {
        return {
            'Data' : []
        };
    },
    getInitialState: function() {
        return {
            'displayed': false
        }
    },
    render: function() {
        // if(this.state.displayed === false) {
        //     var content = <div>Statistics not yet calculated.</div>;
        //     // return <TabPane content={content} TabId={this.props.TabId} />;
        // } else 
        if(this.props.Data.length === 0) {
            var content = React.createElement("div", null, "Could not calculate stats, query not run");
            // return <TabPane content={content} TabId={this.props.TabId} />;
        } else {
            var stats = jStat(this.props.Data),
                min = stats.min(),
                max = stats.max(),
                stddev = stats.stdev(),
                mean = stats.mean(),
                meandev = stats.meandev(),
                meansqerr = stats.meansqerr(),
                quartiles = stats.quartiles(),
                rows = [];


            for(var i = 0; i < this.props.Fields.length; i += 1) {
                rows.push(React.createElement("tr", null, 
                    React.createElement("td", null, this.props.Fields[i]), 
                    React.createElement("td", null, min[i]), 
                    React.createElement("td", null, max[i]), 
                    React.createElement("td", null, stddev[i]), 
                    React.createElement("td", null, mean[i]), 
                    React.createElement("td", null, meandev[i]), 
                    React.createElement("td", null, meansqerr[i]), 
                    React.createElement("td", null, quartiles[i][0]), 
                    React.createElement("td", null, quartiles[i][1]), 
                    React.createElement("td", null, quartiles[i][2])
                ));
            }

            var statsTable = (
                React.createElement("table", {className: "table table-hover table-primary table-bordered colm-freeze"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", {className: "info"}, 
                            React.createElement("th", null, "Measure"), 
                            React.createElement("th", null, "Min"), 
                            React.createElement("th", null, "Max"), 
                            React.createElement("th", null, "Standard Deviation"), 
                            React.createElement("th", null, "Mean"), 
                            React.createElement("th", null, "Mean Deviation"), 
                            React.createElement("th", null, "Mean Squared Error"), 
                            React.createElement("th", null, "First Quartile"), 
                            React.createElement("th", null, "Second Quartile"), 
                            React.createElement("th", null, "Third Quartile")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        rows
                    )
                )
            );

            var content = (
                React.createElement("div", null, 
                    React.createElement("h2", null, "Basic Statistics"), 
                    statsTable, 

                    React.createElement(ScatterplotGraph, {
                        Fields: this.props.Fields, 
                        Data: this.props.Data}
                    )
                )
            );
        }
        return (
            React.createElement(TabPane, {TabId: this.props.TabId}, 
                content
            )
        );
    }
});

SaveQueryDialog = React.createClass({displayName: "SaveQueryDialog",
    getInitialState: function() {
        return {
            'queryName' : '',
            'shared' : false
        };
    },
    editName: function(e) {
        this.setState({ queryName : e.target.value });
    },
    editPublic: function(e) {
        this.setState({ shared : e.target.checked });
    },
    onSaveClicked: function() {
        // Should do validation before doing anything here.. ie query name is entered, doesn't already
        // exist, there are fields selected..
        if(this.props.onSaveClicked) {
            this.props.onSaveClicked(this.state.queryName, this.state.shared);
        }
    },
    onDismissClicked: function() {
        if(this.props.onDismissClicked) {
            this.props.onDismissClicked();
        }
    },
    render: function() {
        return (
            React.createElement("div", {className: "modal show"}, 
                React.createElement("div", {className: "modal-dialog"}, 
                    React.createElement("div", {className: "modal-content"}, 
                        React.createElement("div", {className: "modal-header"}, 
                            React.createElement("button", {type: "button", className: "close", "aria-label": "Close", onClick: this.onDismissClicked}, React.createElement("span", {"aria-hidden": "true"}, "×")), 
                            React.createElement("h4", {className: "modal-title", id: "myModalLabel"}, "Save Current Query")
                        ), 
                        React.createElement("div", {className: "modal-body"}, 
                            React.createElement("p", null, "Enter the name you would like to save your query under here:"), 
                            React.createElement("div", {className: "input-group"}, 
                                "Query Name: ", React.createElement("input", {type: "text", className: "form-control", placeholder: "My Query", value: this.state.queryName, onChange: this.editName})
                            ), 
                            React.createElement("p", null, "Make query a publicly shared query? ", React.createElement("input", {type: "checkbox", checked: this.state.shared ? 'checked' : '', onChange: this.editPublic, "aria-label": "Shared Query"}))

                        ), 
                        React.createElement("div", {className: "modal-footer"}, 
                            React.createElement("button", {type: "button", className: "btn btn-default", onClick: this.onDismissClicked}, "Close"), 
                            React.createElement("button", {type: "button", className: "btn btn-primary", onClick: this.onSaveClicked}, "Save changes")
                        )
                    )
                )
            )
            );
    }
});
ManageSavedQueryRow = React.createClass({displayName: "ManageSavedQueryRow",
    getDefaultProps: function() {
        return {
            'Name': 'Unknown',
            'Query': {
                'Fields': []
            }
        }
    },
    render: function() {
        var fields = [];
        var filters = [];
        if(this.props.Query.Fields) {
            for(var i = 0; i < this.props.Query.Fields.length; i += 1) {
                fields.push(React.createElement("li", null, this.props.Query.Fields[i]));
            }
        }

        if(fields.length === 0) {
            fields.push(React.createElement("li", null, "No fields defined"));
        }

        if(this.props.Query.Conditions) {
            for(var i = 0; i < this.props.Query.Conditions.length; i += 1) {
                var filter = this.props.Query.Conditions[i];
                filters.push(React.createElement("li", null, filter.Field, " ", filter.Operator, " ", filter.Value));
            }
        }
        if(filters.length === 0) {
            filters.push(React.createElement("li", null, "No filters defined"));
        }
        return (
                    React.createElement("tr", null, 
                        React.createElement("td", null, this.props.Name), 
                        React.createElement("td", null, React.createElement("ul", null, fields)), 
                        React.createElement("td", null, React.createElement("ul", null, filters))
                    )
        );
    }
});
ManageSavedQueriesTabPane = React.createClass({displayName: "ManageSavedQueriesTabPane",
    dismissDialog: function() {
        this.setState({ 'savePrompt' : false });
    },
    getInitialState: function() {
        return {
            'savePrompt' : false,
            'queriesLoaded' : false,
            'queries' : {}
        };
    },
    saveQuery: function() {
        this.setState({ 'savePrompt' : true });
    },
    savedQuery: function(name, shared) {
        if(this.props.onSaveQuery) {
            this.props.onSaveQuery(name, shared);
        }
        this.setState({ 'savePrompt' : false });
    },
    getDefaultProps: function() {
        return {
            userQueries: [],
            globalQueries: [],
            queriesLoaded: false,
            queryDetails: {}
        };
    },
    render: function() {
        var queryRows = [];
        if(this.props.queriesLoaded) {
            for(var i = 0; i < this.props.userQueries.length; i += 1) {
                var query = this.props.queryDetails[this.props.userQueries[i]];
                var name = "Unnamed Query: " + this.props.userQueries[i];
                if(query.Meta.name) {
                    name = query.Meta.name;
                }

                queryRows.push(
                        React.createElement(ManageSavedQueryRow, {Name: name, Query: query})
                    );

            }
        } else {
            queryRows.push(
                React.createElement("tr", null, 
                    React.createElement("td", {colSpan: "3"}, "Loading saved query details")
                )
            );
        }

        var savePrompt = '';
        if(this.state.savePrompt) {
            savePrompt = React.createElement(SaveQueryDialog, {onDismissClicked: this.dismissDialog, onSaveClicked: this.savedQuery});

        }
        var content = (
            React.createElement("div", null, 
                React.createElement("h2", null, "Your currently saved queries"), 
                React.createElement("button", {onClick: this.saveQuery}, "Save Current Query"), 
                React.createElement("table", {className: "table table-hover table-primary table-bordered colm-freeze"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", {className: "info"}, 
                            React.createElement("th", null, "Query Name"), 
                            React.createElement("th", null, "Fields"), 
                            React.createElement("th", null, "Filters")
                        )
                    ), 
                    React.createElement("tbody", null, 
                        queryRows
                    )
                ), 
                savePrompt
            )
        );
        return (
            React.createElement(TabPane, {TabId: this.props.TabId}, 
                content
            )
        );
    }
});
