function createGraphController(queryHandler){
    
    var vm = null;
    var blueColor = '#0078ae';
    //var blueColor = '#555';
    var greenColor = 'rgba(152, 223, 138, 1.0)';
    var redColor = '#cc0000';
    var gray = '#555';
    
    var containerDiv = $("#container");
    var height = containerDiv.height();
    var width  = containerDiv.width();
    
    var colorScale = d3.scale.category20();
    // reserve the first color as matches blueColor
    colorScale("XXX");

    function getSeekerSkills(seeker){
        return $.parseJSON(seeker.languages.replace(/'/g,"\""));
    }
    
    function getSeekerSkillCounts(seeker){
        var skrSkills = getSeekerSkills(seeker);
        var members = getMembers(skrSkills);
        var skillCnts = [];
        for(var i=0; i<members.length; i++){
            var skill = members[i];
            var count = skrSkills[skill];
            skillCnts.push({ skill: skill, count: count });
        }
        skillCnts.sort(function(a,b){return b.count - a.count;});
        return skillCnts;
    }
    
    var s = undefined;
    var edgeCache = {};

    function setup(){
        nodeConnections = {};
        if(s){
            sigma.plugins.killTooltips(s);
            sigma.layouts.killForceAtlas2();
            s.kill();
            edgeCache = {};
        }

        sigma.renderers.def = sigma.renderers.canvas;
        //sigma.renderers.def = sigma.renderers.svg;    
        s = new sigma('container');

        // Initialize the activeState plugin:
        var activeState = sigma.plugins.activeState(s);
        var keyboard = sigma.plugins.keyboard(s, s.renderers[0]);
        // Initialize the dragNodes plugin:
        var dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
        
        var toolTipConfig = {
            node: {
                show: 'overNode',
                hide: 'outNode',
                cssClass: 'sigma-tooltip',
                position: 'top',
                //autoadjust: true,
                renderer: function(node, template) {
                    var record = node.record;
                    
                    if(record["@class"] == "Seeker"){
                        var skillCounts = getSeekerSkillCounts(record);
                        var template = 
                        '<div class="arrow"></div>' +
                        '<div class="sigma-tooltip-header">' + 
                        '  <img src="./github.64x64.png" width="40" height="40"/>' + 
                        '     ' + (record.full_name.trim().length > 0? record.full_name : record.login) +  
                        '</div>' +
                        '<div class="sigma-tooltip-body">' +
                        '   <table>' +
                        '       <th colspan="2" class="sigma-tooltip-table-head">Top Programming Languages</th>';
                        var totalCollaborations = 0;
                        for(var i=0; i<skillCounts.length;i++){
                            if(i<5){
                                template += '      <tr><th>' + skillCounts[i].skill + '</th> <td class="sigma-tooltip-number-cell">'  + skillCounts[i].count + '</td></tr>';    
                            }
                            totalCollaborations += skillCounts[i].count;
                        }
                        
                        template += '</table>' +
                        '</div>' +
                        '<div class="sigma-tooltip-footer">Github collaborations: ' + totalCollaborations + '</div>';
                      // The function context is s.graph
                      return template;

                    }
                    else if(record["@class"] == "Meetup"){
                        var meetup = record;
                        var template = 
                        '<div class="arrow"></div>' +
                        '<div class="sigma-tooltip-header">' +
                        '  <img src="./Meetup_Large.png" width="40" height="25"/>' + 
                        '    <div>' + meetup.name  + '</div>' +
                        '</div>' +
                        '<div class="sigma-tooltip-body">' +
                        '   <div>' + meetup.desc + '</div>' +
                        '</div>' +
                        '<div class="sigma-tooltip-footer">Members in network: ' + (Math.max(meetup.name.length, meetup.count)) + '</div>';
                      // The function context is s.graph
                      return template;
                    }
                    return "";
                }
            },
            //edge: {template: 'Hello edge!'},            
        };
        var tooltipInstance = sigma.plugins.tooltips(s, s.renderers[0],toolTipConfig);
        
        s.settings({
                edgeColor: 'default',
                defaultEdgeColor: '#ccc',
                
                nodeColor: 'default',
                defaultNodeColor: 'white',
            
                animationsTime: 1000,
                drawLabels: true,

                minNodeSize: 15,
                maxNodeSize: 30,

                minEdgeSize: 3,
                maxEdgeSize: 10,

                sideMargin: 1,
                autoScale: true,
                doubleClickEnabled : false,
            
                labelAlignment: "center",
                defaultLabelColor: "black" 
            
        });
        return s;
    }

    function startForceAtlas(s){
        //sigma.layouts.killForceAtlas2();
        var fa = sigma.layouts.configForceAtlas2(s, {
            worker: true,
            autoStop: true,
            background: true,
            scaleRatio: 10,
            gravity: 1,
            easing: 'cubicInOut'
        });    
        // Start the ForceAtlas2 algorithm:
        sigma.layouts.startForceAtlas2();
    }

    function addNode(row, x, y){
        var id = row["@rid"];        
        var match = s.graph.nodes(id);
        if(match){
            return match;
        }
        
        var node = { 
            id:         id,  
            size:       row.count,
            record:     row,
            expanded:   false,

            x:          x,
            y:          y,            
        };
        
        var type = row["@class"];
        if(type == "Seeker"){
            node.image = {url: "./gh.favicon.ico"};
            node.label = "";
        }
        else if(type == "Language"){
            node.color = colorScale(node.id);
            node.label = node.record.language;
        }
        else if(type == "Meetup"){
            node.image = {url: "./meetupicon.png"};
            node.label = "";
            node.color = "white";
            node.size = 100;//(Math.max(5, node.size)) * 3;
            node.type = "square";
        }
        s.graph.addNode(node);
        return node;
    }
    
    function addEdge(from, to, isIncoming, weight){
        var from_to = from.id.toString() + "->" + to.id.toString();
        var to_from = to.id.toString() + "->" + from.id.toString();
        if(from_to in edgeCache || to_from in edgeCache){
            return;
        }
        edgeCache[from_to] = true;
        edgeCache[to_from] = true;
        
        if(isIncoming && to.record["@class"] == "Language"){
            var color = to.color;
        }
        else{
            if(isIncoming){
                var color = blueColor;
            }
            else{
                var color = redColor;
            }
        }
        
        var edge = {
              id: 'e' + s.graph.edges().length.toString(),
              // Reference extremities:
              color: color,
              source: from.id,
              target: to.id,
              type:   "arrow",
              size:    weight
        }
        s.graph.addEdge(edge);
    }
    
    function addNodeAndEdge(row, srcNode, isIncoming){
        if(s.graph.nodes(row["@rid"])){
            return;
        }
        
        if(isIncoming){
            var x = srcNode.x + (Math.random());// offset to the right to attempt to group in's and outs
        }
        else{
            var x = srcNode.x - (Math.random());
        }
        if(Math.random() > 0.5){
            var y = srcNode.y + (Math.random());
        }        
        else{
            var y = srcNode.y - (Math.random());
        }
        
        node = addNode(row, x, y);
        addEdge(isIncoming? node : srcNode, isIncoming? srcNode: node, isIncoming, row.count);        
    }

    function linkNodes(s, nodeAId, nodeBId, isIncoming, color){
        var a = s.graph.nodes(nodeAId);
        var b = s.graph.nodes(nodeBId);
        if(a && b){
            // don't link a language back to a skill
            if( (a.record["@class"] == "Language" && b.record["@class"] == "Seeker") ||
                (b.record["@class"] == "Language" && a.record["@class"] == "Seeker")){
                return false;
            }
            addEdge(isIncoming? a: b, isIncoming? b: a, isIncoming, 1);
            return true;
        }
        return false;
    }

    function connectedTo(nodeid){
        var edges = s.graph.edges();
        var nodes = [];
        var edges = [];
        var unique = {};
        for(var i= 0; i< edges.length; i++){
            var e = edges[i];
            if(e.source == nodeid){
                edges.push(e);
                if(!(e.target in unique)){
                    nodes.push(s.graph.nodes(e.target));
                    unique[e.target] = true;
                }
            }
            if(e.target == nodeid){
                edges.push(e);
                if(!(e.source in unique)){
                    nodes.push(s.graph.nodes(e.source));
                    unique[e.source] = true;
                }
            }
        }
        return {nodes: nodes, edges: edges};
    }

    function refresh(){
        s.refresh();
        startForceAtlas(s);
        // update the viewmodel
        vm.nodeClicked();
    }
    
    function addNewLinks(inResult, outResult, row){
        
        var node = s.graph.nodes(row["@rid"]);
        for(var i = 0; i< inResult.length; i++){
            var newRow = inResult[i];
            // don't add back in the same link from the source node
            if(newRow["@rid"] == row["@rid"]){
                continue;
            }                
            addNodeAndEdge(newRow, node, true);
            linkNodes(s, row["@rid"], newRow["@rid"], true, blueColor);                
        }

        if(outResult){
            for(var i = 0; i< outResult.length; i++){
                var newRow = outResult[i];
                // don't add back in the same link from the source node
                if(newRow["@rid"] == row["@rid"]){
                    continue;
                }
                addNodeAndEdge(newRow, node, false);
                linkNodes(s, row["@rid"], newRow["@rid"], false, redColor);
            }
        }
        //SH: need to call refresh once done
    };
    
    function onNodeClick(event) {
        var node = event.data.node;
        if(node.expanded){        
            return;
        }
        node.expanded = true;
        var record = node.record;
        var type = record["@class"];
        if(type == "Seeker"){
            function processLinks(inGh, outGh, inMeetup, data){
                    addNewLinks(inGh, outGh, record);
                    addNewLinks(inMeetup, null, record);
                    refresh();
            };
            queryHandler.getAllConnections(record, processLinks);
        }
        else if(type == "Meetup"){
            function processLinks(inResult, _){
                addNewLinks(inResult, null, record);
                refresh();
            }
            queryHandler.getSeekersFromMeetup(record, processLinks);
        }
        else if(type == "Language"){
            queryHandler.getSkillConnections(record, function(result){
                addNewLinks(result, null, record);
                refresh();
            });
        }
    }

    function getNodesOfType(type){
        var matches = [];
        var nodes = s.graph.nodes();
        for(var i = 0; i< nodes.length; i++){
            var node = nodes[i];
            if(node.record["@class"] == type){
                matches.push(node);
            }
        }
        return matches;
    }
    
    return {
        addNewLinks: addNewLinks,
        refresh: refresh,
        
        setViewModel: function(viewModel){
            vm = viewModel;
        },
        
        nodeCount: function(){
            if(s == null){
                return 0;
            }
            return s.graph.nodes().length;
        },
        
        getSeekers: function(){
            var seekerNodes = getNodesOfType("Seeker");
            return map(function(node){return node.record;}, seekerNodes);
        },
        
        addNewSkill: function(skill){
            var id = skill["@rid"];
            if(s.graph.nodes(id)){
                return;
            }
            
            var newSkillNode = addNode(skill, width / 2.0, height / 2.0);
            var seekerNodes = getNodesOfType("Seeker");
            
            var xs = [];
            var ys = [];
            
            for(var i = 0; i< seekerNodes.length; i++){
                var node = seekerNodes[i];
                var seeker = node.record;
                var skrSkills = getSeekerSkills(seeker);
                
                // current language matches this seeker
                if(skill.language in skrSkills){
                    var cnt = skrSkills[skill.language];
                    addEdge(node, newSkillNode, true, cnt);
                    xs.push(node.x);
                    ys.push(node.y);
                }                        
            }
            var offset = 5.0;
            newSkillNode.x = mean(xs) + (Math.random() > 0.5? offset: -offset );
            newSkillNode.y = mean(ys) + (Math.random() > 0.5? offset: -offset );
            
            s.refresh();
            startForceAtlas(s);
        },
        
        initializeGraph: function(inResult, outResult, src){

            var s = setup();

            var srcNodeIn = addNode(src, width / 2.0, height / 2.0);
            srcNodeIn.expanded = true;

            for(var i = 0; i< inResult.length; i++){
                addNodeAndEdge(inResult[i], srcNodeIn, true);
            }

            if(outResult){
                for(var i = 0; i< outResult.length; i++){
                    addNodeAndEdge(outResult[i], srcNodeIn, false);        
                }
            }
            
            // centre central node
            var nodes = s.graph.nodes();
            var totalX = 0;
            var totalY = 0;
            for(var i = 0; i< nodes.length; i++){
                totalX += nodes[i].x;
                totalY += nodes[i].y;
            }
            var meanX = totalX / nodes.length;
            var meanY = totalY / nodes.length;
            srcNodeIn.x = meanX;
            srcNodeIn.y = meanY;

            s.bind('overNode', function (event) {
                //console.log(event);
            });
            s.bind('doubleClickNode', onNodeClick);
            s.refresh();
            startForceAtlas(s);
        }
    }
};
