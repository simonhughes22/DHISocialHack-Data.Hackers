
    
function createViewModel(graphController, queryHandler){
    
    var vm = null;
    
    function updateSkills(){
        var seekers = graphController.getSeekers();
        var totalSkills = {};
        for(var ix = 0; ix < seekers.length; ix++){
            var seeker = seekers[ix];

            var skrSkills = $.parseJSON(seeker.languages.replace(/'/g,"\""));
            var members = getMembers(skrSkills);
            for(var j = 0; j< members.length; j++){
                var skrSkill = members[j];
                var cnt = skrSkills[skrSkill];
                if(!(skrSkill in totalSkills)){
                    totalSkills[skrSkill] = cnt;
                }
                else{
                    totalSkills[skrSkill] += cnt;
                }
            }
        }

        var topSkills = vm.allSkills();
        var newTopSkills = [];
        for(var i = 0; i<topSkills.length;i++){
            var row = topSkills[i];
            row.count = totalSkills[row.language];
            if(row.language in vm.addedSkills() || !row.count || row.count == 0){
                continue;
            }
            
            newTopSkills.push(row);
        }
        newTopSkills.sort(function(a,b){ return b.count - a.count;});
        vm.loadingSkills(true);
        vm.topSkills.removeAll();
        vm.topSkills(newTopSkills);
        vm.loadingSkills(false);
    }
    
    vm = {
		seekers           : ko.observableArray([]),
        loadingSeekers    : ko.observable(false),
        
        topSkills         : ko.observableArray([]),
        allSkills         : ko.observableArray([]),
        
        loadingSkills     : ko.observable(false),
        
        addedSkills       : ko.observable({}),
        
        nodeClicked       : function(){
            updateSkills();
        },
        onSearchClick     : function(){
            var searchString = $("#txtSearch").val();
            
            queryHandler.searchSeekers(searchString, function(result){
                vm.loadingSeekers(true);
                vm.seekers(result);
                vm.loadingSeekers(false);
                $("#searchResults").slideDown("slow");
            });
        },
        
        onSeekerClick      : function(data){
            // ko triggers this when the html is updated
            if(vm.loadingSeekers() || vm.loadingSkills()){
                return;
            }
            // clear skills hashset
            vm.addedSkills({});
            
            queryHandler.getAllConnections(data, function(inGh, outGh, inMeetup, data){
                var inMerged = concatenate(inGh, inMeetup);
                graphController.initializeGraph(inMerged, outGh, data);
            });
            $("#searchResults").slideUp("slow");
        },
        
        onAddSkillClick      : function(skill){
            // ko triggers this when the html is updated
            if(vm.loadingSeekers() || vm.loadingSkills()){
                return;
            }
            vm.addedSkills()[skill.language] = true;
            
            if(graphController.nodeCount() == 0){
                queryHandler.getSkillConnections(skill, function(result){
                    graphController.initializeGraph(result, null, skill);
                });
                $("#searchResults").slideUp("slow");
            }
            else{
                graphController.addNewSkill(skill);
                updateSkills();
            }
        }
    }
    
    return vm;
}