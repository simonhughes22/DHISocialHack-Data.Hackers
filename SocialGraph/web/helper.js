function getMembers(obj){
    var members = [];
    for (var prop in obj) {
      // important check that this is objects own property 
      // not from prototype prop inherited
      if(obj.hasOwnProperty(prop)){
        members.push(prop);
      }
    }
    return members;
}

function concatenate(array1, arrray2){
    for(var i = 0; i< arrray2.length; i++){
        var a = arrray2[i];
        array1.push(a);
    }
    return array1;
}