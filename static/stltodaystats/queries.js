(function() {

    const CAREER_SELECT = 'select name as "Name", school as "School", max(season) as "Final Season"';
    const WHERE_ORDER_GROUP = " where school like $school group by name, school";

    function createObject(description, sql) {
        return {
            "description": description,
            "sql": sql
        }
    }
    
    function careerSumQuery(description, stat, header, table) {
        return createObject(description,
            `${CAREER_SELECT}, sum(${stat}) as "${header}" from ${table} ${WHERE_ORDER_GROUP} order by sum(${stat}) desc` 
        )
    }

    const scoringGoals = careerSumQuery("Career Goals", "goals", "Goals", "scoring");
    const scoringAssists = careerSumQuery("Career Assists", "assists", "Assists", "scoring");

    const savePct = 'printf("%.3f", cast(sum(saves) as float) / cast(sum(goals_against) + sum(saves) as float))';
    const goalieSavePct = createObject("Career Goalie Save% (> 600 min.)", `${CAREER_SELECT}, sum(minutes) as "Minutes", ${savePct} AS "Save%" from goalie ${WHERE_ORDER_GROUP} having sum(minutes) > 600 order by ${savePct} desc`)

    const earnedRunAvg = 'printf("%.3f",(sum(earned_runs) / sum(innings_pitched)) * 7)';

    return {
      "baseball_softball": [
        careerSumQuery("Career Homers", "homers", "Homers", "hitting_1"),
        careerSumQuery("Career RBIs", "rbis", "RBIs", "hitting_1"),
        careerSumQuery("Career Total Bases", "total_bases", "Total Bases", "hitting_2"),
        careerSumQuery("Career Stolen Bases", "stolen_bases", "Stolen Bases", "hitting_2"),
        createObject("Career ERA (> 35 IP)", `${CAREER_SELECT}, ${earnedRunAvg} as "ERA" from pitching_1 ${WHERE_ORDER_GROUP} having sum(innings_pitched) > 35 order by ${earnedRunAvg} asc`)
     ],
      "basketball": [ 
        careerSumQuery("Career Points", "points", "Points", "offense"),
        careerSumQuery("Career Rebounds", "rebounds", "Rebounds", "defense"),
        careerSumQuery("Career Blocks", "blocks", "Blocks", "defense")
    ],
    "fieldhockey": [
        scoringGoals,
        scoringAssists,
        goalieSavePct
    ],
    "football": [
        careerSumQuery("Career Passing Yards", "yards", "Yards", "passing"),
        careerSumQuery("Career Passing TDs", "touchdowns", "TDs", "passing"),
        careerSumQuery("Career Rushing Yards", "yards", "Yards", "rushing"),
        careerSumQuery("Career Rushing TDs", "touchdowns", "TDs", "rushing"),
        careerSumQuery("Career Receiving Yards", "yards", "Yards", "receiving"),
        careerSumQuery("Career Receiving TDs", "touchdowns", "TDs", "receiving"),
        careerSumQuery("Career Tackles", "tackles", "Tackles", "defense"),
        careerSumQuery("Career Sacks", "sacks", "Sacks", "defense"),
        careerSumQuery("Career Fumble Recs.", "fumble_recoveries", "Fumble Recs.", "defense"),
        careerSumQuery("Career Ints.", "interceptions", "Ints.", "defense"),
    ],
    "hockey": [
        scoringGoals,
        scoringAssists,
        goalieSavePct
    ],
    "lacrosse": [
        scoringGoals,
        scoringAssists,
        goalieSavePct
    ],
    "soccer": [
        scoringGoals,
        scoringAssists,
        goalieSavePct
    ],
    "volleyball": [ 
        careerSumQuery("Career Kills", "kills", "Kills", "offense"),
        careerSumQuery("Career Assists", "assists", "Assists", "offense"),
        careerSumQuery("Career Blocks", "blocks", "Blocks", "blocking"),
        careerSumQuery("Career Solo Blocks", "solo_blocks", "Solo Blocks", "blocking"),
        careerSumQuery("Career Digs", "dig_attempts - dig_errors", "Digs", "defense"),
        careerSumQuery("Career Aces", "aces", "Aces", "serving"),
    ],
    "waterpolo": [
        scoringGoals,
        scoringAssists,
        goalieSavePct
    ]
  };
})();
