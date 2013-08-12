define(['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

this["JST"] = this["JST"] || {};

this["JST"]["stats"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),popcornMakes = locals_.popcornMakes,thimbleMakes = locals_.thimbleMakes;buf.push("<section class=\"stats\"><ul><li>" + (jade.escape((jade.interp = popcornMakes) == null ? '' : jade.interp)) + " Popcorn Makes</li><li>" + (jade.escape((jade.interp = thimbleMakes) == null ? '' : jade.interp)) + " Thimble Makes</li></ul></section>");;return buf.join("");
};

this["JST"]["tiles"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),makes = locals_.makes;buf.push("<section class=\"tile-container\"><ul class=\"tiles\">");
// iterate makes
;(function(){
  var $$obj = makes;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var make = $$obj[i];

switch (make.type){
case "webmaker":
buf.push("<li" + (jade.attrs({ "class": [("tile " + (make.type) + "")] }, {"class":true})) + ">" + (jade.escape((jade.interp = make.title) == null ? '' : jade.interp)) + "</li>");
  break;
default:
buf.push("<li class=\"tile\">" + (jade.escape((jade.interp = make.title) == null ? '' : jade.interp)) + "</li>");
  break;
}
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var make = $$obj[i];

switch (make.type){
case "webmaker":
buf.push("<li" + (jade.attrs({ "class": [("tile " + (make.type) + "")] }, {"class":true})) + ">" + (jade.escape((jade.interp = make.title) == null ? '' : jade.interp)) + "</li>");
  break;
default:
buf.push("<li class=\"tile\">" + (jade.escape((jade.interp = make.title) == null ? '' : jade.interp)) + "</li>");
  break;
}
    }

  }
}).call(this);

buf.push("</ul></section>");;return buf.join("");
};

this["JST"]["header"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),name = locals_.name;buf.push("<header><h1>" + (jade.escape((jade.interp = name) == null ? '' : jade.interp)) + "</h1><a href=\"#\">About Me</a></header>");;return buf.join("");
};

return this["JST"];

});