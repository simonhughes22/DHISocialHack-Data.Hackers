function join(delim, arr)
{
    if(arr.length == 0){
        return "";
    }
	var s = "";
	for(var i = 0; i < arr.length -1;i++)
	{
        var item = arr[i];
        if(item){
            item = item.trim();
            if(item.length > 0){
                s += item + delim;
            }
        }
	}
	s += arr[arr.length-1].trim();
	return s;
}

function toInitialCapsSingle(s)
{	
    if(!s){
        return "";
    }
	s = s.trim();
    if(s == "")
	{
		return s;
	}
	if(s.length == 3 && s[0] == "c" && s[2] == "o")
	{
		return toUpper(s);
	}
    if(s == "or" || s == "in" || s == "to" || s == "and" || s == "not")
    {
        return s;
    }
	return s[0].toUpperCase() + s.slice(1,s.length);
}

function toInitialCaps(s)
{	
    if(!s){
        return "";
    }
	s = s.trim();
	if(s == "")
	{
		return s;
	}
    s = spaces(s)
         .replace(/\//g, " / ")
         .replace(/\(/g, "( ")
         .replace(/\)/g, " )")
         .replace(/,/g, " ")
         .replace(/\s+/g, " ")
         .replace(/\s\.net\s/g, " .Net ")
         .trim();
	return join(" ",map(toInitialCapsSingle, s.split(/\s/g)));
}
// purely for map functions, obviously these are exposed on the string class directly
function toUpper(s){
    if(!s){
        return "";
    }
	return s.toUpperCase();
}

function toLower(s){
    if(!s){
        return "";
    }
	return s.toLowerCase();
}

function isNotNullOrEmpty(s){
    return s != null && s.trim() != "";
}

function trim(s){
    if(!s){
        return "";
    }
    return s.trim();
}

function spaces(s)
{
    if(!s){
        return " ";
    }
	return " " + s + " ";
}

function quote(s)
{
    if(!s || s.trim().length == 0){
        return "";
    }
	return "\"" + s + "\"";
}

function collapseSpaces(str){
    return str.replace(/\s+/g, " ") ;
}

// pass a string or an array and returns an array of strings which represent the ngrams
function getNgrams(input, ngramCount){
    if(!ngramCount){
        ngramCount = 2;
    }
    if(input.constructor == String){
        input = (collapseSpaces(input).trim()).split(" ");
    }
    var ngrams = [];
    for(var i = 0; i < input.length - ngramCount + 1; i++){
        var gram = input[i] + " ";
        for(var j = i + 1; j <= i + ngramCount-1;j++){
            gram += input[j] + " ";
        }
        ngrams.push(gram.trim());
    }
    return ngrams;
}

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ");};
String.prototype.padLeft  = function(l,c) {return Array(l-this.length+1).join(c||" ")+this;};