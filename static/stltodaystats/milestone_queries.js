(function() {
   function milestoneQuery(description, tableName, column, number, header) {
        return { "description": description,
                 "sql": 'with' +
          ` maxseason(season) as (select max(season) from ${tableName}),` +
               ` previous(school, name, metric, season) as (select school, name, sum(${column}) metric, max(season) from ${tableName} where season <> (select season from maxseason) group by name, school),` +
               ` current(school, name, metric, season) as (select school, name, sum(${column}) metric, max(season) from ${tableName} group by name, school)` +
          ` select current.name, current.school, previous.season, previous.metric as "${header}", current.season, current.metric as "${header}" from previous, current where previous.name = current.name and previous.school = current.school` +
               ` and current.metric >= ${number} and previous.metric < ${number}`
        }
   }

   return {
      "basketball": [
        milestoneQuery("1000 Points", "offense", "points", 1000, "Points"),
        milestoneQuery("1000 Rebounds", "defense", "rebounds", 1000, "Rebounds")
      ],
      "volleyball": [
        milestoneQuery("1000 Kills", "offense", "kills", 1000, "Kills"),
        milestoneQuery("1000 Assists", "offense", "assists", 1000, "Assists"),
        milestoneQuery("1000 Digs", "defense", "dig_attempts - dig_errors", 1000, "Digs")
      ]
  };
})();
