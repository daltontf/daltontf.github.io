+++
title = "The (Adjusted) Schneid"
weight = 0
+++

Being a sports fan, I’ve consumed a lot of sports commentary. One concept I stumbled on is the “Sports Misery Index”. Which is the relative “pain” a sports fan experiences rooting for a team or a set of teams in a given market. I thought to myself, wouldn’t it be interesting if we can come up with a mathematical formula to come up with such a number. All this is of course would be done tongue in cheek. Such a thing would be very subjective, weighing poor performance versus heartbreak, etc.

One datapoint for such an index would be a measure of how long has it been since a team won the championship in its league. No two championship droughts are the same given that leagues can vary in size. The NHL had only six teams for a long time until expanding in 1967. 

The methodology I use to “score” a drought is that teams  get 1 / (number of teams in the league) “schneid points” for every year they fail to win a championship.

Schneid points for more market driven so they are aggregated across six leagues, NFL, MLB, NBA, NHL, MLS and CFL (for Canadian markets)

 [https://docs.google.com/spreadsheets/d/e/2PACX-1vT-RPz6SEj9_6LJZIuhoT7eYK_X8yx5FwQltqKacAYJ9TY-qbm_u-GyHI1ngKstRfArV2yO8baK0mHK/pubhtml](https://docs.google.com/spreadsheets/d/e/2PACX-1vT-RPz6SEj9_6LJZIuhoT7eYK_X8yx5FwQltqKacAYJ9TY-qbm_u-GyHI1ngKstRfArV2yO8baK0mHK/pubhtml)


Things to be aware of:

The starting points of schneids are by when I thought the league reached a certain threshold of significance. Any active droughts at that are tracked to the beginning. The start year is just the time where any preceded drought are not calculated.


|League|Start|Comments|
|:-|:-|:-|
|NFL|1966|The Super Bowl era since there is a singular champion at this point Prior to this the AFL is treated as a different league like the ABA or WHA. Any droughts from NFL are carried over.|
|MLB|1903|Founding of MLB and first World Series. Prior to this the NL and AL are both treated as “other” leagues.|
|NBA|1967|League reached 10 teams.|
|NHL|1959|BAA-NBL Merger to form NBA|
|MLS|1996|League founded.|

- When a championship is not played due to strike, layout or someother reason, the team is not counted that year. 

- Markets with multiple teams in the same league have likely less meaningful aggregates since it would assume that fans are equally invested in both teams.

- The “Carolina” market is treated as one large market even though the NHL Hurricanes play in Raleigh.

- When a market gets a new team via expansion it is the same as a team winning a championship, so market aggregate can go down due to an expansion team or relocation.

- When a team leaves a market the “schneid” for that team goes away unless another team ends up in that market. Should the leftover “schneid” decay? At what rate?

- Organizational schneids are yet to be tracked. Otherwise, the NFL Cardinals would have an epic one going, but since they moved twice and spread the misery around.