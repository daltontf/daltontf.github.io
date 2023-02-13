(function() {

    const CAREER_SELECT = 'select name as "Name", school as "School", max(season) as "Last Season"';
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

    function bestSeasonQuery(description, columnHeaders, table) {
        let statColumn = columnHeaders[columnHeaders.length - 1].column;
        let columnString = columnHeaders.map(it => {
            return `${it.column} as "${it.header}"`
        }).join(',');
        return createObject(description,
          `${SEASON_SELECT}, ${columnString} from ${table} ${WHERE_LIKE_SCHOOL} and ${statColumn} > 0 ${GROUP_BY_NAME_SCHOOL_SEASON} order by ${statColumn} desc`)
    }

    function careerSumQuery(description, columnHeaders, table) {
        let statColumn = columnHeaders[columnHeaders.length - 1].column;
        let columnString = columnHeaders.map(it => {
            return `sum(${it.column}) as "${it.header}"`
        }).join(',');
        return createObject(description,
            `${CAREER_SELECT}, ${columnString} from ${table} ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(${statColumn}) > 0 order by sum(${statColumn}) desc`)
    }

    function careerGoalsAgainstAvg(minutesInGame, minMinutes) {
        let goalsAgainstAvg = `cast(cast(sum(goals_against) as float) / cast(sum(minutes) as float) as float) * ${minutesInGame}`
        return createObject(`Career Goals Against Avg. (${minMinutes}+ min.)`,
            `${CAREER_SELECT}, sum(goals_against) as "Goals Against", sum(minutes) as "Minutes", printf("%.3f", ${goalsAgainstAvg}) AS "Goal Against Avg." from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(minutes) >= ${minMinutes} order by ${goalsAgainstAvg} asc`);
    }

    function seasonGoalsAgainstAvg(minutesInGame, minMinutes) {
        let goalsAgainstAvg = `cast(cast(goals_against as float) / cast(minutes as float) as float) * ${minutesInGame}`
        return createObject(`Season Goals Against Avg. (${minMinutes}+ min.)`,
            `${SEASON_SELECT}, sum(goals_against) as "Goals Against", sum(minutes) as "Minutes", printf("%.3f", ${goalsAgainstAvg}) AS "Goal Against Avg." from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(minutes) >= ${minMinutes} order by ${goalsAgainstAvg} asc`);
    }

    const careerGoalsFromScoring = careerSumQuery("Career Goals",[{ "column": "goals", "header": "Goals" }], "scoring");
    const careerAssistsFromScoring = careerSumQuery("Career Assists",[{ "column": "assists", "header": "Assists" }], "scoring");
    const career1PtGoalPtsFromScoring = careerSumQuery("Career Points", [
        {"column":"goals", "header": "Goals"},
        {"column":"assists", "header": "Assists"},
        {"column":"goals + assists", "header": "Points"}
        ], "scoring");
    const career2PtGoalPtsFromScoring = careerSumQuery("Career Points", [
        {"column":"goals", "header": "Goals"},
        {"column":"assists", "header": "Assists"},
        {"column":"goals * 2 + assists", "header": "Points"}
        ], "scoring");
    const savePct = 'cast(sum(saves) as float) / cast(sum(goals_against) + sum(saves) as float)';
    const careerGoalieSavePct = createObject("Career Goalie Save% (> 600 min.)",
     `${CAREER_SELECT}, sum(saves) as "Saves", sum(goals_against) as "Goal Against", printf("%.3f", ${savePct}) AS "Save%" from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(minutes) > 600 order by ${savePct} desc`);
      
    const seasonGoalsFromScoring = bestSeasonQuery("Season Goals",[{ "column": "goals", "header": "Goals" }], "scoring");
    const seasonAssistsFromScoring = bestSeasonQuery("Season Assists",[{ "column": "assists", "header": "Assists" }], "scoring");
    const season1PtGoalPtsFromScoring = bestSeasonQuery("Season Points", [
            {"column":"goals", "header": "Goals"},
            {"column":"assists", "header": "Assists"},
            {"column":"goals + assists", "header": "Points"}
            ], "scoring");
    const season2PtGoalPtsFromScoring = bestSeasonQuery("Season Points", [
            {"column":"goals", "header": "Goals"},
            {"column":"assists", "header": "Assists"},
            {"column":"goals * 2 + assists", "header": "Points"}
            ], "scoring");
    const seasonGoalieSavePct = createObject("Season Goalie Save% (600+ min.)",
     `${SEASON_SELECT}, sum(saves) as "Saves", sum(goals_against) as "Goals Against", printf("%.3f", ${savePct}) AS "Save%" from goalie ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(minutes) >= 600 order by ${savePct} desc`);

    //baseball
    const sluggingBases = "sum(singles) + sum(doubles) * 2 + sum(triples) * 3 + sum(homers) * 4" ;
    const battingAvg = 'cast(sum(singles) + sum(doubles) + sum(triples) + sum(homers) as float) / cast(sum(at_bats) as float)';
    const sluggingPct = `cast(${sluggingBases} as float) / cast(sum(at_bats) as float)`;
    const earnedRunAvg = '(sum(earned_runs) / sum(innings_pitched) * 7)';
    const strikeOutToWalks = 'sum(strike_outs) / sum(walks)';

    //basketball
    const ptsPerGame = 'cast(sum(points) as float) / cast(sum(games_played) as float)';
    const assistsPerGame = 'cast(sum(assists) as float) / cast(sum(games_played) as float)';
    const threePtPct = 'cast(sum(three_point_shots) as float) / cast(sum(three_point_attempts) as float) * 100';
    const freeThrowPct = 'cast(sum(free_throws) as float) / cast(sum(free_throw_attempts) as float) * 100';
    const rbsPerGame = 'cast(sum(rebounds) as float) / cast(sum(games_played) as float)';

    //football
    const yardsPerCarry = 'cast(sum(yards) as float) / cast(sum(carries) as float)';

    //volleyball
    const serveRcvPct = 'cast((sum(serves_received) - sum(serve_receive_errors)) as float) / cast(sum(serves_received) as float)';
    const killsPerGame = 'cast(sum(kills) as float) / cast(sum(games_played) as float)';
    const assistsPerGameVB = 'cast(sum(assists) as float) / cast(sum(games_played) as float)';
    const digsPerGame = 'cast((sum(dig_attempts) - sum(dig_errors)) as float) / cast(sum(games_played) as float)';

    return {
      "baseball_softball": [
        careerSumQuery("Career Homers", [
            { "column": "at_bats", "header": "At Bats" },
            { "column": "homers", "header": "Homers" }
            ], "hitting_1"),
        careerSumQuery("Career RBIs",[{ "column": "rbis", "header": "RBIs" }], "hitting_1"),
        careerSumQuery("Career Total Bases",[{ "column": "total_bases", "header": "Total Bases"}], "hitting_2"),
        careerSumQuery("Career Hits", [
                    { "column": "at_bats", "header": "At Bats" },
                    { "column": "singles + doubles + triples + homers", "header": "Hits" }
                    ], "hitting_1"),
        createObject("Career Batting Avg. (60+ AB)",
         `${CAREER_SELECT}, sum(singles) + sum(doubles) + sum(triples) + sum(homers) as "Hits", sum(at_bats) as "At Bats", printf("%.3f",${battingAvg}) as "Average" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(at_bats) >= 60 order by ${battingAvg} desc`),
        createObject("Career Slugging%. (60+ AB)",
         `${CAREER_SELECT}, ${sluggingBases} as "Bases", sum(at_bats) as "At Bats", printf("%.3f",${sluggingPct}) as "Slugging%" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(at_bats) >= 60 order by ${sluggingPct} desc`),
        careerSumQuery("Career Stolen Bases",[{ "column": "stolen_bases", "header": "Stolen Bases"}], "hitting_2"),
        careerSumQuery("Career Wins",[{ "column": "wins", "header": "Wins"}], "pitching_1"),
        careerSumQuery("Career Strikeouts",[{ "column": "strike_outs", "header": "Strike Outs"}], "pitching_2"),
//        createObject("Career Strikeout to Walks Ratio (25+ IP)", TODO inning_pitched in pitching_1 would require JOIN
//         `${CAREER_SELECT}, sum(strike_outs) as "Strikeouts", sum(walks) as "Walks", printf("%.2f",${strikeOutToWalks}) as "Ratio" from pitching_2 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(innings_pitched) >= 25 order by ${strikeOutToWalks} asc`),
//        careerSumQuery("Career Saves",[{ "column": "saves", "header": "Saves"}], "pitching_1"), TODO Need to scrape saves!
        createObject("Career ERA (60+ IP)",
         `${CAREER_SELECT}, printf("%.1f", sum(innings_pitched)) as "Innings", sum(earned_runs) as "Earned Runs", printf("%.2f",${earnedRunAvg}) as "ERA" from pitching_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(innings_pitched) >= 60 order by ${earnedRunAvg} asc`),
        bestSeasonQuery("Season Homers",[{ "column": "homers", "header": "Homers"}], "hitting_1"),
        bestSeasonQuery("Season RBIs",[{ "column": "rbis", "header": "RBIs"}], "hitting_1"),
        bestSeasonQuery("Season Total Bases",[{ "column": "total_bases", "header": "Total Bases"}], "hitting_2"),
        createObject("Season Batting Avg. (35+ AB)",
         `${SEASON_SELECT}, sum(singles) + sum(doubles) + sum(triples) + sum(homers) as "Hits", sum(at_bats) as "At Bats", printf("%.3f",${battingAvg}) as "Average" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(at_bats) >= 35 order by ${battingAvg} desc`),
        createObject("Season Slugging%. (35+ AB)",
         `${SEASON_SELECT}, ${sluggingBases} as "Bases", sum(at_bats) as "At Bats", printf("%.3f",${sluggingPct}) as "Slugging%" from hitting_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(at_bats) >= 35 order by ${sluggingPct} desc`),
        bestSeasonQuery("Season Stolen Bases",[{ "column": "stolen_bases", "header": "Stolen Bases"}], "hitting_2"),
        bestSeasonQuery("Season Strikeouts",[{ "column": "strike_outs", "header": "Strike Outs"}], "pitching_2"),
//        createObject("Season Strikeout to Walks Ratio (15+ IP)",
//         `${SEASON_SELECT}, sum(strike_outs) as "Strikeouts", sum(walks) as "Walks", printf("%.2f",${strikeOutToWalks}) as "Ratio" from pitching_2 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(innings_pitched) >= 15 order by ${strikeOutToWalks} asc`),
//        bestSeasonQuery("Season Saves",[{ "column": "saves", "header": "Saves"}], "pitching_1"),
        createObject("Season ERA (35+ IP)",
         `${SEASON_SELECT}, printf("%.1f", sum(innings_pitched)) as "Innings", sum(earned_runs) as "Earned Runs", printf("%.2f",${earnedRunAvg}) as "ERA" from pitching_1 ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(innings_pitched) >= 35 order by ${earnedRunAvg} asc`)
     ],
      "basketball": [ 
        careerSumQuery("Career Points",[{ "column": "points", "header": "Points"}], "offense"),
        createObject("Career Points/Game (30+ games)",
            `${CAREER_SELECT}, sum(points) as "Points", sum(games_played) as "Games", printf("%.2f", ${ptsPerGame}) AS "Points/Game" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 30 order by ${ptsPerGame} desc`),
        careerSumQuery("Career Rebounds",[{ "column": "rebounds", "header": "Rebounds"}], "defense"),
        createObject("Career Rebounds/Game (30+ games)",
            `${CAREER_SELECT}, sum(rebounds) as "Rebounds", sum(games_played) as "Games", printf("%.2f", ${rbsPerGame}) AS "Rebounds/Game" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 30 order by ${rbsPerGame} desc`),
        careerSumQuery("Career Assists",[{ "column": "assists", "header": "Assists"}], "defense"),
        createObject("Career Assists/Game (30+ games)",
            `${CAREER_SELECT}, sum(assists) as "Assists", sum(games_played) as "Games", printf("%.2f", ${assistsPerGame}) AS "Assists/Game" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 30 order by ${assistsPerGame} desc`),
        careerSumQuery("Career 3s",[{ "column": "three_point_shots", "header": "3s"}], "offense"),
        createObject("Career 3 Pt% (42+ shots)",
         `${CAREER_SELECT}, sum(three_point_shots) as "3s Made", sum(three_point_attempts) as "Attempts", printf("%.1f",${threePtPct}) as "3 Pt%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(three_point_attempts) >= 42 and sum(three_point_attempts) >= sum(three_point_shots) order by ${threePtPct} desc`),
        createObject("Career Free Throw% (65+ FTs)",
         `${CAREER_SELECT}, sum(free_throws) as "Throws Made", sum(free_throw_attempts) as "Attempts", printf("%.1f", ${freeThrowPct}) as "Free Throw%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(free_throw_attempts) >= 65 order by ${freeThrowPct} desc`),
        careerSumQuery("Career Blocks",[{ "column":  "blocks", "header": "Blocks"}], "defense"),
        careerSumQuery("Career Steals",[{ "column":  "steals", "header": "Steals"}], "defense"),

        bestSeasonQuery("Season Points",[{ "column": "points", "header": "Points"}], "offense"),
        createObject("Season Points/Game (20+ games)",
         `${SEASON_SELECT}, sum(points) as "Points", sum(games_played) as "Games", printf("%.2f", ${ptsPerGame}) AS "Points/Game" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 20 order by ${ptsPerGame} desc`),
        bestSeasonQuery("Season Rebounds",[{ "column": "rebounds", "header": "Rebounds"}], "defense"),
        createObject("Season Rebounds/Game (20+ games)",
         `${SEASON_SELECT}, sum(rebounds) as "Rebounds", sum(games_played) as "Games", printf("%.2f", ${rbsPerGame}) AS "Rebounds/Game" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 20 order by ${rbsPerGame} desc`),
        bestSeasonQuery("Season Assists",[{ "column": "assists", "header": "Assists"}], "defense"),
        createObject("Season Assists/Game (20+ games)",
         `${SEASON_SELECT}, sum(assists) as "Assists", sum(games_played) as "Games", printf("%.2f", ${assistsPerGame}) AS "Assists/Game" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 20 order by ${assistsPerGame} desc`),
        bestSeasonQuery("Season 3's",[{ "column": "three_point_shots", "header": "3's"}], "offense"),
        createObject("Season 3 Pt% (25+ shots)",
         `${SEASON_SELECT}, sum(three_point_shots) as "3s Made", sum(three_point_attempts) as "Attempts", printf("%.1f", ${threePtPct}) as "3 Pt%" from offense ${WHERE_LIKE_SCHOOL} and three_point_attempts > 0 ${GROUP_BY_NAME_SCHOOL_SEASON} having sum(three_point_attempts) >= 25 and sum(three_point_attempts) >= sum(three_point_shots) order by ${threePtPct} desc`),
        createObject("Season Free Throw% (42+ FTs)",
         `${SEASON_SELECT}, sum(free_throws) as "Throws Made", sum(free_throw_attempts) as "Attempts", printf("%.1f", ${freeThrowPct}) as "Free Throw%" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(free_throw_attempts) >= 42 order by ${freeThrowPct} desc`),
        bestSeasonQuery("Season Blocks",[{ "column": "blocks", "header": "Blocks"}], "defense"),
        bestSeasonQuery("Season Steals",[{ "column": "steals", "header": "Steals"}], "defense"),
    ],
    "fieldhockey": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        career2PtGoalPtsFromScoring,
        careerGoalieSavePct,
        careerGoalsAgainstAvg(80, 1000),
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        season2PtGoalPtsFromScoring,
        seasonGoalieSavePct,
        seasonGoalsAgainstAvg(80, 645)
    ],
    "football": [
        careerSumQuery("Career Passing Yards",[{ "column": "yards", "header": "Yards"}], "passing"),
        careerSumQuery("Career Passing TDs",[{ "column": "touchdowns", "header": "TDs"}], "passing"),
        careerSumQuery("Career Rushing Yards",[{ "column": "yards", "header": "Yards"}], "rushing"),
        careerSumQuery("Career Rushing TDs",[{ "column": "touchdowns", "header": "TDs"}], "rushing"),
        careerSumQuery("Career Receiving Yards",[{ "column": "yards", "header": "Yards"}], "receiving"),
        careerSumQuery("Career Receiving TDs",[{ "column": "touchdowns", "header": "TDs"}], "receiving"),
        createObject("Career Yards/Carry (45+ Carries)",
            `${CAREER_SELECT}, sum(carries) as "Carries", sum(yards) as "Yards", printf("%.3f",${yardsPerCarry}) as "Yards/Carry" from rushing ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(carries) >= 45 order by ${yardsPerCarry} desc`),
        careerSumQuery("Career Tackles",[{ "column": "tackles", "header": "Tackles"}], "defense"),
        careerSumQuery("Career Sacks",[{ "column": "sacks", "header": "Sacks"}], "defense"),
        careerSumQuery("Career Fumble Recs.",[{ "column": "fumble_recoveries", "header": "Fumble Recs."}], "defense"),
        careerSumQuery("Career Ints.",[{ "column": "interceptions", "header": "Ints."}], "defense"),
        bestSeasonQuery("Season Passing Yards",[{ "column": "yards", "header": "Yards"}], "passing"),
        bestSeasonQuery("Season Passing TDs",[{ "column": "touchdowns", "header": "TDs"}], "passing"),
        bestSeasonQuery("Season Rushing Yards",[{ "column": "yards", "header": "Yards"}], "rushing"),
        createObject("Season Yards/Carry (30+ Carries)",
            `${SEASON_SELECT}, sum(carries) as "Carries", sum(yards) as "Yards", printf("%.3f",${yardsPerCarry}) as "Yards/Carry" from rushing ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(carries) >= 30 order by ${yardsPerCarry} desc`),
        bestSeasonQuery("Season Rushing TDs",[{ "column": "touchdowns", "header": "TDs"}], "rushing"),
        bestSeasonQuery("Season Receiving Yards",[{ "column": "yards", "header": "Yards"}], "receiving"),
        bestSeasonQuery("Season Receiving TDs",[{ "column": "touchdowns", "header": "TDs"}], "receiving"),
        bestSeasonQuery("Season Tackles",[{ "column": "tackles", "header": "Tackles"}], "defense"),
        bestSeasonQuery("Season Sacks",[{ "column": "sacks", "header": "Sacks"}], "defense"),
        bestSeasonQuery("Season Fumble Recs.",[{ "column": "fumble_recoveries", "header": "Fumble Recs."}], "defense"),
        bestSeasonQuery("Season Ints.",[{ "column": "interceptions", "header": "Ints."}], "defense"),
    ],
    "hockey": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        career1PtGoalPtsFromScoring,
        careerGoalieSavePct,
        careerGoalsAgainstAvg(45, 600),
        seasonGoalsFromScoring,
        season1PtGoalPtsFromScoring,
        seasonAssistsFromScoring,
        seasonGoalieSavePct,
        seasonGoalsAgainstAvg(45, 379)
    ],
    "lacrosse": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        career1PtGoalPtsFromScoring,
        careerGoalieSavePct,
        careerGoalsAgainstAvg(48, 650),
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        season1PtGoalPtsFromScoring,
        seasonGoalieSavePct,
        seasonGoalsAgainstAvg(48, 370)
    ],
    "soccer": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        career2PtGoalPtsFromScoring,
        careerGoalieSavePct,
        careerGoalsAgainstAvg(80, 1000),
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        season2PtGoalPtsFromScoring,
        seasonGoalieSavePct,
        seasonGoalsAgainstAvg(80, 619),
    ],
    "volleyball": [ 
        careerSumQuery("Career Kills", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "kills", "header": "Kills" }
            ],"offense"),
        createObject("Career Kills/Set (80+ sets)",
           `${CAREER_SELECT}, sum(kills) as "Kills", sum(games_played) as "Sets", printf("%.3f", ${killsPerGame}) AS "Kills/Set" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 80 order by ${killsPerGame} desc`),
        careerSumQuery("Career Assists", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "assists", "header": "Assists" }
            ], "offense"),
        createObject("Career Assists/Set (80+ sets)",
            `${CAREER_SELECT}, sum(assists) as "Assists", sum(games_played) as "Sets", printf("%.3f", ${assistsPerGameVB}) AS "Assists/Set" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 80 order by ${assistsPerGameVB} desc`),
        careerSumQuery("Career Blocks", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "blocks", "header": "Blocks" }
            ], "blocking"),
        careerSumQuery("Career Solo Blocks", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "solo_blocks", "header": "Solo Blocks" }
            ], "blocking"),
        careerSumQuery("Career Digs", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "dig_attempts - dig_errors", "header": "Digs" }
            ], "defense"),
        createObject("Career Digs/Set (80+ sets)",
            `${CAREER_SELECT}, sum(dig_attempts) - sum(dig_errors) as "Digs", sum(games_played) as "Sets", printf("%.3f", ${digsPerGame}) AS "Digs/Set" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(games_played) >= 80 order by ${digsPerGame} desc`),
        careerSumQuery("Career Aces", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "aces", "header": "Aces" }
            ], "serving"),
        createObject("Career Receive% (160+ serves)",
            `${CAREER_SELECT}, sum(serves_received) as "Received", sum(serve_receive_errors) as "Errors", printf("%.3f", ${serveRcvPct}) AS "Receive%" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL} having sum(serves_received) >= 160 order by ${serveRcvPct} desc`),
        bestSeasonQuery("Season Kills", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "kills", "header": "Kills" }
            ], "offense"),
        createObject("Season Kills/Set (55+ sets)",
           `${SEASON_SELECT}, sum(kills) as "Kills", sum(games_played) as "Sets", printf("%.3f", ${killsPerGame}) AS "Kills/Set" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 55 order by ${killsPerGame} desc`),
        bestSeasonQuery("Season Assists",[
            { "column": "games_played", "header": "Sets Played" },
            { "column": "assists", "header": "Assists" }
            ], "offense"),
        createObject("Season Assists/Set (55+ sets)",
            `${SEASON_SELECT}, sum(assists) as "Assists", sum(games_played) as "Sets", printf("%.3f", ${assistsPerGameVB}) AS "Assists/Set" from offense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 55 order by ${assistsPerGameVB} desc`),
        bestSeasonQuery("Season Blocks",[
            { "column": "games_played", "header": "Sets Played" },
            { "column": "blocks", "header": "Blocks" }
            ], "blocking"),
        bestSeasonQuery("Season Solo Blocks",[
            { "column": "games_played", "header": "Sets Played" },
            { "column": "solo_blocks", "header": "Solo Blocks" }
            ], "blocking"),
        bestSeasonQuery("Season Digs",[
            { "column": "games_played", "header": "Sets Played" },
            { "column": "dig_attempts - dig_errors", "header": "Digs" }
            ], "defense"),
        createObject("Season Digs/Set (55+ sets)",
            `${SEASON_SELECT}, sum(dig_attempts) - sum(dig_errors) as "Digs", sum(games_played) as "Sets", printf("%.3f", ${digsPerGame}) AS "Digs/Set" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(games_played) >= 55 order by ${digsPerGame} desc`),
        bestSeasonQuery("Season Aces", [
            { "column": "games_played", "header": "Sets Played" },
            { "column": "aces", "header": "Aces" }
            ], "serving"),
        createObject("Season Receive% (113+ serves)",
            `${SEASON_SELECT}, sum(serves_received) as "Received", sum(serve_receive_errors) as "Errors", printf("%.3f", ${serveRcvPct}) AS "Receive%" from defense ${WHERE_LIKE_SCHOOL}${GROUP_BY_NAME_SCHOOL_SEASON} having sum(serves_received) >= 113 order by ${serveRcvPct} desc`),
        
    ],
    "waterpolo": [
        careerGoalsFromScoring,
        careerAssistsFromScoring,
        career2PtGoalPtsFromScoring,
        careerGoalieSavePct,
        careerGoalsAgainstAvg(28, 325),
        seasonGoalsFromScoring,
        seasonAssistsFromScoring,
        season2PtGoalPtsFromScoring,
        seasonGoalieSavePct,
        seasonGoalsAgainstAvg(28, 213),
    ]
  };
})();