+++
title = "Market Aggregate Head to Head Totals"
weight = 0
+++

The idea started in 2023 when I was watching St. Louis CITY SC play its first MLS match vs the Portland Timbers. I was wondering to myself if this was the first time that a professional sports team from St. Louis had ever faced a team from Portland. Portland only has an NBA team and St. Louis hasn't had an NBA team since 1968.Maybe teams played previously in what is a now defunct league?[^1] 

I had become familiar with the ESPN API when writing my "roScore" Roku App" <https://github.com/daltontf/roScore> and developed scripts to storing such data in MySQL database. Over time I had to find other sources of older and more obscure results like <https://retrosheet.org/>, <https://www.hockeydb.com> and sometimes just copying out of Wikipedia. 

Here is the link to the page:

<https://daltontf.github.io/market_head2head.html>

One can include anchors in the URL to directly display two markets:

<https://daltontf.github.io/market_head2head.html#KCvSTL>

Notes:

- This is a side-project and so there are limits due to the simplicity of the approach to associating teams with markets. What market a team represents is based on the name. Some markets are "sub-markets" and team names may have the name of the larger market:

  - The Golden State Warriors are considered to be a San Francisco team despite playing in Oakland for a while. 
  - The Angels of the MLB have been based in Anaheim since 1966, but have only incorporated "Anaheim" in the the name from 1997 to 2015. 
  
  Update: Since the Angels have been in Anaheim their entire existence including when they were the "Los Angeles Angels", it is now excluded from being a "Los Angeles" team and is associated with Anaheim.

- What leagues are included don't follow a specific criteria. 
If a league had enough markets that are now "major" markets and there was results to be found, it was considered for inclusion. Attendance and whether the league is "national" in nature (spanning time zones) also makes a league more "major" than others.

  - Initially only five sports (football, baseball, basketball, hockey and soccer) plus "derivatives" (i.e. arena football or indoor soccer) are included. Recently sports like lacrosse, rugby and volleyball have been added.



Known Data Gaps:
   - Currently, the "Original Six" era of the NHL has yet to be added. One can make a case that the league wasn't "national" enough, but it will eventually get added.
   - The International Hockey League had some large markets particularly in the '90s. I couldn't find "scrape-able" data before 1995.
   - I only have Negro Leagues data from 1939-1948



  
[^1]: Turns out that the St. Louis Stars of the North American Soccer League had played against earlier incarnation of the Timbers.

  
