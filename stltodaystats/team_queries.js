(function() {
      const SCHOOL_SEASON_SELECT = 'select school as "School", season as "Season"';
      const GROUP_BY_SCHOOL_SEASON = ' GROUP BY school, season';

      function createObject(description, sql) {
        return {
            "description": description,
            "sql": sql
        }
      }

      function beatSchoolSeasonQuery(description, columnHeaders, table) {
            let statColumn = columnHeaders[columnHeaders.length - 1].column;
            let columnString = columnHeaders.map(it => {
                return `sum(${it.column}) as "${it.header}"`
            }).join(',');
            return createObject(description,
              `${SCHOOL_SEASON_SELECT}, ${columnString} from ${table} WHERE sum(${statColumn}) > 0 ${GROUP_BY_SCHOOL_SEASON} order by ${statColumn} desc`)
      }

      const battingAvg = 'cast(sum(singles) + sum(doubles) + sum(triples) + sum(homers) as float) / cast(sum(at_bats) as float)';
      const earnedRunAvg = '(sum(earned_runs) / sum(innings_pitched) * 7)';

      const threePtPct = 'cast(sum(three_point_shots) as float) / cast(sum(three_point_attempts) as float) * 100';
      const freeThrowPct = 'cast(sum(free_throws) as float) / cast(sum(free_throw_attempts) as float) * 100';

      return {
        "baseball_softball": [
            createObject("Team Season Batting Avg. (300+ AB)",
                `${SCHOOL_SEASON_SELECT}, sum(singles) + sum(doubles) + sum(triples) + sum(homers) as "Hits", sum(at_bats) as "At Bats", printf("%.3f",${battingAvg}) as "Average" from hitting_1 ${GROUP_BY_SCHOOL_SEASON} having sum(at_bats) >= 300 order by ${battingAvg} desc`),
            createObject("Team Season ERA (200+ IP)",
                `${SCHOOL_SEASON_SELECT}, printf("%.1f", sum(innings_pitched)) as "Innings", sum(earned_runs) as "Earned Runs", printf("%.2f",${earnedRunAvg}) as "ERA" from pitching_1 ${GROUP_BY_SCHOOL_SEASON} having sum(innings_pitched) >= 200 order by ${earnedRunAvg} asc`),

        ],
        "basketball": [
        // many players have this stat entered weird and have more made than attempts. Throwing them out skews the
        // team result whereas it just "eliminates" the player on the individual stats.
//            createObject("Team Season 3 Pt% (100+ shots)",
//                'with player(name, school, season, three_point_shots, three_point_attempts) as (select name, school, season, three_point_shots, three_point_attempts from offense where three_point_attempts > 0 and three_point_attempts >= three_point_shots)' +
//                ` ${SCHOOL_SEASON_SELECT}, sum(three_point_shots) as "3s Made", sum(three_point_attempts) as "Attempts", printf("%.1f",${threePtPct}) as "3 Pt%" from player ${GROUP_BY_SCHOOL_SEASON} having sum(three_point_attempts) >= 100 and sum(three_point_attempts) >= sum(three_point_shots) order by ${threePtPct} desc`),
//            createObject("Team Season Free Throw% (150+ FTs)",
//                `${SCHOOL_SEASON_SELECT}, sum(free_throws) as "Throws Made", sum(free_throw_attempts) as "Attempts", printf("%.1f", ${freeThrowPct}) as "Free Throw%" from offense ${GROUP_BY_SCHOOL_SEASON} having sum(free_throw_attempts) >= 150 order by ${freeThrowPct} desc`),
        ]
      }
})();