function forEach(fn, arr){
	for(var i = 0; i < arr.length; i++)
	{
		fn(arr[i]);
	}
}

function map(fn, arr){
	var a = new Array();
	for(var i = 0; i < arr.length; i++)
	{
		a.push(fn(arr[i]));
	}
	return a;
}

function filter(fn, arr)
{
	var a = new Array();
	for(var i = 0; i < arr.length; i++)
	{
		if(fn(arr[i]))
		{
			a.push(arr[i]);
		}
	}
	return a;
}

// predicates
function isNotNull(s){
    return s != null;
}

function unique(arr)
{
	var u = [];
	var found = {}
	for(var i = 0; i< arr.length; i++)
	{
		var item = arr[i];
        if(!item)
            continue;
        item = item.trim();
		if(!(item in found))
		{
			u.push(item);
			found[item] = 1;
		}		
	}
	return u;
}

function set(arr)
{
	var found = {}
	for(var i = 0; i< arr.length; i++)
	{
		var item = arr[i];
        if(!item)
            continue;
        item = item.trim();
		if(!(item in found))
		{
			found[item] = 1;
		}		
	}
	return found;
}

// compute a - b, a and b are arrays
function setDifference(a, b){
    var aset = {};
    // store items from a in an object (hastable)
    for(var i = 0; i<a.length; i++){
        aset[a[i].toString()] = a[i];
    }
    // remove matches in b
    for(var i = 0; i<b.length; i++){
        var bstr = b[i].toString();
        if(bstr in aset){
            delete aset[bstr];
        }
    }
    // extract the remaining items in an array
    var diff = [];
    for (var name in aset) {
        diff.push(aset[name]);
    }
    return diff;
}

// Math
function mean(arr, valueExtractor){
    if(arr.length == 0){
        return 0;
    }
    if(!valueExtractor){
        valueExtractor = function(i){ return i; };
    }
    var total = 0.0;
    for(var i = 0; i < arr.length; i++){
        total += valueExtractor(arr[i]);
    }
    return total / arr.length;
}

function median(arr, comparator){
    if(arr.length == 0){
        return 0;
    }
    if(!comparator){
        comparator = function(a,b){ return a - b; };
    }
    arr.sort(comparator);
    var midix = parseInt(arr.length / 2);
    if(midix > arr.length - 1){
        midix = arr.length-1;
    }
    if(arr.length % 2 == 0 && arr.length > 1){
        return (arr[midix-1] + arr[midix]) /2.0;
    }
    return arr[midix];
}

function sum(arr, valueExtractor){
    if(arr.length == 0){
        return 0;
    }
    if(!valueExtractor){
        valueExtractor = function(i){ return i; };
    }
    var total = 0.0;
    for(var i = 0; i < arr.length; i++){
        total += valueExtractor(arr[i]);
    }
    return total;
}

function vectorLength(arr, valueExtractor){
    if(arr.length == 0){
        return [];
    }
    if(!valueExtractor){
        valueExtractor = function(i){ return i; };
    }
    var sumSq = 0.0;
    for(var i = 0; i < arr.length; i++){
        var val = valueExtractor(arr[i]);
        sumSq += val * val;
    }
    return Math.sqrt(sumSq);
}

function unitVector(arr, valueExtractor){
    if(arr.length == 0){
        return [];
    }
    if(!valueExtractor){
        valueExtractor = function(i){ return i; };
    }
    var vecLen = vectorLength(arr, valueExtractor);
    if(vecLen == 0.0){
        return map(valueExtractor, arr);
    }
    var unit = [];
    for(var i = 0; i < arr.length; i++){
        var val = valueExtractor(arr[i]) / vecLen;
        unit.push(val);
    }
    return unit;
}

