// ensure a console object to prevent countless checks if not there
if(!window.console){
    console = {
        log : function(s){}
    }
    window.console = console;
}

$(document).ready(function(){

    var queryHandler = createQueryHandler();
    var graphController = createGraphController(queryHandler);
    
    var vm = createViewModel(graphController, queryHandler);
    ko.applyBindings(vm);
    
    graphController.setViewModel(vm);
    
    $("#txtSearch").keyup(function(event){
        if(event.keyCode == 13){
            $("#btnSearch").click();
        }
    });
    $("#searchResults").hide();
    
    vm.loadingSkills(true);
    queryHandler.getTopSkills(function(results){
        vm.topSkills(results);
        // shallow copy
        vm.allSkills(results.slice(0,results.length));
        vm.loadingSkills(false);
    });
    $("#btnSearch").click();
});