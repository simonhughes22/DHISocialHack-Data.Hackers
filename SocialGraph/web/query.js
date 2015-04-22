function createQueryHandler(){

    function sqlQuery(qry, processResult){
        var encodedQry = encodeURIComponent(qry);
        $.ajax({
             url: "http://localhost:2480/query/Hackathon/sql/" + encodedQry,
             type: "GET",
             beforeSend: function(xhr){
                 //xhr.setRequestHeader('Accept-Encoding', 'gzip,deflate');
                 xhr.setRequestHeader('Authorization',   'Basic YWRtaW46YWRtaW4=');
             },
             success: function(data, textStatus, jqXHR){
                var result = data.result;
                processResult(result); 
             },
             contentType : "application/json"
        });   
    }

    function searchSeekers(searchString, processResult){
        var searchString = searchString.trim();
        if(searchString.trim().length == 0){
            var searchQuery = "select from (select *, in('Contributor').size() as inCnt, out('Contributor').size() as outCnt, both('Contributor').size() as count "
                        + "from Seeker) order by has_meetup_account desc, has_gh_account desc, count desc limit 15";
        }
        else{
            var searchQuery = "select from (select *, in('Contributor').size() as inCnt, out('Contributor').size() as outCnt, both('Contributor').size() as count "
                            + "from Seeker where login = '" + searchString 
                            + "' or full_name like '%" + searchString + "%') order by has_meetup_account desc, has_gh_account desc, count desc limit 15";
        }
        sqlQuery(searchQuery, processResult);
    }

    function getGitHubConnections(seeker, processResults){
        //TODO select from @RID - it's faster
        var inQ = "select outV().@rid as @rid, outV().languages as languages, outV().person_id as person_id, outV().login as login, outV().full_name as full_name, count from (select expand(inE('Contributor')) " + 
            "from Seeker where login = '" + 
            seeker.login + "' ) order by has_meetup_account desc, has_gh_account desc, count desc limit 5";

        var outQ = "select inV().@rid as @rid, inV().languages as languages, inV().person_id as person_id, inV().login as login, inV().full_name as full_name, count from (select expand(outE('Contributor')) " + 
            "from Seeker where login = '" + 
            seeker.login + "' ) order by has_meetup_account desc, has_gh_account desc, count desc limit 5";

        sqlQuery(inQ, function(inResult){    
            sqlQuery(outQ, function(outResult){
                processResults(inResult, outResult, seeker);
            });
        });
    }
    function getTopSkills(processResults){
        var qry = "select name as language, count, @rid as @rid from Language order by count desc limit -1";
        sqlQuery(qry, processResults);
    }
    
    function getSkillConnections(skill, processResults){
        //TODO select from @RID - it's faster
        var qry = "select outV().@rid as @rid, outV().languages as languages, outV().person_id as person_id, outV().login as login, outV().full_name as full_name, count from " +
                    "(select expand(inE('SeekerLanguage')) from Language where name ='" + skill.language + "') order by has_meetup_account desc, has_gh_account desc, count desc limit 10";

        sqlQuery(qry, function(result){
            processResults(result, skill);            
        });
    }
    
    function getMeetupConnections(seeker, processResults){
        //TODO select from @RID - it's faster
        var qry = "select inV().@rid as @rid, inV().id as id, inV().name as name, inV().desc as desc, count " + 
            "from (select expand(outE('Member')) from Seeker where person_id = '" + 
            seeker.person_id + "') order by has_meetup_account desc, has_gh_account desc, count desc limit 5";

        sqlQuery(qry, function(result){
            processResults(result, seeker);            
        });
    }
    
    function getSeekersFromMeetup(meetup, processResults){
        var qry = "select outV().@rid as @rid, outV().languages as languages, outV().person_id as person_id, outV().login as login, outV().full_name as full_name, count " +
            "from (select expand(inE('Member')) from Meetup where id = " + meetup.id + ") limit 10";
        
        sqlQuery(qry, function(result){        
            processResults(result, meetup);            
        });        
    }
    
    function getAllConnections(seeker, processResults){
        function processGh(inGh, outGh, _){
            function processMeetup(inMeetup, _){
                processResults(inGh, outGh, inMeetup, seeker);
            }
            getMeetupConnections(seeker, processMeetup);
        }
        getGitHubConnections(seeker, processGh);
    }
    
    return {
        getAllConnections:      getAllConnections,
        getTopSkills  :         getTopSkills,
        searchSeekers :         searchSeekers,
        getSkillConnections:    getSkillConnections,
        getMeetupConnections:   getMeetupConnections,
        getSeekersFromMeetup:   getSeekersFromMeetup
    }
}