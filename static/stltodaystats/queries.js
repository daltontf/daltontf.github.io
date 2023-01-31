(function() {

    const CAREER_SELECT = 'select name as "Name", school as "School", max(season) as "Final Season"';
    const SEASON_SELECT = 'select name as "Name", school as "School", season as "Season"';
    const WHERE_LIKE_SCHOOL = " where school = $school";
    const GROUP_BY_NAME_SCHOOL = " group by name, school";
    const GROUP_BY_NAME_SCHOOL_SEASON = ` ${GROUP_BY_NAME_SCHOOL}, season`; 

    function createObject(description, sql) {
        return {
            "description": description,
            "sql": sql
        }
    }

    function bestSeasonQuery(description, stat, header, table) {
          return createObject(description,
            `${SEASON_SELECT}, ${stat} as "${header}" from ${table} ${WHERE_LIKE_SCHOOL} and ${stat} > 0 ${GROUP_BY_NAME_SCHOOL_SEASON} order by ${stat} desc`)
    }
    
    function careerSumQuery(description, stat, header, table) {
        return createObject(description,
            `${CAREER_SELECT}, sum(${stat}) as "${header}" from ${table} ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(${stat}) > 0 order by sum(${stat}) desc`)
    }

    const careerGoalsFromScoring = careerSumQuery("Career Goals", "goals", "Goals", "scoring");
    const careerAssistsFromScoring = careerSumQuery("Career Assists", "assists", "Assists", "scoring");

    const savePct = 'printf("%.3f", cast(sum(saves) as float) / cast(sum(goals_against) + sum(saves) as float))';
    const careerGoalieSavePct = createObject("Career Goalie Save% (> 600 min.)",
     `${CAREER_SELECT}, sum(minutes) as "Minutes", ${savePct} AS "Save%" from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(minutes) > 600 order by ${savePct} desc`);
      
    const seasonGoalsFromScoring = bestSeasonQuery("Season Goals", "goals", "Goals", "scoring");
    const seasonAssistsFromScoring = bestSeasonQuery("Season Assists", "assists", "Assists", "scoring");
    const seasonGoalieSavePct = createObject("Season Goalie Save% (> 600 min.)",
     `${SEASON_SELECT}, sum(minutes) as "Minutes", ${savePct} AS "Save%" from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(minutes) > 600 order by ${savePct} desc`);

    const battingAvg = 'printf("%.3f",cast(sum(singles) + sum(doubles) + sum(triples) + sum(homers) as float) / cast(sum(at_bats) as float))';
    const earnedRunAvg = 'printf("%.2f",(sum(earned_runs) / sum(innings_pitched)) * 7)';

    const threePtPct = 'printf("%.3f", cast(sum(three_point_shots) as float) / cast(sum(three_point_attempts) as float))';
    const freeThrowPct = 'printf("%.3f", cast(sum(free_throws) as float) / cast(sum(free_throw_attempts) as float))';
   
    const serveRcvPct = 'printf("%.3f", cast((sum(serves_received) - sum(serve_receive_errors)) as float) / cast(sum(serves_received) as float))';
    const digsPerGame = 'printf("%.3f", cast((sum(dig_attempts) - sum(dig_errors)) as float) / cast(sum(games_played) as float))';

    return {
      "baseball_softball": [
        careerSumQuery("Career Homers", "homers", "Homers", "hitting_1"),
        careerSumQuery("Career RBIs", "rbis", "RBIs", "hitting_1"),
        careerSumQuery("Career Total Bases", "total_bases", "Total Bases", "hitting_2"),
        createObject("Career Batting Avg. (60+ AB)",
         `${CAREER_SELECT}, sum(singles) + sum(doubles) + sum(triples) + sum(homers) as "Hits", sum(at_bats) as "At Bats", ${battingAvg} as "Average" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(at_bats) >= 60 order by ${battingAvg} desc`),
        careerSumQuery("Career Stolen Bases", "stolen_bases", "Stolen Bases", "hitting_2"),
        careerSumQuery("Career Strikeouts", "strike_outs", "Strike Outs", "pitching_2"),
        createObject("Career ERA (60+ IP)",
         `${CAREER_SELECT}, printf("%.1f", sum(innings_pitched)) as "Innings", sum(earned_runs) as "Earned Runs", ${earnedRunAvg} as "ERA" from pitching_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(innings_pitched) >= 60 order by ${earnedRunAvg} asc`),
        bestSeasonQuery("Season Homers", "homers", "Homers", "hitting_1"),
        bestSeasonQuery("Season RBIs", "rbis", "RBIs", "hitting_1"),
        bestSeasonQuery("Season Total Bases", "total_bases", "Total Bases", "hitting_2"),
        createObject("Season Batting Avg. (35+ AB)",
         `${SEASON_SELECT}, sum(singles) + sum(doubles) + sum(triples) + sum(homers) as "Hits", sum(at_bats) as "At Bats", ${battingAvg} as "Average" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(at_bats) >= 35 order by ${battingAvg} desc`),
        bestSeasonQuery("Season Stolen Bases", "stolen_bases", "Stolen Bases", "hitting_2"),
        bestSeasonQuery("Season Strikeouts", "strike_outs", "Strike Outs", "pitching_2"),
        createObject("Season ERA (35+ IP)",
         `${SEASON_SELECT}, printf("%.1f", sum(innings_pitched)) as "Innings", sum(earned_runs) as "Earned Runs", ${earnedRunAvg} as "ERA" from pitching_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(innings_pitched) >= 35 order by ${earnedRunAvg} asc`)
     ],
      "basketball": [ 
        careerSumQuery("Career Points", "points", "Points", "offense"),
        careerSumQuery("Career Rebounds", "rebounds", "Rebounds", "defense"),
        careerSumQuery("Career Assists", "assists", "Assists", "defense"),
        careerSumQuery("Career 3s", "three_point_shots", "3s", "offense"),
        //createObject("Career 3 Pt% (>= 25 shots)",
        // TODO Some schools only had 3 pts made and zero for attempts and later correct. 
        // Need better solution than throwing out > 1.0. Could end up less <= 1.0, but skewed
        // `${CAREER_SELECT}, ${threePtPct} as "3 Pt%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(three_point_attempts) >= 25 and sum(three_point_attempts) >= sum(three_point_shots) order by ${threePtPct} desc`),
        createObject("Career Free Throw% (50+ FTs)",
         `${CAREER_SELECT}, sum(free_throws) as "Throws Made", sum(free_throw_attempts) as "Attempts", ${freeThrowPct} as "Free Throw%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(free_throw_attempts) >= 50 order by ${freeThrowPct} desc`),
        careerSumQuery("Career Blocks", "blocks", "Blocks", "defense"),
        careerSumQuery("Career Steals", "steals", "Steals", "defense"),
        bestSeasonQuery("Season Points", "points", "Points", "offense"),
        bestSeasonQuery("Season Assists", "assists", "Assists", "defense"),
        bestSeasonQuery("Season 3's", "three_point_shots", "3's", "offense"),
        //createObject("Season 3 Pt% (>= 25 shots)",
        // `${SEASON_SELECT}, ${threePtPct} as "3 Pt%" from offense ${WHERE_LIKE_SCHOOL} and three_point_attempts > 0 ${GROUP_BY_NAME_SCHOOL_SEASON} having sum(three_point_attempts) >= 25 and sum(three_point_attempts) >= sum(three_point_shots) order by ${threePtPct} desc`),
        createObject("Season Free Throw% (50+ FTs)",
         `${SEASON_SELECT}, sum(free_throws) as "Throws Made", sum(free_throw_attempts) as "Attempts", ${freeThrowPct} as "Free Throw%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(free_throw_attempts) >= 50 order by ${freeThrowPct} desc`),
        bestSeasonQuery("Season Rebounds", "rebounds", "Rebounds", "defense"),
        bestSeasonQuery("Season Blocks", "blocks", "Blocks", "defense"),      
    ],
    "fieldhockey": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        careerGoalieSavePct,
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
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
        bestSeasonQuery("Season Passing Yards", "yards", "Yards", "passing"),
        bestSeasonQuery("Season Passing TDs", "touchdowns", "TDs", "passing"),
        bestSeasonQuery("Season Rushing Yards", "yards", "Yards", "rushing"),
        bestSeasonQuery("Season Rushing TDs", "touchdowns", "TDs", "rushing"),
        bestSeasonQuery("Season Receiving Yards", "yards", "Yards", "receiving"),
        bestSeasonQuery("Season Receiving TDs", "touchdowns", "TDs", "receiving"),
        bestSeasonQuery("Season Tackles", "tackles", "Tackles", "defense"),
        bestSeasonQuery("Season Sacks", "sacks", "Sacks", "defense"),
        bestSeasonQuery("Season Fumble Recs.", "fumble_recoveries", "Fumble Recs.", "defense"),
        bestSeasonQuery("Season Ints.", "interceptions", "Ints.", "defense"),
    ],
    "hockey": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        careerGoalieSavePct,
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
    ],
    "lacrosse": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        careerGoalieSavePct,
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
    ],
    "soccer": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        careerGoalieSavePct,
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
    ],
    "volleyball": [ 
        careerSumQuery("Career Kills", "kills", "Kills", "offense"),
        careerSumQuery("Career Assists", "assists", "Assists", "offense"),
        careerSumQuery("Career Blocks", "blocks", "Blocks", "blocking"),
        careerSumQuery("Career Solo Blocks", "solo_blocks", "Solo Blocks", "blocking"),
        careerSumQuery("Career Digs", "dig_attempts - dig_errors", "Digs", "defense"),
        createObject("Career Digs/Set (80+ sets)",
            `${CAREER_SELECT}, sum(dig_attempts) - sum(dig_errors) as "Digs", sum(games_played) as "Sets", ${digsPerGame} AS "Digs/Set" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 80 order by ${digsPerGame} desc`),
        careerSumQuery("Career Aces", "aces", "Aces", "serving"),
        createObject("Career Receive% (160+ serves)",
            `${CAREER_SELECT}, sum(serves_received) as "Received", sum(serve_receive_errors) as "Errors", ${serveRcvPct} AS "Receive%" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(serves_received) >= 160 order by ${serveRcvPct} desc`),
        bestSeasonQuery("Season Kills", "kills", "Kills", "offense"),
        bestSeasonQuery("Season Assists", "assists", "Assists", "offense"),
        bestSeasonQuery("Season Blocks", "blocks", "Blocks", "blocking"),
        bestSeasonQuery("Season Solo Blocks", "solo_blocks", "Solo Blocks", "blocking"),
        bestSeasonQuery("Season Digs", "dig_attempts - dig_errors", "Digs", "defense"),
        createObject("Season Digs/Set (55+ sets)",
            `${SEASON_SELECT}, sum(dig_attempts) - sum(dig_errors) as "Digs", sum(games_played) as "Sets", ${digsPerGame} AS "Digs/Set" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 55 order by ${digsPerGame} desc`),
        bestSeasonQuery("Season Aces", "aces", "Aces", "serving"),
        createObject("Season Receive% (113+ serves)",
            `${SEASON_SELECT}, sum(serves_received) as "Received", sum(serve_receive_errors) as "Errors", ${serveRcvPct} AS "Receive%" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(serves_received) >= 113 order by ${serveRcvPct} desc`),
        
    ],
    "waterpolo": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        careerGoalieSavePct,
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
    ]
  };
})();