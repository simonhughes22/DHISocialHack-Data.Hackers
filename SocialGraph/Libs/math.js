function round(n, decimals){
    var mult = Math.pow(10, Number(decimals));
    var num = Number(n);
    return Math.round(num * mult) / mult;
}

function vectorLength(vector){
    var total = 0.0;
    for(var i = 0; i < vector.length; i++){
        var item = vector[i];
        total += (item * item);
    }
    return Math.sqrt(total);
}
