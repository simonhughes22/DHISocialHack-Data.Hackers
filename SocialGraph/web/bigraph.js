function setup(){
    if(window.s){
        window.s.kill();
    }
    
    sigma.renderers.def = sigma.renderers.canvas;    
    var s = new sigma('container');
    window.s = s;
    
    // Initialize the activeState plugin:
    
    var activeState = sigma.plugins.activeState(s);
    var keyboard = sigma.plugins.keyboard(s, s.renderers[0]);
    // Initialize the Select plugin:
    var select = sigma.plugins.select(s, activeState);
    select.bindKeyboard(keyboard);
    // Initialize the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0], activeState);
    select.bindDragNodes(dragListener);
    return s;
}

function addNodesAndLinks(s, row, srcNode, color, isSrc){
    var nodeId = "n" + s.graph.nodes().length.toString();
    s.graph.addNode({ 
        id:         nodeId,  
        size:       row.count,
        label:      row.full_name,
        seeker:     row,
        color:      color,

        x:          Math.random(),
        y:          Math.random(),
    });

    s.graph.addEdge({
          id: 'e' + s.graph.edges().length.toString(),
          // Reference extremities:
          source: isSrc? nodeId     : srcNode.id,
          target: isSrc? srcNode.id : nodeId,
          type:   "arrow",
          size: row.count
    });        
}

function renderGraph(inResult, outResult, src){
    
    var s = setup();
    
    if(inResult.length > 0){
        var nodeId = "n" + s.graph.nodes().length.toString();
        var srcNodeIn = { 
                id:         nodeId,  
                size:       5,
                label:      src.full_name,
                seeker:     src,
                color:      'rgba(31, 119, 180, 0.5)',
                x:          -2,
                y:          0,
        };
        s.graph.addNode(srcNodeIn);
    }
    
    if(outResult.length > 0){
        var nodeId = "n" + s.graph.nodes().length.toString();
        var srcNodeOut = { 
                id:         nodeId,  
                size:       5,
                label:      src.full_name,
                seeker:     src,
                color:      'rgba(152, 223, 138, 0.5)',
                x:          2,
                y:          0,
        };
        s.graph.addNode(srcNodeOut);            
    }
    
    /*if(outResult.length > 0 && inResult.length > 0){
        s.graph.addEdge({
                  id: 'e' + s.graph.edges().length.toString(),
                  // Reference extremities:
                  source: srcNodeIn.id,
                  target: srcNodeOut.id,
                  type: "arrow",
                  size: 1
        });
    }*/
    
    for(var i = 0; i< inResult.length; i++){
        addNodesAndLinks(s, inResult[i], srcNodeIn, 'rgba(31, 119, 180, 0.3)', true);
    }
    
    for(var i = 0; i< outResult.length; i++){
        addNodesAndLinks(s, outResult[i], srcNodeOut, 'rgba(152, 223, 138, 0.5)', false);
    }
    
    s.settings({
        edgeColor: 'default',
        defaultEdgeColor: '#ccc',
        animationsTime: 1000,
        drawLabels: true,
        
        minNodeSize: 5,
        maxNodeSize: 20,
        
        minEdgeSize: 1,
        maxEdgeSize: 15,
        
        sideMargin: 1,
        autoScale: true
    });
    
    s.bind('overNode', function (event) {
        //console.log(event);
    });
    s.bind('clickNode', function (event) {
        var node = event.data.node;
        
    });
    s.refresh();
    
    var fa = sigma.layouts.configForceAtlas2(s, {
        worker: true,
        autoStop: true,
        background: true,
        scaleRatio: 10,
        gravity: 3,
        easing: 'cubicInOut'
    });

    // Bind the events:
    fa.bind('start stop', function(e) {
        console.log(e.type);        
    });
    // Start the ForceAtlas2 algorithm:
    sigma.layouts.startForceAtlas2();
}