  var SQL;
  var DB;

  var lastSelectedSport;

  // tables to use to lookup school names for the sport
  const SPORT_SCHOOL_TABLES = {
      "baseball": "hitting_1",
      "basketballb": "offense",
      "basketballg": "offense",
      "fieldhockey": "scoring",
      "football": "rushing",
      "hockey": "scoring",
      "lacrosseb": "scoring",
      "lacrosseg": "scoring",
      "soccerb": "scoring",
      "soccerg": "scoring",
      "softball":  "hitting_1",
      "volleyballb": "serving",
      "volleyballg": "serving",
      "waterpolob": "scoring",
      "waterpolog": "scoring"
  }

    // sports shared query sets
  const SPORT_QUERY_SET = {
      "baseball": "baseball_softball",
      "basketballb": "basketball",
      "basketballg": "basketball",
      "fieldhockey": "fieldhockey",
      "football": "football",
      "hockey": "hockey",
      "lacrosseb": "lacrosse",
      "lacrosseg": "lacrosse",
      "soccerb": "soccer",
      "soccerg": "soccer",
      "softball":  "baseball_softball",
      "volleyballb": "volleyball",
      "volleyballg": "volleyball",
      "waterpolob": "waterpolo",
      "waterpolog": "waterpolo"
  }

  var querySets;

  async function init(queriesJs) {
    const sqlPromise = initSqlJs({ locateFile: file => `./${file}` });

    fetch(queriesJs)
        .then((response) => response.text())
        .then((queries) => {
          querySets = eval(queries);
          updateQueries();
        });

    SQL = await sqlPromise;
    sportSelected();

    window.onpageshow = (event) => {
      showOrHideQuery();
    }

    document.getElementById("selectSport").onchange = sportSelected
    document.getElementById("selectQuery").onchange = querySelected
    document.getElementById("showQuery").onchange = showOrHideQuery
    document.getElementById("execute").onclick = executeQuery
  }

  function allQueriesToElement(element, queries) {
    if (queries) {
        for (var i = 0, max = queries.length; i < max; i++) {
          let query = queries[i];
          element.appendChild(new Option(query.description, i));
        }
    }
  }

  function updateQueries() {
    const selectedSport = document.getElementById("selectSport").selectedOptions[0].value;
    const selectQuery = document.getElementById("selectQuery");
    selectQuery.innerHTML = "";
    selectQuery.options.add(new Option("", ""));

    if (querySets && selectedSport) {
      const queries = querySets[SPORT_QUERY_SET[selectedSport]];

      allQueriesToElement(selectQuery, queries);
    }
  }

  async function sportSelected(event) {
    var select = document.getElementById("selectSchool");
    let oldSchool = select.selectedOptions[0];
    select.innerHTML = "";

    const selectedSport = document.getElementById("selectSport").selectedOptions[0].value;
    if (SPORT_QUERY_SET[selectedSport] != SPORT_QUERY_SET[lastSelectedSport]) {
        const selectQuery = document.getElementById("selectQuery");
        selectQuery.innerHTML = "";
    }


    const dataPromise = fetch("./" + selectedSport + ".db").then(res => res.arrayBuffer());
    const buf = await dataPromise;
    DB = new SQL.Database(new Uint8Array(buf));

    select.options.add(new Option("ALL", ""));

    const stmt = DB.prepare("select distinct school from " + SPORT_SCHOOL_TABLES[selectedSport] + " order by school asc");

    while(stmt.step()) { //
      const rowData = stmt.getAsObject();
      const school = rowData["school"];
      const option = new Option(school,school);
      select.options.add(option)
      if (oldSchool && school == oldSchool.value) {
        option.selected = true;
      }
    }

    if (SPORT_QUERY_SET[selectedSport] != SPORT_QUERY_SET[lastSelectedSport]) {
      updateQueries();
      setQuery("");
    }
    lastSelectedSport = selectedSport
  }

  function querySelected() {
    const sport = document.getElementById("selectSport").selectedOptions[0].value;
    const queryIndex = document.getElementById("selectQuery").selectedIndex;
    if (queryIndex > 0) {
      const query = querySets[SPORT_QUERY_SET[sport]][queryIndex - 1];
      setQuery(query.sql);
    } else {
      setQuery("");
    }
  }

  function setQuery(value) {
    document.getElementById("query").value = value;
    code_update(value);
  }

  function clearResults() {
    document.getElementById("results").innerHTML = "";
  }

  function executeQuery() {
      var school = document.getElementById("selectSchool").selectedOptions[0].value;
      const executeButton = document.getElementById("execute");
      // Prepare a statement
      try {
        executeButton.disabled = true;

        var querySQL = document.getElementById("query").value;

        if (school.length == 0) {
          querySQL = querySQL.replace("school = $school", "school like '%'");
        }

        if (!querySQL.match(/^ *$/) && querySQL.toUpperCase().indexOf(" LIMIT ") == -1) {
          querySQL += " LIMIT 250";
        }

        const stmt = DB.prepare(querySQL);

        stmt.bind({$school:school});

        var table = document.getElementById("results");
        table.innerHTML = "";

        var headerRendered = false;

        var index = 0;

        while(stmt.step()) { //
          const rowData = stmt.getAsObject();
          if (!headerRendered) {
            var row = table.insertRow();
            var cell = row.insertCell();
            cell.innerHTML = "#";
            for (var key in rowData) {
              cell = row.insertCell();
              cell.innerHTML = key;
            }
            headerRendered = true;
          }
          var row = table.insertRow();
          var cell = row.insertCell();
          cell.innerHTML = "" + (++index);
          for (var key in rowData) {
            cell = row.insertCell();
            cell.innerHTML = rowData[key];
          }
        }
      } catch (ex) {
        alert("Failure executing query:\n\n" + ex);
      }

      if (index == 0) {
        table.innerHTML = "<caption>No data matches query criteria</caption>"
      }
      executeButton.disabled = false;
  }

  function showOrHideQuery() {
    let showQuery = document.getElementById("showQuery").checked;
    document.getElementById("query-container").style.display = showQuery ? "block" : "none";
  }
